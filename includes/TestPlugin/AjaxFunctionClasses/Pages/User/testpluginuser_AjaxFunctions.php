<?php
/*
 * This file has handler functions for AJAX calls defined in TestPlugin_UserAjax, and used on the page "testpluginuser".
 *
 * This file is simply used to abstract away "heavy lifting" functions for AJAX calls, so the TestPlugin_UserAjax
 * file's functions stay small and only handle parameters and validation.
 * */

namespace TestPlugin\AjaxFunctionClasses\Pages\User {
    use TestPlugin\AjaxResponse;
    use TestPlugin\AjaxResponseWithHTML;
    use TestPlugin\DBResult;
    use TestPlugin\FieldCondition;
    use TestPlugin\FileUploadHelper;
    use TestPlugin\JSONHelper;
    use TestPlugin\Models\Language;
    use TestPlugin\Models\ModelBase;
    use TestPlugin\Models\StoredString;
    use TestPlugin\Models\Setting;
    use TestPlugin\PDOHelper;
    use TestPlugin\TestPlugin_UserAjax;
    use TestPlugin\TestPlugin_Class;
    use TestPlugin\Models\TestPluginModelDataHelper;
    use TestPlugin\Models\ModelDataHelper;
    use TestPlugin\UtilityFunctions;
    use TestPlugin\SessionHelper;

    class testpluginuser_AjaxFunctions {
        /**
         * Gets the AWS link for a file, with a pre-signed access token provided by an AWS identity
         *
         * @param AjaxResponse $currentResponse The current AjaxResponse object for this request (that's calling this method)
         * @param string $fileIdentifier The identifier of the file, in AWS, to be used to get a pre-signed link. This is an AWS S3 file 'key'
         *
         * @return AjaxResponse The response object, with the upload progress in the result field
         */
        public static function getAWSLinkForFile(AjaxResponse $currentResponse, $fileIdentifier):AjaxResponse {
            $dbHelper = TestPlugin_Class::getExternalConnection(TestPlugin_Class::TESTPLUGIN_PDO_DB_KEY);
            $userID = get_current_user_id();

            $response = new AjaxResponse();
            $response->combine($currentResponse);

            //get info used for pagination
            if(TestPlugin_UserAjax::isDebug()){
                error_log("----------------------------- getAWSLinkForFile - User -----------------------------");
            }

            try {
                $awsHelper = TestPlugin_Class::getAWSHelper();
                if(!empty($awsHelper)) {
                    $primaryBucket = $awsHelper->getS3Helper()->getPrimaryBucket();
                    if(!empty($primaryBucket)){
                        $signedUrl = $primaryBucket->getPresignedObjectURL($fileIdentifier);

                        $response->success = true;
                        $response->result = $signedUrl;
                    } else {
                        throw new \Exception('The AWSHelper primary bucket was empty.');
                    }
                } else {
                    throw new \Exception('The AWSHelper for the "TestPlugin_Class" was returned as null.');
                }
            } catch(\Exception $e) {
                $response->addMessage("Unable to instantiate AWS helper:" . $e->getMessage());
                error_log("getAWSLinkForFile-User - Exception:" . print_r($e, true));
            }

            return $response;
        }

        /**
         * Loads all the StoredString objects and returns them
         *
         * @param AjaxResponse $currentResponse The current AjaxResponse object for this request (that's calling this method)
         *
         * @return AjaxResponse The response object, with the StoredString objects in the result field
         */
        public static function getStoredStrings(AjaxResponse $currentResponse):AjaxResponse {
            $dbHelper = TestPlugin_Class::getExternalConnection(TestPlugin_Class::TESTPLUGIN_PDO_DB_KEY);
            $userID = get_current_user_id();

            $response = new AjaxResponseWithHTML();
            $response->combine($currentResponse);

            try {
                $dbStatus = StoredString::loadAllBy($dbHelper, true);
                if(!$dbStatus->success) {
                    throw new \Exception("There was an error loading the StoredStrings.");
                }

                $response->result = $dbStatus->result;
                $response->success = true;
            } catch (\Exception $e){
                $response->addMessage($e->getMessage());
            }

            return $response;
        }

        /**
         * Loads all the Setting objects and returns them
         *
         * @param AjaxResponse $currentResponse The current AjaxResponse object for this request (that's calling this method)
         *
         * @return AjaxResponse The response object, with the Setting objects in the result field
         */
        public static function getSettings(AjaxResponse $currentResponse):AjaxResponse {
            $dbHelper = TestPlugin_Class::getExternalConnection(TestPlugin_Class::TESTPLUGIN_PDO_DB_KEY);

            $response = new AjaxResponseWithHTML();
            $response->combine($currentResponse);

            try {
                $dbStatus = Setting::loadAllBy($dbHelper, true);
                if(!$dbStatus->success) {
                    throw new \Exception("There was an error loading the Settings.");
                }

                $response->result = $dbStatus->result;
                $response->success = true;
            } catch (\Exception $e){
                $response->addMessage($e->getMessage());
            }

            return $response;
        }
    }
}