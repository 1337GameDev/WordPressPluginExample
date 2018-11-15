<?php
namespace TestPlugin {
    use TestPlugin\TestPlugin_Options;
    use TestPlugin\TestPlugin_Class;

    class TestPlugin_Admin {
        public static $admin_pages = [
            "testplugin"
        ];

        public function __construct() {
            $this->admin_init();
        }

        private function admin_init() {
            add_action('wp_before_admin_bar_render', array($this, 'wp_before_admin_bar_render'));
            add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts_and_styles'), 9999);
        }

        public static function getPageNameFromHookSuffix($hooksuffix) {
            $isSettingsPage = strpos($hooksuffix, 'settings_page_') === 0;
            $pageName = $hooksuffix;

            if($isSettingsPage) {
                $pageName = str_replace("settings_page_","",$pageName);
            }

            return $pageName;
        }

        public static function admin_enqueue_scripts_and_styles($hook_suffix) {
            $pageName = TestPlugin_Admin::getPageNameFromHookSuffix($hook_suffix);

            if(in_array($pageName, TestPlugin_Admin::$admin_pages) ){
                $globalArray = array('ajaxurl' => admin_url('admin-ajax.php'), 'nonce' => wp_create_nonce('ajax-test-plugin-admin-pages'), 'pluginURL' => TestPlugin_URL, 'siteURL' => site_url(), 'uploadsURL' => wp_upload_dir()['baseurl']);

                wp_enqueue_script('helper-js', TestPlugin_URL . '/js/helper.min.js', array(), false, true);
                wp_localize_script('helper-js', 'GlobalJSData', $globalArray);
                wp_enqueue_style('global-css', TestPlugin_URL . '/css/global.min.css', array());
                wp_enqueue_style('test-admin-css', TestPlugin_URL . '/css/admin.min.css', array('global-css'));

                if($pageName === 'testplugin') {
                    wp_enqueue_script('test-admin-js', TestPlugin_URL . '/js/admin.min.js', array('helper-js'), false, true);
                    wp_localize_script('test-admin-js', 'GlobalJSData', $globalArray);
                }
            }
        }

        public static function adminPageHtml() {
            echo TestPlugin_Class::$templates->render( 'admin_page', array(
                'pluginVersion' => get_option(TestPlugin_Class::$version_option_name)
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

