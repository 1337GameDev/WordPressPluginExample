<?php
namespace TestPlugin {
    use TestPlugin\UtilityFunctions;
    use TestPlugin\DataClasses\AWSHelper;
    use TestPlugin\Models\ManyToMany;
    use TestPlugin\Models\ModelBase;
    use TestPlugin\AjaxFunctionClasses\Pages\Admin\testplugin_AjaxFunctions;
    use TestPlugin\Models\TestPluginModelDataHelper;

    /**
     * Class TestPlugin_AdminAjax
     *
     * A class to handle registering admin-side ajax endpoints.
     *
     * @package TestPlugin
     */
    class TestPlugin_AdminAjax {
        public static $imagesUploadSubDir = 'test_plugin'.DIRECTORY_SEPARATOR.DIRECTORY_SEPARATOR.'display_images';
        public static $imagesFilenamePrefix = 'image_';
        public static $attachmentTypeName = 'test_plugin_attachment_type';
        public static $attachmentDisplayImageType = 'display_image';
        const DEFAULT_PAGE_SIZE = 32;

        /**
         * @var array An array of strings, of names, for the endpoints that ae available to call via js
         */
        public static $exposedEndpoints = [
            "getTestAdminAjaxResponse",
            "saveObjectFields",
            "loadObjectFields",
            "loadMultipleObjects",
            "deleteObjectByField",
            "listAwsBucket",
            "uploadFile",
            "getAllAttachmentsOfType",
            "deleteAttachment",
            "getAwsUploadProgress",
            "getAwsUploadProgressFromFormUUID",
            "getAdminAWSLinkForFile"
        ];

        private static $isDebug = false;
        public static function enableDebug() {TestPlugin_AdminAjax::$isDebug = true;}
        public static function disableDebug() {TestPlugin_AdminAjax::$isDebug = false;}
        public static function isDebug():bool {return TestPlugin_AdminAjax::$isDebug;}

        //a basic test ADMiN endpoint
        public static function getTestAdminAjaxResponse() {
            check_ajax_referer('ajax-test-plugin-admin-pages', 'nonce');

            $canEdit = current_user_can(TestPlugin_Class::$ROLE_EDIT_CAPABILITY);
            $receivedParam = $_POST['param'];

            $success = true;
            $message = "Successfully called an admin ajax function on the server. Usercanedit: " . $canEdit . " Received: " . $receivedParam;
            $result = array();

            // generate the response
            $response = new AjaxResponse(
                $success,
                $result,
                $message
            );
            JSONHelper::send_json_response($response,'ajax-test-plugin-admin-pages');
        }

        //be careful with this method
        //ensure fields saved SHOULD be able to be saved by the user (secure fields for that model)
        //eg: a standard admin user being able to edit fields that only "super admins" should edit
        public static function saveObjectFields() {
            check_ajax_referer('ajax-test-plugin-admin-pages', 'nonce');
            $canEdit = current_user_can(TestPlugin_Class::$ROLE_EDIT_CAPABILITY);
            $userID = get_current_user_id();

            $response = new AjaxResponse(
                false
            );
            $requiredParams = ['object','fieldsvalues','id'];

            try {
                if($canEdit){
                    if(TestPlugin_AdminAjax::isDebug()) {
                        error_log("----------------------------- TestPlugin_AdminAjax:saveObjectFields -----------------------------");
                    }
                    $preparedJson = JSONHelper::decode_from_json($_POST['param']);

                    if(TestPlugin_AdminAjax::isDebug()) {
                        error_log('preparedJSON:'.print_r($preparedJson,true));
                    }

                    if(UtilityFunctions::array_keys_exists($requiredParams,$preparedJson)){
                        $objectName = $preparedJson['object'];
                        $fieldsAndValues = $preparedJson['fieldsvalues'];
                        $objID = $preparedJson['id'];
                        $userID = get_current_user_id();

                        $modelObj = TestPluginModelDataHelper::instantiateByName($objectName);
                        if($modelObj !== NULL){
                            //get db instance
                            $dbHelper = TestPlugin_Class::getExternalConnection(TestPlugin_Class::TESTPLUGIN_PDO_DB_KEY);
                            $fieldsToSave = array_keys($fieldsAndValues);
                            $fieldsToSave[] = "lastUserModified";

                            ModelBase::populateFromArray($modelObj, $fieldsAndValues);
                            $modelObj->id = $objID;
                            $modelObj->lastUserModified = $userID;

                            if(TestPlugin_AdminAjax::isDebug()){
                                $msg = "Model to save:".print_r($modelObj, true);
                                error_log($msg);
                                $response->addMessage($msg);
                            }
                            $dbResult = $modelObj->save($dbHelper, $fieldsToSave);

                            if($dbResult->success) {
                                $response->success = true;
                                $response->result = $modelObj;
                            } else {
                                if(TestPlugin_AdminAjax::isDebug()){
                                    $response->addMessage("The model did not save correctly. The supplied params are included in the result.");
                                    $response->addMessage($dbResult->getMessages());
                                } else {
                                    $response->addMessage("There was an error saving the model.");
                                }
                                $response->result = $preparedJson;
                            }
                        } else {
                            $msg = "The model class could not be created. The supplied params are included in the result.";
                            if(TestPlugin_AdminAjax::isDebug()){
                                error_log($msg);
                            }

                            $response->addMessage($msg);
                            $response->result = $preparedJson;
                        }
                    } else {
                        $msg = "The parameters \"".implode('", "',$requiredParams)."\" were not provided.";
                        if(TestPlugin_AdminAjax::isDebug()){
                            error_log($msg);
                        }
                        $response->addMessage($msg);
                        $response->result = $preparedJson;
                    }
                } else {
                    $msg = "The current user is not allowed to edit.";
                    if(TestPlugin_AdminAjax::isDebug()){
                        error_log($msg);
                    }
                    $response->addMessage($msg);
                }
            } catch (\Exception $e){
                if(TestPlugin_AdminAjax::isDebug()){
                    error_log("An error occurred when saving the object fields:".$e->getMessage());
                }
                $response->addMessage("A server error occurred when saving the object fields. The provided parameters were:".print_r($_POST['param'], true));
            }

            JSONHelper::send_json_response($response,'ajax-test-plugin-admin-pages');
        }

        //Be careful with this method - as this is dynamic and you want to validate the user can modify the objects they intend
        //An endpoint to save AND delete many-to-many objects, given a name.
        //The pairs to delete are the ID pairings, for each "side" of the many-to-many relationship
        public static function saveDeleteManyToManyObjects() {
            check_ajax_referer('ajax-test-plugin-admin-pages', 'nonce');
            $canEdit = current_user_can(TestPlugin_Class::$ROLE_EDIT_CAPABILITY);
            $response = new AjaxResponse(
                false
            );
            $userID = get_current_user_id();

            //object will be this many-to-many model name
            //pairs_to_delete will contain the from_id and the to_id's to delete (key is "from" ID, value is "to" ID)
            $requiredParams = ['object','pairs_to_delete','pairs_to_save'];

            try {
                if($canEdit){
                    if(TestPlugin_AdminAjax::isDebug()) {
                        error_log("----------------------------- TestPlugin_AdminAjax:saveObjectFields -----------------------------");
                    }
                    $preparedJson = JSONHelper::decode_from_json($_POST['param']);

                    //if(array_key_exists('object', $preparedJson) && array_key_exists('fieldsvalues', $preparedJson) && array_key_exists('id', $preparedJson)){
                    if(UtilityFunctions::array_keys_exists($requiredParams,$preparedJson)){
                        $objectName = $preparedJson['object'];
                        $pairsToDelete = $preparedJson['pairs_to_delete'];
                        $pairsToSave = $preparedJson['pairs_to_save'];
                        $userID = get_current_user_id();

                        $modelObj = TestPluginModelDataHelper::instantiateByName($objectName);
                        if($modelObj !== NULL){
                            if($modelObj instanceof ManyToMany){
                                $className = $modelObj::getStaticClassname();
                                $fromFieldName = $modelObj::getFromFieldName();
                                $toFieldName = $modelObj::getToFieldName();

                                //get db instance
                                $dbHelper = TestPlugin_Class::getExternalConnection(TestPlugin_Class::TESTPLUGIN_PDO_DB_KEY);
                                $dbHelper->beginTransaction();
                                $rollback = false;
                                //delete the ones in the "pairsToDelete" array
                                foreach($pairsToDelete as $pair){
                                    $fromCondition = new FieldCondition($fromFieldName, $pair["from"]);
                                    $toCondition = new FieldCondition($toFieldName, $pair["to"]);

                                    $result = $modelObj::deleteByMultiple($dbHelper, true, $fromCondition, $toCondition);
                                    if(!$result->success) {
                                        $response->addMessage("There was an error deleting the model \"".$className."\" with the from/to pair IDs of [".$pair["from"].",".$pair["to"]."].");
                                        if(TestPlugin_AdminAjax::isDebug()) {
                                            $response->addMessage($result->getMessages());
                                        }
                                        $rollback = true;
                                        break;
                                    }
                                }

                                if(!$rollback) {
                                    $modelsToSave = [];
                                    foreach($pairsToSave as $pair) {
                                        $newModel = TestPluginModelDataHelper::instantiateByName($objectName);
                                        $newModel->$fromFieldName = $pair["from"];
                                        $newModel->$toFieldName = $pair["to"];
                                        $newModel->id = null;
                                        $newModel->lastUserModified = $userID;
                                        $modelsToSave[] = $newModel;
                                    }

                                    $result = $modelObj::saveManyToManyModel($dbHelper, $modelsToSave, [], true);
                                    if(!$result->success) {
                                        $response->addMessage("There was an error saving the \"".$className."\" model objects.");
                                        if(TestPlugin_AdminAjax::isDebug()){
                                            $response->addMessage($result->getMessages());
                                        }
                                        $rollback = true;
                                    } else {
                                        $response->success = true;
                                        $response->result = $result->result;
                                    }
                                }

                                if($rollback) {
                                    $dbHelper->rollbackTransaction();
                                } else {
                                    $dbHelper->commitTransaction();
                                }
                            }
                        } else {
                            $msg = "The model class could not be created. The supplied params are included in the result.";
                            if(TestPlugin_AdminAjax::isDebug()){
                                error_log($msg);
                            }

                            $response->addMessage($msg);
                            $response->result = $preparedJson;
                        }
                    } else {
                        $msg = "The parameters \"".implode('", "',$requiredParams)."\" were not provided.";
                        if(TestPlugin_AdminAjax::isDebug()){
                            error_log($msg);
                        }
                        $response->addMessage($msg);
                        $response->result = $preparedJson;
                    }
                } else {
                    $msg = "The current user is not allowed to edit.";
                    if(TestPlugin_AdminAjax::isDebug()){
                        error_log($msg);
                    }
                    $response->addMessage($msg);
                }
            } catch (\Exception $e){
                if(TestPlugin_AdminAjax::isDebug()){
                    error_log("An error occurred when saving the object fields:".$e->getMessage());
                }
                $response->addMessage("A server error occurred when saving the object fields. The provided parameters were:".print_r($_POST['param'], true));
            }

            JSONHelper::send_json_response($response,'ajax-test-plugin-admin-pages');
        }

        //load an object, as well as a list of fields for the objects to load
        public static function loadObjectFields() {
            check_ajax_referer('ajax-test-plugin-admin-pages', 'nonce');
            $canLoad = current_user_can(TestPlugin_Class::$ROLE_VIEW_CAPABILITY);

            $response = new AjaxResponse(
                false
            );

            $userID = get_current_user_id();

            $requiredParams = ['object','fields','by','value'];

            try {
                if($canLoad){
                    $preparedJson = JSONHelper::decode_from_json($_POST['param']);

                    //if(array_key_exists('object', $preparedJson) && array_key_exists('fieldsvalues', $preparedJson) && array_key_exists('id', $preparedJson)){
                    if(UtilityFunctions::array_keys_exists($requiredParams,$preparedJson)){
                        $objectName = $preparedJson['object'];
                        $fields = $preparedJson['fields'];
                        $by = $preparedJson['by'];
                        $value = $preparedJson['value'];
                        $userID = $preparedJson['userid'];

                        $modelObj = TestPluginModelDataHelper::instantiateByName($objectName);
                        if($modelObj !== NULL){
                            //get db instance
                            $dbHelper = TestPlugin_Class::getExternalConnection(TestPlugin_Class::TESTPLUGIN_PDO_DB_KEY);                            $fieldsToLoad = $fields;
                            ModelBase::populateFromArray($modelObj,[$by => $value]);
                            $success = $modelObj->loadBy($by,$dbHelper,true,$fieldsToLoad);

                            if($success) {
                                $response->success = true;
                                $response->result = $modelObj;
                            } else {
                                $response->addMessage("There was an error loading the model.");
                                $response->result = $preparedJson;
                            }
                        } else {
                            $response->addMessage("The model class could not be created. The supplied params are included in the result.");
                            $response->result = $preparedJson;
                        }
                    } else {
                        $response->addMessage("The parameters \"".implode('", "',$requiredParams)."\" were not provided.");
                        $response->result = $preparedJson;
                    }
                } else {
                    $response->addMessage("The current user is not allowed to edit.");
                }
            } catch (\Exception $e){
                if(TestPlugin_AdminAjax::isDebug()){
                    error_log("An error occurred when loading the object fields:" . $e->getMessage());
                }
                $response->addMessage("A server error occurred when loading the object fields. The provided parameters were:".print_r($_POST['param'], true));
            }

            JSONHelper::send_json_response($response,'ajax-test-plugin-admin-pages');
        }

        //an endpoint to load multiple objects - with paging
        public static function loadMultipleObjects() {
            check_ajax_referer('ajax-test-plugin-admin-pages', 'nonce');
            $canLoad = current_user_can(TestPlugin_Class::$ROLE_VIEW_CAPABILITY);
            $userID = get_current_user_id();

            $response = new AjaxResponse();
            $requiredParams = ['object','fields','conditions', 'page', 'order_by'];

            try {
                if($canLoad){
                    $preparedJson = JSONHelper::decode_from_json($_POST['param']);

                    if(UtilityFunctions::array_keys_exists($requiredParams, $preparedJson)){
                        $objectName = $preparedJson['object'];
                        $fields = $preparedJson['fields'];
                        $conditions = $preparedJson['conditions'];
                        $page = $preparedJson['page'];
                        $orderBy = $preparedJson['order_by'];

                        if(TestPluginModelDataHelper::isModelName($objectName)) {
                            //get db instance
                            $dbHelper = TestPlugin_Class::getExternalConnection(TestPlugin_Class::TESTPLUGIN_PDO_DB_KEY);                            $fieldsToLoad = $fields;
                            $conditionObjects = FieldCondition::createFromArrays($conditions);

                            if(TestPlugin_AdminAjax::isDebug()){
                                error_log('conditions data:' . print_r($conditions, true));
                                error_log('condition object array' . print_r($conditionObjects, true));
                            }

                            $fullClassName = ModelBase::getStaticNamespace().'\\'.$objectName;
                            $dbResult = call_user_func($fullClassName.'::loadAllBy',$dbHelper, true, $fieldsToLoad, $page, TestPlugin_AdminAjax::DEFAULT_PAGE_SIZE, $orderBy, ...$conditionObjects);

                            if($dbResult->success) {
                                $response->success = true;
                                $response->result = $dbResult->result['results'];
                            } else {
                                $response->addMessage("There was an error loading the models.");
                                $response->result = $preparedJson;
                            }
                        } else {
                            $response->addMessage("The model class could not be created. The supplied params are included in the result.");
                            $response->result = $preparedJson;
                        }
                    } else {
                        $response->addMessage("The parameters \"".implode('", "',$requiredParams)."\" were not provided.");
                        $response->result = $preparedJson;
                    }
                } else {
                    $response->addMessage("The current user is not allowed to edit.");
                }
            } catch (\Exception $e){
                if(TestPlugin_AdminAjax::isDebug()){
                    error_log("An error occurred when loading multiple objects:" . $e->getMessage());
                }
                $response->addMessage("A server error occurred when loading multiple objects. The provided parameters were:".print_r($_POST['param'], true));
            }

            JSONHelper::send_json_response($response,'ajax-test-plugin-admin-pages');
        }

        //delete an object, based on a field and a value of that field
        public static function deleteObjectByField() {
            check_ajax_referer('ajax-test-plugin-admin-pages', 'nonce');
            $canEdit = current_user_can(TestPlugin_Class::$ROLE_EDIT_CAPABILITY);
            $response = new AjaxResponse(
                false
            );
            $userID = get_current_user_id();

            $requiredParams = ['object','field','value'];

            try {
                if($canEdit){
                    if(TestPlugin_AdminAjax::isDebug()) {
                        error_log("----------------------------- TestPlugin_AdminAjax:deleteObjectByField -----------------------------");
                    }
                    $preparedJson = JSONHelper::decode_from_json($_POST['param']);

                    //if(array_key_exists('object', $preparedJson) && array_key_exists('fieldsvalues', $preparedJson) && array_key_exists('id', $preparedJson)){
                    if(UtilityFunctions::array_keys_exists($requiredParams,$preparedJson)){
                        $objectName = $preparedJson['object'];
                        $field = $preparedJson['field'];
                        $fieldValue = $preparedJson['value'];

                        if(!empty($objectName) && !empty($field) && !empty($fieldValue)) {
                            $modelObj = TestPluginModelDataHelper::instantiateByName($objectName);
                            if($modelObj !== NULL) {
                                //get db instance
                                $dbHelper = TestPlugin_Class::getExternalConnection(TestPlugin_Class::TESTPLUGIN_PDO_DB_KEY);

                                if(TestPlugin_Class::isDebug()){
                                    $response->addMessage("Model received to delete:" . print_r($modelObj, true));
                                }

                                if($modelObj->hasProperty($field)){
                                    $modelObj->$field = $fieldValue;
                                    $success = $modelObj->deleteBy($field, $dbHelper);

                                    if($success){
                                        $response->success = true;
                                    } else {
                                        $msg = "There was an error deleting the model \"".$objectName."\".";
                                        if(TestPlugin_AdminAjax::isDebug()) {
                                            error_log($msg);
                                        }
                                        $response->addMessage($msg);
                                        $response->result = $preparedJson;
                                    }
                                } else {
                                    $msg = "The field \"".$field."\" was not present on the object \"".$objectName."\".";
                                    if(TestPlugin_AdminAjax::isDebug()) {
                                        error_log($msg);
                                    }

                                    $response->addMessage($msg);
                                    $response->result = $preparedJson;
                                }
                            } else {
                                $msg = "The model could not be deleted. The supplied params are included in the result.";
                                if(TestPlugin_AdminAjax::isDebug()) {
                                    error_log($msg);
                                }

                                $response->addMessage($msg);
                                $response->result = $preparedJson;
                            }
                        } else {
                            $msg = "The parameters \"".implode('", "',$requiredParams)."\" had some empty values.";
                            if(TestPlugin_AdminAjax::isDebug()) {
                                error_log($msg);
                            }

                            $response->addMessage($msg);
                            $response->result = $preparedJson;
                        }
                    } else {
                        $msg = "The parameters \"".implode('", "',$requiredParams)."\" were not provided.";
                        if(TestPlugin_AdminAjax::isDebug()) {
                            error_log($msg);
                        }

                        $response->addMessage($msg);
                        $response->result = $preparedJson;
                    }
                } else {
                    $response->addMessage("The current user is not allowed to edit.");
                }
            } catch (\Exception $e){
                if(TestPlugin_AdminAjax::isDebug()){
                    error_log("An error occurred when deleting the object:" . $e->getMessage());
                }
                $response->addMessage("A server error occurred when deleting the object fields. The provided parameters were:".print_r($_POST['param'], true));
            }

            JSONHelper::send_json_response($response,'ajax-test-plugin-admin-pages');
        }

        //list the contents of an AWS S3 bucket
        public static function listAwsBucket(){
            check_ajax_referer('ajax-test-plugin-admin-pages', 'nonce');
            $canList = current_user_can(TestPlugin_Class::$ROLE_VIEW_CAPABILITY);

            $response = new AjaxResponse();
            $requiredParams = [];

            if($canList){
                $preparedJson = JSONHelper::decode_from_json($_POST['param']);

                if(UtilityFunctions::array_keys_exists($requiredParams, $preparedJson)){
                    $userID = get_current_user_id();

                    $awsConfig = JSONHelper::load_json_file("aws_config_rw", TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR."Config");
                    $s3Config = JSONHelper::load_json_file("aws_s3", TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR."Config");
                    $rdsConfig = JSONHelper::load_json_file("aws_rds_rw", TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR."Config");

                    if(($awsConfig !== NULL) && ($s3Config !== NULL) && ($rdsConfig !== NULL)){
                        try {
                            $awsHelper = new AWSHelper($awsConfig, $s3Config, $rdsConfig);
                            $contents = $awsHelper->getS3Helper()->getAllBucketContents();
                            $response->success = true;
                            $response->result = $contents;
                        } catch(\Exception $e) {
                            $response->addMessage("Unable to instantiate AWS helper.");
                        }
                    } else {
                        $response->addMessage("Unable to load AWS and S3 config files.");
                    }
                } else {
                    $response->addMessage("The parameters \"".implode('", "',$requiredParams)."\" were not provided.");
                    $response->result = $preparedJson;
                }
            } else {
                $response->addMessage("The current user is not allowed to edit.");
            }

            JSONHelper::send_json_response($response,'ajax-test-plugin-admin-pages');
        }

        //uploads a file
        //can be customized for different file upload types, as well as sending to AWS S3 or the like
        public static function uploadFile(){
            check_ajax_referer('ajax-test-plugin-admin-pages', 'nonce');
            $canEdit = current_user_can(TestPlugin_Class::$ROLE_EDIT_CAPABILITY);

            $response = new AjaxResponse();
            $requiredParams = [];

            try {
                if($canEdit){
                    $preparedJson = JSONHelper::decode_from_json($_POST['param']);
                    if(UtilityFunctions::array_keys_exists($requiredParams, $preparedJson)) {
                        if(isset($_FILES["files"]) && !empty($_FILES["files"])) {
                            //check for error in upload
                            //will return an array of exception classes of type "UploadException"
                            $systemErrors = FileUploadHelper::getUploadedFilesSystemErrors($_FILES["files"]);
                            if(empty($systemErrors)){
                                //allowexts, rejectedexts, allowedcats, rejectcategories, sizeInMegabytes, $customCallback
                                //allow ONLY files in the "image" category, with file sizes less than 10mb
                                $validateOptions = new FileValidationOptions([], [], ['image'], [], 5);
                                $validationResult = FileUploadHelper::validateFiles($_FILES["files"], $validateOptions);
                                if($validationResult->success){
                                    $allFiles = FileUploadHelper::reformatUploadedFilesArray($_FILES["files"]);
                                    $fullImagesPath = WPUploadHelper::getUploadsDir().DIRECTORY_SEPARATOR.TestPlugin_AdminAjax::$imagesUploadSubDir;

                                    if(FileUploadHelper::createDirIfNotExists($fullImagesPath)){
                                        $userID = get_current_user_id();

                                        foreach($allFiles as $file){
                                            $newFileName = TestPlugin_AdminAjax::$imagesFilenamePrefix.FileUploadHelper::makeSimplifiedFileName($file["name"]);

                                            //determine if file already exists, based off of attachment meta data
                                            $imagePostInfo = WPUploadHelper::getAttachmentIDFromFilename(TestPlugin_AdminAjax::$imagesUploadSubDir.DIRECTORY_SEPARATOR.$newFileName, TestPlugin_AdminAjax::$imagesUploadSubDir, TestPlugin_AdminAjax::$imagesFilenamePrefix);

                                            if(empty($imagePostInfo)){
                                                //not a duplicate, so find next file number, and then
                                                $nextFileNumber = FileUploadHelper::getNextFileNumber($fullImagesPath,true);
                                                $newFileName .= '_'.$nextFileNumber.'.'.pathinfo($file["name"], PATHINFO_EXTENSION);
                                                $savedFile = FileUploadHelper::moveUploadedFileToDir($file,$newFileName, $fullImagesPath, true);
                                                if($savedFile) {
                                                    $attachment = WPUploadHelper::addAttachment($newFileName, $file["name"], TestPlugin_AdminAjax::$imagesUploadSubDir,
                                                        [
                                                            "uploaded_user_id"=>$userID,
                                                            TestPlugin_AdminAjax::$attachmentTypeName=>TestPlugin_AdminAjax::$attachmentDisplayImageType
                                                        ]
                                                    );

                                                    if(FileUploadHelper::isDebug()){
                                                        error_log('Uploaded attachment:' . print_r($attachment, true));
                                                    }

                                                    if(!empty($attachment) && array_key_exists("post", $attachment) && array_key_exists("ID", $attachment["post"]) && !empty($attachment["post"]["ID"]) ){
                                                        $response->success = true;
                                                        $response->result = $attachment;
                                                    } else {
                                                        $response->addMessage("The attachment wasn't able to be saved.");
                                                    }
                                                } else {
                                                    $response->addMessage("Unable to move file to \"".$fullImagesPath.DIRECTORY_SEPARATOR.$newFileName."\".");
                                                }
                                            } else {//duplicate file
                                                $msg = "Duplicate file:" . TestPlugin_AdminAjax::$imagesUploadSubDir . DIRECTORY_SEPARATOR . $newFileName;
                                                if(TestPlugin_AdminAjax::isDebug()){
                                                    error_log($msg);
                                                }
                                                $response->addMessage($msg);
                                            }
                                        }
                                    } else {//cannot create directory to move uploaded files
                                        if(TestPlugin_AdminAjax::isDebug()){
                                            error_log("Unable to create directory: " . $fullImagesPath);
                                        }
                                        $response->addMessage("Unable to create directory: " . $fullImagesPath);
                                    }
                                } else {//validation errors
                                    if(TestPlugin_AdminAjax::isDebug()){
                                        error_log(print_r($validationResult->message, true));
                                    }
                                    $response->addMessage($validationResult->message);
                                }
                            } else {
                                //system errors of uploaded files
                                if(TestPlugin_AdminAjax::isDebug()){
                                    error_log("System errors when uploading:" . print_r($systemErrors, true));
                                }
                                foreach($systemErrors as $systemError) {
                                    $response->addMessage($systemError->getMessage());
                                }
                            }
                        } else {
                            $response->addMessage("There were no files uploaded.");
                            if(TestPlugin_AdminAjax::isDebug()){
                                error_log("There were no files uploaded.");
                            }
                        }
                    } else {//parameters missing
                        $response->addMessage("The parameters \"".implode('", "',$requiredParams)."\" were not provided.");
                        $response->result = $preparedJson;
                    }
                } else {
                    if(TestPlugin_AdminAjax::isDebug()){
                        error_log("The current user is not allowed to edit.");
                    }
                    $response->addMessage("The current user is not allowed to edit.");
                }
            } catch (\Exception $e){
                if(TestPlugin_AdminAjax::isDebug()){
                    error_log("An error occurred when uploading a record display image:" . $e->getMessage());
                }
                $response->addMessage("A server error was encountered when handling the uploaded record display image. See the log for details. The provided parameters were:".print_r($_POST['param'], true));
            }

            JSONHelper::send_json_response($response,'ajax-test-plugin-admin-pages');
        }

        //get all attachments in the datbase, given a post_meta attachment_type value associated with an attachment
        public static function getAllAttachmentsOfType(){
            check_ajax_referer('ajax-test-plugin-admin-pages', 'nonce');
            $canFetch = current_user_can(TestPlugin_Class::$ROLE_VIEW_CAPABILITY);
            $userID = get_current_user_id();

            $response = new AjaxResponse();
            $requiredParams = ['attachment_type'];

            try {
                if($canFetch){
                    $preparedJson = JSONHelper::decode_from_json($_POST['param']);
                    if(UtilityFunctions::array_keys_exists($requiredParams, $preparedJson)) {
                        $type = $preparedJson['attachment_type'];

                        $attachmentInfo = WPUploadHelper::getAttachmentsOfMetaType(TestPlugin_AdminAjax::$attachmentTypeName, $type);
                        $response->result = $attachmentInfo;
                        $response->success = true;

                    } else {//parameters missing
                        $response->addMessage("The parameters \"".implode('", "',$requiredParams)."\" were not provided.");
                        $response->result = $preparedJson;
                    }
                } else {
                    if(TestPlugin_AdminAjax::isDebug()){
                        error_log("The current user is not allowed to edit.");
                    }
                    $response->addMessage("The current user is not allowed to edit.");
                }
            } catch (\Exception $e){
                if(TestPlugin_AdminAjax::isDebug()){
                    error_log("An error occurred when uploading a record display image:" . $e->getMessage());
                }
                $response->addMessage("A server error was encountered when handling the uploaded record display image. See the log for details. The provided parameters were:".print_r($_POST['param'], true));
            }

            JSONHelper::send_json_response($response,'ajax-test-plugin-admin-pages');
        }

        //deletes an attachment form the database / filesystem
        public static function deleteAttachment(){
            check_ajax_referer('ajax-test-plugin-admin-pages', 'nonce');
            $canEdit = current_user_can(TestPlugin_Class::$ROLE_EDIT_CAPABILITY);
            $userID = get_current_user_id();

            $response = new AjaxResponse();
            $requiredParams = ['attachment_id','check_usages'];

            try {
                if($canEdit){
                    $preparedJson = JSONHelper::decode_from_json($_POST['param']);
                    if(UtilityFunctions::array_keys_exists($requiredParams, $preparedJson)) {
                        $attachmentID = $preparedJson['attachment_id'];
                        $checkUsages = $preparedJson['check_usages'];

                        if(!empty($attachmentID) && UtilityFunctions::isInteger($attachmentID)){
                            $attachment = WPUploadHelper::getAttachmentInfoFromPostIDs([$attachmentID]);

                            if(!empty($attachment)){
                                //now do any deletes and other operations here...
                                $response->success = true;

                            } else {
                                $response->addMessage("The attachment with id of \"" . $attachmentID . "\" was not found.");
                            }
                        } else {
                            $response->addMessage("The attachment id of \"".$attachmentID."\" to delete was invalid.");
                        }
                    } else {//parameters missing
                        $response->addMessage("The parameters \"".implode('", "',$requiredParams)."\" were not provided.");
                        $response->result = $preparedJson;
                    }
                } else {
                    if(TestPlugin_AdminAjax::isDebug()){
                        error_log("The current user is not allowed to edit.");
                    }
                    $response->addMessage("The current user is not allowed to edit.");
                }
            } catch (\Exception $e){
                if(TestPlugin_AdminAjax::isDebug()){
                    error_log("An error occurred when deleting the attachment:" . $e->getMessage());
                }
                $response->addMessage("A server error was encountered when deleting the attachment. See the log for details. The provided parameters were:".print_r($_POST['param'], true));
            }

            JSONHelper::send_json_response($response,'ajax-test-plugin-admin-pages');
        }

        //given an objectid, get the AWS file upload progress stored in session, waiting to be fetched by AJAX
        public static function getAwsUploadProgress(){
            check_ajax_referer('ajax-test-plugin-admin-pages', 'nonce');
            $canFetch = current_user_can(TestPlugin_Class::$ROLE_VIEW_CAPABILITY);
            $userID = get_current_user_id();

            $response = new AjaxResponse();
            $requiredParams = [
                'objectid'
            ];

            try {
                if($canFetch) {
                    $preparedJson = JSONHelper::decode_from_json($_POST['param']);
                    if(UtilityFunctions::array_keys_exists($requiredParams, $preparedJson)) {
                        testplugin_AjaxFunctions::getAwsUploadProgress($response, $preparedJson);
                    } else {//parameters missing
                        $response->addMessage("The parameters \"".implode('", "',array_diff($requiredParams, $preparedJson))."\" were not provided to \"getAwsUploadProgress.\"");
                        $response->result = $preparedJson;
                    }
                } else {
                    if(TestPlugin_AdminAjax::isDebug()){
                        error_log("The current user is not allowed to edit.");
                    }
                    $response->addMessage("The current user is not allowed to edit.");
                }
            } catch (\Exception $e) {
                if(TestPlugin_AdminAjax::isDebug()){
                    error_log("An error occurred when getting the AWS S3 upload progress:" . $e->getMessage());
                }
                $response->addMessage("A server error was encountered when getting the AWS S3 upload progress for a resource+resource version. See the log for details. The provided parameters were:".print_r($_POST['param'], true));
            }

            JSONHelper::send_json_response($response,'ajax-test-plugin-admin-pages');
        }

        //given a form UUID, get the AWS file upload progress stored in session, waiting to be fetched by AJAX
        public static function getAwsUploadProgressFromFormUUID(){
            check_ajax_referer('ajax-test-plugin-admin-pages', 'nonce');
            $canFetch = current_user_can(TestPlugin_Class::$ROLE_VIEW_CAPABILITY);
            $userID = get_current_user_id();

            $response = new AjaxResponse();
            $requiredParams = [
                'form-uuid'
            ];

            try {
                if($canFetch) {
                    $preparedJson = JSONHelper::decode_from_json($_POST['param']);
                    if(UtilityFunctions::array_keys_exists($requiredParams, $preparedJson)) {
                        testplugin_AjaxFunctions::getAwsUploadProgressFromFormUUID($response, $preparedJson);
                    } else {//parameters missing
                        $response->addMessage("The parameters \"".implode('", "',array_diff($requiredParams, $preparedJson))."\" were not provided to \"getAwsUploadProgressFromFormUUID.\"");
                        $response->result = $preparedJson;
                    }
                } else {
                    if(TestPlugin_AdminAjax::isDebug()){
                        error_log("The current user is not allowed to edit.");
                    }
                    $response->addMessage("The current user is not allowed to edit.");
                }
            } catch (\Exception $e) {
                if(TestPlugin_AdminAjax::isDebug()){
                    error_log("An error occurred when getting the AWS S3 upload progress from a form UUID:" . $e->getMessage());
                }
                $response->addMessage("A server error was encountered when getting the AWS S3 upload progress from a form UUID. See the log for details. The provided parameters were:".print_r($_POST['param'], true));
            }

            JSONHelper::send_json_response($response,'ajax-test-plugin-admin-pages');
        }

        //get the AWS S3 signed access link for the given file for a 'recordid' value
        public static function getAdminAWSLinkForFile() {
            check_ajax_referer('ajax-test-plugin-admin-pages', 'nonce');
            $canFetch = current_user_can(TestPlugin_Class::$ROLE_VIEW_CAPABILITY);

            $response = new AjaxResponse();
            $userID = get_current_user_id();

            $receivedParam = $_POST['param'];

            $requiredParams = ['recordid'];
            try {
                if($canFetch) {
                    $preparedJson = JSONHelper::decode_from_json($receivedParam);
                    if(UtilityFunctions::array_keys_exists($requiredParams, $preparedJson)){
                        $recordID = $preparedJson['recordid'];
                        $response = testplugin_AjaxFunctions::getAWSLinkForFile($response, $recordID);
                    } else {//parameters missing
                        $response->addMessage("The parameters \"".implode('", "',$requiredParams)."\" were not provided.");
                        $response->result = $preparedJson;
                    }
                } else {
                    if(TestPlugin_AdminAjax::isDebug()){
                        error_log("The current user is not allowed to get adminAWS S3 file links.");
                    }
                    $response->addMessage("The current user is not allowed to get admin AWS S3 file links.");
                }
            } catch (\Exception $e) {
                if(TestPlugin_AdminAjax::isDebug()){
                    error_log("An error occurred when getting the admin record aws link:" . $e->getMessage());
                }
                $response->addMessage("A server error was encountered when getting the admin record aws link. See the log for details. The provided parameters were:".print_r($_POST['param'], true));
            }

            JSONHelper::send_json_response($response);
        }
    }
}

