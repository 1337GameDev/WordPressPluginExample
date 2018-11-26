<?php
namespace TestPlugin {
    use TestPlugin\UtilityFunctions;

    class TestPlugin_AdminAjax
    {
        public static function getTestAdminAjaxResponse()
        {
            //require_once(TestPlugin_DIR.DIRECTORY_SEPARATOR.'utility'.DIRECTORY_SEPARATOR.'utility_functions.php');

            check_ajax_referer('ajax-test-plugin-admin-pages', 'nonce');

            $canEdit = current_user_can('edit_posts');
            $receivedParam = $_POST['param'];

            $success = true;
            $message = "Successfully called an admin ajax function on the server. Usercanedit: " . $canEdit . " Received: " . $receivedParam;
            $result = array();

            // generate the response
            $response = UtilityFunctions::create_json_result($result, $message, $success, 'ajax-test-plugin-admin-pages');
            // response output
            header("Content-Type: application/json");
            echo $response;

            exit;
        }
    }
}

