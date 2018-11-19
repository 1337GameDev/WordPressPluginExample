<?php
namespace TestPlugin {
    use TestPlugin\TestPlugin_Options;
    use TestPlugin\TestPlugin_UserAjax;
    use TestPlugin\TestPlugin_AdminAjax;
    use TestPlugin\TestPlugin_Admin;
    use TestPlugin\UtilityFunctions;
    use TestPlugin\Template;

    class TestPlugin_Class {
        public static $pluginName = "Test Plugin";
        public static $test_plugin_version = "1.0.0";
        public static $test_plugin_db_version = "1.0.0";
        public static $test_db_table_prefix = "test_plugin_";//use this to "scope" your db tables when doing queries / storing data in custom tables

        public static $plugin_pages = [
            "testplugin_user_testpage"
        ];

        public static $templates;
        public static $sqlLoader;

        public function __construct($checkForOldData = false) {
            global $wpdb;
            TestPlugin_Class::$templates = new Template(TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR."Templates");
            TestPlugin_Class::$sqlLoader = new SQLLoader(TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'SQL',$wpdb->prefix.TestPlugin_Class::$test_db_table_prefix, $wpdb->get_charset_collate() );

            if($checkForOldData) {
                TestPlugin_Class::removePluginData();
            }

            add_action( 'plugins_loaded', array($this,'initPlugin') );
        }

        public function initPlugin(){

            # Create admin page
            // Run earlier than default - hence earlier than other components
            // admin_menu runs earlier than other plugins
            add_action('admin_menu', array(__NAMESPACE__ .'\\TestPlugin_Admin', 'admin_menu'), 9);
            add_action('admin_init', array(__NAMESPACE__ .'\\TestPlugin_Admin', 'admin_menu'), 9);
            //associate the activation hook
            register_activation_hook(__FILE__, array(__NAMESPACE__.'\\TestPlugin_Class', 'activate_ops'));
            //associate the deactivate hook
            register_deactivation_hook(__FILE__, array(__NAMESPACE__.'\\TestPlugin_Class', 'deactivate_ops'));

            //register ajax endpoints
            add_action('wp_ajax_getTestAdminAjaxResponse', array(__NAMESPACE__ . '\\TestPlugin_AdminAjax', 'getTestAdminAjaxResponse'));
            add_action('wp_ajax_nopriv_getTestUserAjaxResponse', array(__NAMESPACE__ . '\\TestPlugin_UserAjax', 'getTestUserAjaxResponse'));
            add_action('wp_ajax_getTestUserAjaxResponse', array(__NAMESPACE__ . '\\TestPlugin_UserAjax', 'getTestUserAjaxResponse'));

            //register menu options
            add_action('admin_init', array(__NAMESPACE__ .'\\TestPlugin_Options', 'options_init'));
            add_action('admin_menu', array(__NAMESPACE__ .'\\TestPlugin_Admin', 'add_admin_pages'));

            //register enqueue methods for determining what scripts/styles to enqueue using the wordpress api
            add_action('wp_enqueue_scripts', array(__NAMESPACE__.'\\TestPlugin_Class', 'enqueuePluginPageScriptsAndStyles') );

            //check db when plugin is loaded if the db needs to be updated (the activation hook isn't called when the plugin is upgraded)
            TestPlugin_Class::activate_plugin_check();
        }

        public static function activate_plugin_check() {
            if (TestPlugin_Options::getPluginOption(TestPlugin_Options::PLUGIN_VERSION_OPTION) != TestPlugin_Class::$test_plugin_version ) {
                TestPlugin_Class::activate_ops();
            }
        }

        public static function incomplete_install_warning() {
            $msgStr = 'The installation of the plugin "TestPlugin" is incomplete. Please re-install the plugin.';
            TestPlugin\UtilityFunctions::log_message($msgStr);
            echo UtilityFunctions::noticeMessageHtml($msgStr, NoticeType::ERROR);
        }

        public static function isPluginPage() {
            $isPluginPage = false;

            $allPages = array_merge(TestPlugin_Class::$plugin_pages, TestPlugin_Admin::$admin_pages);

            $isPluginPage = is_page($allPages);

            return $isPluginPage;
        }

        public static function activate_ops() {
            global $wpdb;
            //ensure secure use
            if (!current_user_can( 'activate_plugins') ){
                return;
            }
            $plugin = isset( $_REQUEST['plugin'] ) ? $_REQUEST['plugin'] : '';
            //the below check fails, likely due to a wrong nonce name (or the nonce isn't available in this phase of the WordPress lifecycle)
            //enabling this currently will make an endless loop as this check executes every "cycle" of WordPress. It has been disabled for now

            //check_admin_referer( "activate-plugin_{$plugin}" );

            require_once( ABSPATH . 'wp-admin'.DIRECTORY_SEPARATOR.'includes'.DIRECTORY_SEPARATOR.'upgrade.php' );

            $installed_ver = TestPlugin_Options::getPluginOption(TestPlugin_Options::PLUGIN_VERSION_OPTION);
            $newInstall = !$installed_ver;//option doesn't exist and is "falsey," so this must be a new install

            //now if the db hasn't been initialized -- a freshly installed plugin, do that here
            if($newInstall) {
                //do any plugin file manipulations
                TestPlugin_Class::installOps();
            }

            TestPlugin_Options::addPluginOption(TestPlugin_Options::PLUGIN_VERSION_OPTION, TestPlugin_Class::$test_plugin_version ); //this wont replace an existing option

            //now check if the version being installed differs than db
            //if so, we need to modify the files/options to reflect the latest version
            $installed_ver = TestPlugin_Options::getPluginOption(TestPlugin_Options::PLUGIN_VERSION_OPTION);

            if ($installed_ver != TestPlugin_Class::$test_plugin_version ) {//installed version differs from the version this codebase is from -- so handle some incremental updates
                //do any manipulations here that happen for ANY new version after 1.0

              if($newInstall || version_compare($installed_ver, '1.0.1', '<')) {//version > 1.0.1
                //do version specific code
              }
              TestPlugin_Options::setPluginOption(TestPlugin_Options::PLUGIN_VERSION_OPTION, TestPlugin_Class::$test_plugin_version);
              $installed_ver = TestPlugin_Options::getPluginOption(TestPlugin_Options::PLUGIN_VERSION_OPTION);
            }

            TestPlugin_Class::db_update_ops();

            error_log("************ Activated ".TestPlugin_Class::$pluginName." - Version: ".$installed_ver."   ************");
        }

        public static function db_update_ops() {
            $installed_db_ver = TestPlugin_Options::getPluginOption(TestPlugin_Options::PLUGIN_DB_VERSION_OPTION);
            $newInstall = !$installed_db_ver;//option doesn't exist and is "falsey," so this must be a new install

            //now if the db hasn't been initialized -- a freshly installed plugin, do that here
            if($newInstall) {
                //create tables, data, etc
                TestPlugin_Class::processDBUpdatePhase(['v1_tables','v1_tables_2'],'v1_constraints', 'v1_data');

            }

            TestPlugin_Options::addPluginOption(TestPlugin_Options::PLUGIN_DB_VERSION_OPTION, TestPlugin_Class::$test_plugin_db_version ); //this wont replace an existing option

            //now check if the version being installed differs than db
            //if so, we need to modify the db to reflect the latest version
            $installed_db_ver = TestPlugin_Options::getPluginOption(TestPlugin_Options::PLUGIN_DB_VERSION_OPTION);

            if ($installed_db_ver != TestPlugin_Class::$test_plugin_db_version ) {//installed DB version differs from the version this codebase is from -- so handle some incremental updates
                //do any manipulations here that happen for ANY new version after 1.0

                if($newInstall || version_compare($installed_db_ver, '1.0.1', '<')) {//version > 1.0.1
                    //do version specific code
                }
                TestPlugin_Options::setPluginOption(TestPlugin_Options::PLUGIN_DB_VERSION_OPTION, TestPlugin_Class::$test_plugin_db_version);
                $installed_db_ver = TestPlugin_Options::getPluginOption(TestPlugin_Options::PLUGIN_DB_VERSION_OPTION);
            }

        }

        private static function processDBUpdatePhase($tblSqlFiles, $constraintSqlFiles, $dataSqlFiles){
            $tblSqlArray = TestPlugin_Class::$sqlLoader->getSqlFileStatements($tblSqlFiles);
            $constraintSqlArray = TestPlugin_Class::$sqlLoader->getSqlFileStatements($constraintSqlFiles);
            $dataSqlArray = TestPlugin_Class::$sqlLoader->getSqlFileStatements($dataSqlFiles);


            WPDataSource::dbDelta($tblSqlArray);
            WPDataSource::queries($constraintSqlArray);
            WPDataSource::queries($dataSqlArray);
        }

        public static function deactivate_ops() {
            //ensure secure use
            if (!current_user_can( 'activate_plugins') ){
                return;
            }
            $plugin = isset( $_REQUEST['plugin'] ) ? $_REQUEST['plugin'] : '';
            check_admin_referer( "deactivate-plugin_{$plugin}" );

            global $wpdb;
            //do deactivate cleanup (do NOT delete db tables here, as user could reactivate plugin)

            $installed_ver = TestPlugin_Options::getPluginOption(TestPlugin_Options::PLUGIN_VERSION_OPTION);
            error_log("************ Deactivated ".TestPlugin_Class::$pluginName." - Version: ".$installed_ver." ************");
        }

        public static function installOps() {
            global $wpdb;

            //register uninstall hook
            register_uninstall_hook(__FILE__, array(__NAMESPACE__.'\\TestPlugin_Class', 'uninstallOps'));

            error_log("************ Installed ".TestPlugin_Class::$pluginName." - Version: ".TestPlugin_Class::$test_plugin_version." ************");
        }

        public static function uninstallOps() {
            global $wpdb;
            if(!current_user_can('activate_plugins') ){
                return;
            }
            check_admin_referer('bulk-plugins');

            if(__FILE__!=WP_UNINSTALL_PLUGIN){
                return;
            }

            $installed_ver = TestPlugin_Options::getPluginOption(TestPlugin_Options::PLUGIN_VERSION_OPTION);

            //remove any db data, files, etc used by this plugin
            TestPlugin_Class::removePluginData();

            error_log("************ Uninstalled ".TestPlugin_Class::$pluginName." - Version: ".$installed_ver." ************");
        }

        public static function removePluginData() {
            $uninstallSqlArray = TestPlugin_Class::$sqlLoader->getSqlFileStatements('uninstall');

            WPDataSource::queries($uninstallSqlArray, false);

            TestPlugin_Options::removePluginOption(TestPlugin_Options::PLUGIN_VERSION_OPTION);
            TestPlugin_Options::removePluginOption(TestPlugin_Options::PLUGIN_DB_VERSION_OPTION);
        }

        public static function enqueuePluginPageScriptsAndStyles() {
            //array for passing php data to js
            $globalArray = array( 'ajaxurl' => admin_url( 'admin-ajax.php' ), 'pluginURL' => TestPlugin_URL,'siteURL' => site_url(),'uploadsURL'=> wp_upload_dir()['baseurl'] );

            //load scripts and styles that apply to all pages related to the plugin
            if(TestPlugin_Class::isPluginPage() ) {
                wp_enqueue_script('helper-js', TestPlugin_URL . '/js/helper.min.js', array(), false, true);
                wp_localize_script('helper-js', 'GlobalJSData', $globalArray);
                wp_enqueue_style('global-css', TestPlugin_URL . '/css/global.min.css', array(), false, false);

                //we know we are SOME plugin page, now find out which one
                foreach (TestPlugin_Class::$plugin_pages as $page) {
                    //load scripts and styles that pertain to a specific page
                    if ($page === 'testplugin_user_testpage') {
                        wp_enqueue_script('user-js', TestPlugin_URL . '/js/user.min.js', array('helper-js'), false, true);
                        wp_enqueue_style('user-css', TestPlugin_URL . '/css/user.min.css', array(), false, false);
                        wp_localize_script('user-js', 'GlobalJSData', $globalArray);
                    }
                }

            }
        }
    }
}
 ?>