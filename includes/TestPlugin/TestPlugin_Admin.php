<?php
namespace TestPlugin {
    use TestPlugin\TestPlugin_Options;
    use TestPlugin\TestPlugin_Class;

    class TestPlugin_Admin {
        public static $admin_pages = [
            "testplugin"
        ];

        public function __construct() {
            add_action('wp_before_admin_bar_render', array($this, 'wp_before_admin_bar_render'));
            add_action('admin_enqueue_scripts', array(__NAMESPACE__.'\\TestPlugin_Admin', 'admin_enqueue_scripts_and_styles'), 9999);
            add_action('admin_head', array(__NAMESPACE__ .'\\TestPlugin_Admin', 'admin_head_snippets') );

            add_action('admin_menu', array(__NAMESPACE__ .'\\TestPlugin_Admin', 'add_admin_pages'));

        }

        public static function admin_init() {
            // load the admin file
            global $test_plugin_admin;
            if (empty($test_plugin_admin)) {
                //check if class is defined, if not, instantiate it
                //error_log("admin_init");
                $test_plugin_admin = new TestPlugin_Admin();
            }
        }

        //uses "get_current_screen" which is ONLY available after the "admin_init" hook
        public static function isAdminPage(){
            $pageName = TestPlugin_Admin::getCurrentAdminPageName();
            return in_array($pageName, TestPlugin_Admin::$admin_pages);
        }

        public static function getCurrentAdminPageName(){
            $pageName = "";
            if(function_exists('get_current_screen') ) {
                $currentScreen = get_current_screen();
                $pageName = TestPlugin_Admin::getPageNameFromHookSuffix($currentScreen->id);
            }

            return $pageName;
        }

        public static function getPageNameFromHookSuffix($hooksuffix) {
            $isSettingsPage = strpos($hooksuffix, 'settings_page_') === 0;
            $pageName = $hooksuffix;

            if($isSettingsPage) {
                $pageName = str_replace("settings_page_","",$pageName);
            }

            return $pageName;
        }

        public static function admin_head_snippets() {
            if(TestPlugin_Class::isPluginPage() ) {
                $pageName = TestPlugin_Admin::getCurrentAdminPageName();

                if($pageName === "testplugin" ) {//admin page
                    echo TestPlugin_Class::$templates->render('admin_page_head_snippets');
                }
            }
        }

        public static function admin_enqueue_scripts_and_styles($hook_suffix) {
            $pageName = TestPlugin_Admin::getPageNameFromHookSuffix($hook_suffix);
            $isAdminPage = in_array($pageName, TestPlugin_Admin::$admin_pages);

            if($isAdminPage) {
                $globalArray = array('ajaxurl' => admin_url('admin-ajax.php'), 'nonce' => wp_create_nonce('ajax-test-plugin-admin-pages'), 'pluginURL' => TestPlugin_URL, 'siteURL' => site_url(), 'uploadsURL' => wp_upload_dir()['baseurl']);

                wp_enqueue_script(TestPlugin_Class::$pluginShortName.'_newJquery', TestPlugin_URL.'/js/lib/jquery/dist/jquery.min.js', array('jquery'), false, true);
                wp_enqueue_script( TestPlugin_Class::$pluginShortName.'_webcomponents', TestPlugin_URL.'/js/lib/@webcomponents/webcomponentsjs/webcomponents-loader.js', array(TestPlugin_Class::$pluginShortName.'_newJquery'), false, true );
                wp_enqueue_script(TestPlugin_Class::$pluginShortName.'_helper-js', TestPlugin_URL.'/js/testplugin_helper.js', array(TestPlugin_Class::$pluginShortName.'_webcomponents'), false, true);
                wp_localize_script(TestPlugin_Class::$pluginShortName.'_helper-js', TestPlugin_Class::$pluginShortName.'_GlobalJSData', $globalArray);
                wp_enqueue_script(TestPlugin_Class::$pluginShortName.'_admin-js', TestPlugin_URL.'/js/admin/admin.js', array(TestPlugin_Class::$pluginShortName.'_helper-js'), false, true);

                wp_enqueue_style(TestPlugin_Class::$pluginShortName.'_global-css', TestPlugin_URL.'/css/global/global.min.css', array());
                wp_enqueue_style(TestPlugin_Class::$pluginShortName.'_admin-css', TestPlugin_URL.'/css/admin/admin.min.css', array(TestPlugin_Class::$pluginShortName.'_global-css'));


                TestPlugin_Class::$cssLoader->enqueueCSSForPage($pageName, true);
                TestPlugin_Class::$jsLoader->enqueueJSForPage($pageName, true);
            }
        }

        public static function adminPageHtml() {
            echo TestPlugin_Class::$templates->render( 'admin_page', array(
                'pluginVersion' => TestPlugin_Options::getPluginOption(TestPlugin_Options::PLUGIN_VERSION_OPTION)
            ));
        }

        public function wp_before_admin_bar_render() {
            global $wp_admin_bar;

            if (!TestPlugin_Options::user_can_manage()) {
                return;
            }

            $option_location = TestPlugin_Admin::admin_page_url();

            $args = array(
                'id' => 'test_admin_node',
                'title' => 'Test Plugin'
            );
            $wp_admin_bar->add_node($args);

            $args = array(
                'id' => 'test_admin_node_testpage',
                'title' => 'Test Page',
                'parent' => 'test_admin_node',
                'href' => $option_location . '?page=testplugin'
            );
            $wp_admin_bar->add_node($args);
        }

        //adds the settings page to the left-side menus of the dashboard (needed so the top-level admin menu cna link to it)
        public static function add_admin_pages() {
            add_submenu_page('options-general.php', 'Test Plugin', 'Test Plugin', 'edit_pages', "testplugin", array(__NAMESPACE__.'\\TestPlugin_Admin', "adminPageHtml"));
        }

        public static function admin_page_url() {
            return admin_url('options-general.php');
        }
    }
}

