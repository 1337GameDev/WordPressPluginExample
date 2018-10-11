<?php
namespace TestPlugin {
    use TestPlugin\TestPlugin_Options;

    class TestPlugin_Admin
    {
        public function __construct()
        {
            $this->admin_init();
        }

        private function admin_init()
        {
            add_action('wp_before_admin_bar_render', array($this, 'wp_before_admin_bar_render'));
            add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts_and_styles'), 9999);
        }

        public static function admin_enqueue_scripts_and_styles($hook_suffix)
        {
            global $test_plugin_admin_page;

            if ($hook_suffix != $test_plugin_admin_page) {//only load our styles / js on OUR settings page to prevent conflicts
                return;
            }

            $globalArray = array('ajaxurl' => admin_url('admin-ajax.php'), 'nonce' => wp_create_nonce('ajax-test-plugin-admin-pages'), 'pluginURL' => TestPlugin_URL, 'siteURL' => site_url(), 'uploadsURL' => wp_upload_dir()['baseurl']);

            wp_enqueue_script('helper-js', TestPlugin_URL . '/js/helper.min.js', array(), false, true);
            wp_localize_script('helper-js', 'GlobalJSData', $globalArray);

            wp_enqueue_script('test-admin-js', TestPlugin_URL . '/js/admin.min.js', array('helper-js'), false, true);
            wp_localize_script('test-admin-js', 'GlobalJSData', $globalArray);

            wp_enqueue_style('global-css', TestPlugin_URL . '/css/global.min.css', array());
            wp_enqueue_style('test-admin-css', TestPlugin_URL . '/css/admin.min.css', array('global-css'));

        }

        //actually nav-tab page content
        function adminPageHtml()
        {
            ?>
            <div class="container">
                <div class="row">
                    <p>An example plugin used for creating new plugins. </p>
                    <p>Plugin Version: <?php echo get_option(TestPlugin_Class::$version_option_name); ?></p>

                    <button id="testAjaxButton"> Test Ajax</button>
                    <div class="miniloaderContainer" id="testPluginLoader">
                        <div class="miniloader"></div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-xs-12">
                        <p id="ajaxResponseMessage1"></p>
                        <p id="ajaxResponseMessage2"></p>
                        <?php //phpinfo(INFO_MODULES); ?>
                    </div>
                </div>
                <hr/>
                <div class="row">
                    <div class="col-xs-12">
                        <?php //phpinfo(INFO_MODULES); ?>
                    </div>
                </div>
            </div>
            <?php
        }

        public function wp_before_admin_bar_render()
        {
            //require_once(TestPlugin_DIR.DIRECTORY_SEPARATOR.'includes'.DIRECTORY_SEPARATOR.'options.php');


            global $wp_admin_bar;

            if (!TestPlugin_Options::user_can_manage()) {
                return;
            }

            $option_location = TestPlugin_Options::admin_page_url();

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
    }
}

