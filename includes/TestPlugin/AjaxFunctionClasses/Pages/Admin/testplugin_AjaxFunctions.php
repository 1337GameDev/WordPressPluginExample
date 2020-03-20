<?php
/*
 * This file has handler functions for AJAX calls defined in TestPlugin_AdminAjax, and used on the page "testplugin".
 *
 * This file is simply used to abstract away "heavy lifting" functions for AJAX calls, so the TestPlugin_AdminAjax
 * file's functions stay small and only handle parameters and validation.
 * */

namespace TestPlugin\AjaxFunctionClasses\Pages\Admin {
    use TestPlugin\AjaxResponse;
    use TestPlugin\AjaxResponseWithHTML;
    use TestPlugin\DBResult;
    use TestPlugin\FieldCondition;
    use TestPlugin\FileUploadHelper;
    use TestPlugin\JSONHelper;
    use TestPlugin\Models\Language;
    use TestPlugin\Models\ModelBase;
    use TestPlugin\PDOHelper;
    use TestPlugin\TestPlugin_AdminAjax;
    use TestPlugin\TestPlugin_Class;
    use TestPlugin\Models\TestPluginModelDataHelper;
    use TestPlugin\Models\ModelDataHelper;
    use TestPlugin\UtilityFunctions;
    use TestPlugin\SessionHelper;

    class testplugin_AjaxFunctions {

        /**
         * Gets the progress of an upload to AWS in progress
         *
         * @param AjaxResponse $currentResponse The current AjaxResponse object for this request (that's calling this method)
         * @param array $data The data to be used to get the progress of a particular AWS upload. For this method, it currently requires a 'objectid' key
         *
         * @return AjaxResponse The response object, with the upload progress in the result field
         */
        public static function getAwsUploadProgress(AjaxResponse $currentResponse, array $data):AjaxResponse {
            $response = new AjaxResponseWithHTML();
            $response->combine($currentResponse);
            $userID = get_current_user_id();

            $sessionKey = "aws-upload-progress-object-".$data['objectid'];
            $percentCompleted = 0;
            if(SessionHelper::sessionContains($sessionKey)) {
                $percentCompleted = SessionHelper::getFromSession($sessionKey);
            }

            $response->result = $percentCompleted;
            $response->success = true;
            return $response;
        }

        /**
         * Gets the progress of an upload to AWS in progress, using a form UUID
         *
         * @param AjaxResponse $currentResponse The current AjaxResponse object for this request (that's calling this method)
         * @param array $data The data to be used to get the progress of a particular AWS upload. For this method, it currently requires a 'form-uuid' key
         *
         * @return AjaxResponse The response object, with the upload progress in the result field
         */
        public static function getAwsUploadProgressFromFormUUID(AjaxResponse $currentResponse, array $data):AjaxResponse {
            $response = new AjaxResponseWithHTML();
            $response->combine($currentResponse);
            $userID = get_current_user_id();

            $sessionKey = "aws-upload-progress-obj-uuid-".$data['form-uuid'];
            $percentCompleted = 0;
            if(SessionHelper::sessionContains($sessionKey)) {
                $percentCompleted = SessionHelper::getFromSession($sessionKey);
            }

            $response->result = $percentCompleted;
            $response->success = true;
            return $response;
        }

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
            if(TestPlugin_AdminAjax::isDebug()){
                error_log("----------------------------- getAWSLinkForFile - Admin -----------------------------");
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
                error_log("getAWSLinkForFile-Admin - Exception:" . print_r($e, true));
            }

            return $response;
        }
    }
}