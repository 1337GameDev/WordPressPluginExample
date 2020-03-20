<?php
namespace TestPlugin {

    use TestPlugin\AjaxFunctionClasses\Pages\User\testpluginuser_AjaxFunctions;
    use TestPlugin\UtilityFunctions;
    use TestPlugin\AjaxResponse;
    use TestPlugin\JSONHelper;
    use TestPlugin\TestPlugin_Class;
    use TestPlugin\FieldCondition;

    /**
     * Class TestPlugin_UserAjax
     *
     * A class to handle registering user-side ajax endpoints.
     *
     * @package TestPlugin
     */
    class TestPlugin_UserAjax {
        private static $isDebug = false;
        public static function enableDebug() {TestPlugin_UserAjax::$isDebug = true;}
        public static function disableDebug() {TestPlugin_UserAjax::$isDebug = false;}
        public static function isDebug():bool {return TestPlugin_UserAjax::$isDebug;}

        /**
         * @var array An array of strings, of names, for the endpoints that ae available to call via js
         */
        public static $exposedEndpoints = [
            "getTestUserAjaxResponse",
            "getAWSLinkForFile",
            "getStoredStrings",
            "getSettings"
        ];

        //a basic test endpoint
        public static function getTestUserAjaxResponse() {
            $canEdit = current_user_can(TestPlugin_Class::$ROLE_EDIT_CAPABILITY);
            $receivedParam = $_POST['param'];

            $success = true;
            $message = "Successfully called a user ajax function on the server. Usercanedit: " . $canEdit . " Received: " . $receivedParam;
            $result = array();

            // generate the response
            $response = new AjaxResponse(
                $success,
                $result,
                $message
            );
            JSONHelper::send_json_response($response);
        }

        //gets a signed AWS link, given a filename in an s3 bucket
        public static function getAWSLinkForFile() {
            $response = new AjaxResponse();
            $receivedParam = $_POST['param'];

            if(TestPlugin_UserAjax::isDebug()){
                error_log('$receivedParam:' . print_r($receivedParam, true));
            }

            $requiredParams = ['recordID'];
            try {
                $preparedJson = JSONHelper::decode_from_json($_POST['param']);
                if(UtilityFunctions::array_keys_exists($requiredParams, $preparedJson)){
                    if(TestPlugin_UserAjax::isDebug()){
                        error_log('params all present');
                    }

                    $userAllowedtoAccessPrivate = current_user_can(TestPlugin_Class::$ROLE_VIEW_CAPABILITY);
                    $pdoDBConnection = TestPlugin_Class::getExternalConnection(TestPlugin_Class::TESTPLUGIN_PDO_DB_KEY);

                    if(TestPlugin_UserAjax::isDebug()){
                        error_log('after pdoDBConnection fetching');
                    }

                    $recordID = $preparedJson['recordID'];

                    if(TestPlugin_UserAjax::isDebug()){
                        error_log('recordID:' . print_r($recordID, true));
                    }

                    //a boolean that would be fetched from the db / data to indicate a record's S3 file link is allowed to be accessed
                    $allowedToAccessS3 = true;
                    $awsFileBucketURL = 's3root/subfolder/file1.extension';
                    //file derived from MIME when uploading file to S3, and then would be fetched from the DB to populate this variable
                    $awsFiletype = 'pdf';

                    if(TestPlugin_UserAjax::isDebug()){
                        error_log('after checking: is allowed anon user access?');
                    }

                    if($allowedToAccessS3){
                        //allowed to access
                        //now get an AWS signed link to the file
                        try {
                            if(empty($awsFileBucketURL)) {
                                throw new \Exception('The wanted record with id "'.$recordID.'" was not found when checking if the current user is allowed to access.');
                            }

                            $awsHelper = TestPlugin_Class::getAWSHelper();

                            if(TestPlugin_UserAjax::isDebug()){
                                error_log('after getAWSHelper fetching');
                            }

                            if(!empty($awsHelper)) {
                                $primaryBucket = $awsHelper->getS3Helper()->getPrimaryBucket();

                                if(TestPlugin_UserAjax::isDebug()){
                                    error_log('after getPrimaryBucket');
                                }

                                if(!empty($primaryBucket)){
                                    $signedUrl = $primaryBucket->getPresignedObjectURL($awsFileBucketURL);

                                    if(TestPlugin_UserAjax::isDebug()){
                                        error_log('after getPresignedObjectURL');
                                    }

                                    $response->success = true;
                                    $response->result = ["filetype" => $awsFiletype, "uploadedurl" => $signedUrl];
                                } else {
                                    throw new \Exception('The AWSHelper primary bucket was empty.');
                                }
                            } else {
                                throw new \Exception('The AWSHelper for the "TestPlugin_Class" was returned as null.');
                            }
                        } catch(\Exception $e) {
                            $response->addMessage("Unable to instantiate AWS helper:" . $e->getMessage());
                            error_log("getAWSLinkForFile - Exception:" . print_r($e, true));
                        }
                    } else {
                        throw new \Exception('Error getting record file access status');
                    }
                } else {//parameters missing
                    $response->addMessage("The parameters \"".implode('", "',$requiredParams)."\" were not provided.");
                    $response->result = $preparedJson;
                }
            } catch (\Exception $e) {
                if(TestPlugin_UserAjax::isDebug()){
                    error_log("An error occurred when getting the record aws link:" . $e->getMessage());
                }
                $response->addMessage("A server error was encountered when getting the record aws link. See the log for details. The provided parameters were:".print_r($_POST['param'], true));
            }

            JSONHelper::send_json_response($response);
        }

        //loads all Setting objects in the database
        public static function getSettings() {
            $response = new AjaxResponse();
            $receivedParam = $_POST['param'];

            if(TestPlugin_UserAjax::isDebug()){
                error_log('$receivedParam:' . print_r($receivedParam, true));
            }

            $requiredParams = [];
            try {
                $preparedJson = JSONHelper::decode_from_json($_POST['param']);
                if(UtilityFunctions::array_keys_exists($requiredParams, $preparedJson)){
                    $response = testpluginuser_AjaxFunctions::getSettings($response);
                } else {//parameters missing
                    $response->addMessage("The parameters \"".implode('", "',$requiredParams)."\" were not provided.");
                    $response->result = $preparedJson;
                }
            } catch (\Exception $e) {
                if(TestPlugin_UserAjax::isDebug()){
                    error_log("An error occurred when getting the Settings:" . $e->getMessage());
                }
                $response->addMessage("A server error was encountered when getting the Settings. See the log for details. The provided parameters were:".print_r($_POST['param'], true));
            }

            JSONHelper::send_json_response($response);
        }
    }
}

