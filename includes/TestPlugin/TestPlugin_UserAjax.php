<?php
namespace TestPlugin {
    use TestPlugin\UtilityFunctions;

    class TestPlugin_UserAjax
    {
        public static function getTestUserAjaxResponse()
        {
            //require_once(TestPlugin_DIR.DIRECTORY_SEPARATOR.'utility'.DIRECTORY_SEPARATOR.'utility_functions.php');

            $canEdit = current_user_can('edit_posts');
            $receivedParam = $_POST['param'];

            $success = true;
            $message = "Successfully called a user ajax function on the server. Usercanedit: " . $canEdit . " Received: " . $receivedParam;
            $result = array();

            // generate the response
            $response = UtilityFunctions::create_json_result_no_nonce($result, $message, $success);
            // response output
            header("Content-Type: application/json");
            echo $response;

            exit;
        }
    }
}

