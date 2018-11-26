<?php
namespace TestPlugin {
    use TestPlugin\TestPlugin_Options;
    use TestPlugin\TestPlugin_UserAjax;
    use TestPlugin\TestPlugin_AdminAjax;
    use TestPlugin\TestPlugin_Admin;
    use TestPlugin\UtilityFunctions;
    use TestPlugin\Template;
    use TestPlugin\CSSLoader;

    class TestPlugin_Class {
        public static $pluginName = "Test Plugin";
        public static $pluginShortName = "testplugin";
        public static $test_plugin_version = "1.0.0";
        public static $test_plugin_db_version = "1.0.0";
        public static $test_db_table_prefix = "test_plugin_";//use this to "scope" your db tables when doing queries / storing data in custom tables

        public static $datetime_format = \DateTimeInterface::W3C;
        public static $integrityCheckIntervalFormat = IntervalType::MINUTES;
        public static $integrityCheckInterval = 10;

        public static $plugin_pages = [
            "testplugin_user_testpage"
        ];

        public static $templates;
        public static $sqlLoader;
        public static $cssLoader;
        public static $jsLoader;

        public function __construct($checkForOldData = false) {
            global $wpdb;
            TestPlugin_Class::$templates = new Template(TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR."Templates");
            TestPlugin_Class::$sqlLoader = new SQLLoader(TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'SQL',$wpdb->prefix.TestPlugin_Class::$test_db_table_prefix, $wpdb->get_charset_collate() );
            TestPlugin_Class::$cssLoader = new CSSLoader(TestPlugin_DIR.DIRECTORY_SEPARATOR.'css', TestPlugin_URL.'/css');
            TestPlugin_Class::$jsLoader = new JSLoader(TestPlugin_DIR.DIRECTORY_SEPARATOR.'js', TestPlugin_URL.'/js');

            if($checkForOldData) {
                TestPlugin_Class::removePluginData();
            }

            add_action( 'plugins_loaded', array($this,'initPlugin') );
        }

        public function initPlugin(){
            //associate the activation hook
            register_activation_hook(__FILE__, array(__NAMESPACE__.'\\TestPlugin_Class', 'activate_ops'));
            //associate the deactivate hook
            register_deactivation_hook(__FILE__, array(__NAMESPACE__.'\\TestPlugin_Class', 'deactivate_ops'));

            add_action('wp_head', array(__NAMESPACE__ .'\\TestPlugin_Class', 'head_snippets') );

            //register ajax endpoints
            add_action('wp_ajax_getTestAdminAjaxResponse', array(__NAMESPACE__ . '\\TestPlugin_AdminAjax', 'getTestAdminAjaxResponse'));
            add_action('wp_ajax_nopriv_getTestUserAjaxResponse', array(__NAMESPACE__ . '\\TestPlugin_UserAjax', 'getTestUserAjaxResponse'));
            add_action('wp_ajax_getTestUserAjaxResponse', array(__NAMESPACE__ . '\\TestPlugin_UserAjax', 'getTestUserAjaxResponse'));

            //register enqueue methods for determining what scripts/styles to enqueue using the wordpress api
            add_action('wp_enqueue_scripts', array(__NAMESPACE__.'\\TestPlugin_Class', 'enqueuePluginPageScriptsAndStyles') );

            TestPlugin_Admin::admin_init();

            add_action('admin_init', array(__NAMESPACE__ .'\\TestPlugin_Options', 'options_init'));

            //check db when plugin is loaded if the db needs to be updated (the activation hook isn't called when the plugin is upgraded)
            TestPlugin_Class::activate_plugin_check();
        }

        public static function head_snippets() {
            if(TestPlugin_Class::isPluginPage() ) {
                if(is_page("testplugin_user_testpage") ) {//user-side page
                    echo TestPlugin_Class::$templates->render('user_test_page_head_snippets');
                }
            }
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

        public static function isUserPluginPage() {
            return is_page(TestPlugin_Class::$plugin_pages);
        }

        public static function isPluginPage() {
            return TestPlugin_Class::isUserPluginPage() || TestPlugin_Admin::isAdminPage();
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
            if(TestPlugin_Class::isUserPluginPage() ) {
                wp_enqueue_script(TestPlugin_Class::$pluginShortName.'_newJquery', TestPlugin_URL.'/js/lib/jquery/dist/jquery.min.js', array('jquery'), false, true);
                wp_enqueue_script( TestPlugin_Class::$pluginShortName.'_webcomponents', TestPlugin_URL.'/js/lib/@webcomponents/webcomponentsjs/webcomponents-loader.js', array(TestPlugin_Class::$pluginShortName.'_newJquery'), false, true );
                wp_enqueue_script(TestPlugin_Class::$pluginShortName.'_helper-js', TestPlugin_URL.'/js/testplugin_helper.js', array(TestPlugin_Class::$pluginShortName.'_webcomponents'), false, true);
                wp_localize_script(TestPlugin_Class::$pluginShortName.'_helper-js', TestPlugin_Class::$pluginShortName.'_GlobalJSData', $globalArray);

                wp_enqueue_style(TestPlugin_Class::$pluginShortName.'_global-css', TestPlugin_URL.'/css/global/global.min.css', array(), false, false);
                wp_enqueue_style(TestPlugin_Class::$pluginShortName.'_user-css', TestPlugin_URL.'/css/user/testplugin_user.min.css', array(TestPlugin_Class::$pluginShortName.'_global-css'), false, false);

                //we know we are SOME plugin page, now find out which one
                foreach (TestPlugin_Class::$plugin_pages as $page) {
                    //load scripts and styles that pertain to a specific page
                    TestPlugin_Class::$cssLoader->enqueueCSSForPage($page);
                    TestPlugin_Class::$jsLoader->enqueueJSForPage($page);
                }

            }
        }

        public static function do_incomplete_plugin_check() {
            $pluginPassesCheck = false;

            $doCheck = false;
            $lastCheck = TestPlugin_Options::getPluginOption(TestPlugin_Options::PLUGIN_INTEGRITY_CHECK_TIMESTAMP_OPTION);
            $now = new \DateTime();

            if(!$lastCheck) {
                $doCheck = true;

            } else {
                try {
                    $storedTime = \DateTime::createFromFormat(TestPlugin_Class::$datetime_format, $lastCheck);

                    $interval = $storedTime->diff($now, true);
                    $intervalValue = UtilityFunctions::intervalValueAs($interval, TestPlugin_Class::$integrityCheckIntervalFormat);

                    if($intervalValue >= TestPlugin_Class::$integrityCheckInterval) {
                        $doCheck = true;
                    }
                } catch (\Exception $e) {
                    $doCheck = true;
                }
            }

            if($doCheck) {
                //do incomplete plugin check
                $files = [
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'TestPlugin_Admin.php',
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'TestPlugin_AdminAjax.php',
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'TestPlugin_UserAjax.php',
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'TestPlugin_Class.php',
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'TestPlugin_Options.php',
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'UtilityFunctions.php',
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'BasicEnum.php',
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'NoticeType.php',
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'IntervalType.php',
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'Template.php',
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'DataServiceHelpers'.DIRECTORY_SEPARATOR.'DataSource.php',
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'DataServiceHelpers'.DIRECTORY_SEPARATOR.'WPDataSource.php',
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'DataServiceHelpers'.DIRECTORY_SEPARATOR.'SQLLoader.php',
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'DataServiceHelpers'.DIRECTORY_SEPARATOR.'AzureBlobStorageHelper.php',
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'DataServiceHelpers'.DIRECTORY_SEPARATOR.'AzureSQLDBHelper.php',
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'ContentHelpers'.DIRECTORY_SEPARATOR.'CSSLoader.php',
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'ContentHelpers'.DIRECTORY_SEPARATOR.'JSLoader.php'

                ];

                //loop through all files declared above and check their existence
                $allFilesPresent = false;
                foreach ($files as $filePath) {
                    $allFilesPresent = file_exists($filePath);
                    if(!$allFilesPresent) {
                        break;
                    }
                }

                $pluginPassesCheck = $allFilesPresent;
            } else {
                $pluginPassesCheck = true;
            }

            $formattedNow = $now->format(TestPlugin_Class::$datetime_format);
            TestPlugin_Options::setPluginOption(TestPlugin_Options::PLUGIN_INTEGRITY_CHECK_TIMESTAMP_OPTION, $formattedNow);

            return $pluginPassesCheck;
        }
    }
}
 ?>