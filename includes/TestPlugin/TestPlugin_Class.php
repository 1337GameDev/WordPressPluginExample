<?php
namespace TestPlugin {
    use TestPlugin\Models\ModelBase;
    use TestPlugin\Models\ModelDataHelper;
    use TestPlugin\PDOConnectionInfo;
    use TestPlugin\PDOHelperContainer;
    use TestPlugin\TestPlugin_Options;
    use TestPlugin\TestPlugin_UserAjax;
    use TestPlugin\TestPlugin_AdminAjax;
    use TestPlugin\TestPlugin_Admin;
    use TestPlugin\TestPlugin_Hooks;

    use TestPlugin\DataClasses\ServiceHelpers\RDSHelper;

    use TestPlugin\UtilityFunctions;
    use TestPlugin\Template;
    use TestPlugin\SQLLoader;
    use TestPlugin\CSSLoader;
    use TestPlugin\CSSResource;
    use TestPlugin\JSLoader;
    use TestPlugin\JSResource;
    use TestPlugin\JSResourceLocalizedData;

    use TestPlugin\PageManager;
    use TestPlugin\PageInfo;
    use TestPlugin\INIHelper;
    use TestPlugin\JSONHelper;
    use TestPlugin\DependencyInfo;
    use TestPlugin\DependencyType;

    use TestPlugin\PDOHelper;
    use TestPlugin\FieldCondition;

    use TestPlugin\Models\TestPluginModelDataHelper;

    use const TestPlugin\TestPlugin_URL;

    //Models
    use TestPlugin\Models\Referencable;

    /**
     * Class TestPlugin_Class
     * The main class file for the plugin.
     * Has main hooks, and calls to the admin class as well.
     *
     * @package TestPlugin
     */
    class TestPlugin_Class {
        //A param passed to the constructor, the absolute path to the main WordPress plugin "entrance file"
        public static $mainPluginFile = "";
        public static $pluginName = "Test Plugin";
        public static $pluginShortName = "testplugin";
        public static $test_plugin_version = "1.0.0";
        public static $test_plugin_db_version = "1.0.0";
        public static $test_plugin_external_db_version = "1.0.0";
        public static $test_db_table_prefix = "test_plugin_";//use this to "scope" your db tables when doing queries / storing data in custom tables

        public static $datetime_format = "Y-m-d\TH:i:sP";//The W3C constant, declared in DateTime / DateTimeInterface
        public static $integrityCheckIntervalFormat = IntervalType::MINUTES;
        public static $integrityCheckInterval = 10;

        public static $plugin_pages = null;
        public static function pluginPages(){
            if(TestPlugin_Class::$plugin_pages === null) {
                TestPlugin_Class::$plugin_pages = [];
                TestPlugin_Class::$plugin_pages[] = new PageInfo("testpluginuser", "Test Plugin User Page");
            }
            return TestPlugin_Class::$plugin_pages;
        }

        public static $templates;
        public static function getTemplates():Template{
            return TestPlugin_Class::$templates;
        }

        public static $sqlLoader;
        public static function getSQLLoader():SQLLoader{
            return TestPlugin_Class::$sqlLoader;
        }

        public static $cssLoader;
        public static function getCSSLoader():CSSLoader{
            return TestPlugin_Class::$cssLoader;
        }

        public static $jsLoader;
        public static function getJSLoader():JSLoader{
            return TestPlugin_Class::$jsLoader;
        }
        private static $pluginJSData = NULL;
        public static function getPluginJSData() {
            if(TestPlugin_Class::$pluginJSData == NULL) {
                TestPlugin_Class::$pluginJSData = array( 'ajaxurl' => admin_url( 'admin-ajax.php' ), 'pluginURL' => TestPlugin_URL,'siteURL' => site_url(),'uploadsURL'=> wp_upload_dir()['baseurl'],'ajaxEndpoints'=>TestPlugin_Class::getAjaxEndpoints(),"pluginName"=>TestPlugin_Class::$pluginShortName);
            }

            return TestPlugin_Class::$pluginJSData;
        }

        public static $pageManager;
        public static function getPageManager():PageManager{
            return TestPlugin_Class::$pageManager;
        }

        public static $iniHelper;
        public static function getINIHelper():INIHelper {
            return TestPlugin_Class::$iniHelper;
        }

        const TESTPLUGIN_EXT_DB_KEY = 'test_plugin_rds';
        const TESTPLUGIN_PDO_DB_KEY = 'test_plugin_pdo';
        public static $externalConnections = [];
        public static function getExternalConnection(string $key):?PDOHelper {
            if(!array_key_exists($key,TestPlugin_Class::$externalConnections)) {
                return null;
            } else {
                $containerInterfaceName = PDOHelperContainer::class;
                $pdoHelperName = PDOHelper::class;

                if(TestPlugin_Class::$externalConnections[$key] instanceof $pdoHelperName) {
                    return TestPlugin_Class::$externalConnections[$key];
                } else if(TestPlugin_Class::$externalConnections[$key] instanceof $containerInterfaceName) {
                    return TestPlugin_Class::$externalConnections[$key]->getPDOHelper();
                }
            }
        }

        public static $scriptsInit = false;
        //scripts and index of scripts
        public static $pluginScripts = [];
        //used to optimize searching/fetching during script output
        public static $pluginScriptsIndex = [];
        /**
         * Adds a JSResource script to be loaded whenever this plugin is loaded
         *
         * @param JSResource $script The script to associate with the plugin
         */
        public static function addPluginScript(JSResource $script) {
            if(!empty($script)) {
                $currentIdx = count(TestPlugin_Class::$pluginScripts);
                TestPlugin_Class::$pluginScripts[] = $script;
                TestPlugin_Class::$pluginScriptsIndex[$script->handle] = $currentIdx;
            }
        }

        /**
         * Gets the last plugin script handle, so it can be used to enqueue scripts after it
         *
         * @return string|null The last plugin script handle, or null if no scripts were added
         */
        public static function getLastPluginScriptHandle(){
            end(TestPlugin_Class::$pluginScriptsIndex);
            $lastScriptHandle = key(TestPlugin_Class::$pluginScriptsIndex);
            reset(TestPlugin_Class::$pluginScriptsIndex);

            return $lastScriptHandle;
        }

        //styles and index of styles
        public static $pluginStyles = [];
        //used to optimize searching/fetching during script output
        public static $pluginStylesIndex = [];
        /**
         * Adds a CSSResource script to be loaded whenever this plugin is loaded
         *
         * @param CSSResource $style The CSS to associate with the plugin
         */
        public static function addPluginStyle(CSSResource $style) {
            if(!empty($style)) {
                $currentIdx = count(TestPlugin_Class::$pluginStyles);
                TestPlugin_Class::$pluginStyles[] = $style;
                TestPlugin_Class::$pluginStylesIndex[$style->handle] = $currentIdx;
            }
        }
        /**
         * Gets the last plugin CSS handle, so it can be used to enqueue styles after it
         *
         * @return string|null The last plugin CSS handle, or null if no CSSResources were added
         */
        public static function getLastPluginStyleHandle(){
            end(TestPlugin_Class::$pluginStylesIndex);
            $lastStyleHandle = key(TestPlugin_Class::$pluginStylesIndex);
            reset(TestPlugin_Class::$pluginStylesIndex);

            return $lastStyleHandle;
        }

        //page specific scripts/styles
        public static $pageScripts = [];

        /**
         * The list of JSResource objects for the given pagename (an index in the $pageScripts array)
         *
         * @param string $pageName The pagename to look up the script list for
         * @return array The array of JSResource objects for this page
         */
        public static function getScriptsForPagename($pageName){
            if(empty($pageName) || !array_key_exists($pageName, TestPlugin_Class::$pageScripts)) {
                return [];
            } else {
                return TestPlugin_Class::$pageScripts[$pageName];
            }
        }

        public static $pageStyles = [];
        /**
         * The list of CSSResource objects for the given pagename (an index in the $pageStyles array)
         *
         * @param string $pageName The pagename to look up the style list for
         * @return array The array of CSSResource objects for this page
         */
        public static function getStylesForPagename($pageName){
            if(empty($pageName) || !array_key_exists($pageName, TestPlugin_Class::$pageStyles)) {
                return [];
            } else {
                return TestPlugin_Class::$pageStyles[$pageName];
            }
        }

        public static $VIEWER_ROLE = "test_plugin_viewer";
        public static $MANAGER_ROLE = "test_plugin_manager";
        public static $ADMIN_ROLE = "test_plugin_admin";
        public static $SUPERADMIN_ROLE = "test_plugin_super_admin";

        public static $ROLE_VIEW_CAPABILITY = "view_test_plugin";
        public static $ROLE_EDIT_CAPABILITY = "edit_test_plugin";
        public static $ROLE_EDIT_USERS_CAPABILITY = "edit_test_plugin_users";
        public static $ROLE_ADMIN_CAPABILITY = "admin_test_plugin";

        private static $pluginRoles = NULL;

        /**
         * Gets the role definitions (using native WordPress styles to define them) for this plugin
         *
         * @return array The associative array for the WordPress role definitions for roles of this plugin
         */
        public static function getPluginRoles():array {
            if(TestPlugin_Class::$pluginRoles === NULL) {
                TestPlugin_Class::$pluginRoles = [
                    TestPlugin_Class::$VIEWER_ROLE => [
                        "name" => "Test Plugin Viewer",
                        "capabilities" => [
                            TestPlugin_Class::$ROLE_VIEW_CAPABILITY => true,

                            TestPlugin_Class::$ROLE_EDIT_CAPABILITY => false,
                            TestPlugin_Class::$ROLE_EDIT_USERS_CAPABILITY => false,
                            TestPlugin_Class::$ROLE_ADMIN_CAPABILITY => false
                        ]
                    ],

                    TestPlugin_Class::$MANAGER_ROLE => [
                        "name" => "Test Plugin Manager",
                        "capabilities" => [
                            TestPlugin_Class::$ROLE_VIEW_CAPABILITY => true,
                            TestPlugin_Class::$ROLE_EDIT_CAPABILITY => true,

                            TestPlugin_Class::$ROLE_EDIT_USERS_CAPABILITY => false,
                            TestPlugin_Class::$ROLE_ADMIN_CAPABILITY => false
                        ]
                    ],

                    TestPlugin_Class::$ADMIN_ROLE => [
                        "name" => "Test Plugin Admin",
                        "capabilities" => [
                            TestPlugin_Class::$ROLE_VIEW_CAPABILITY => true,
                            TestPlugin_Class::$ROLE_EDIT_CAPABILITY => true,
                            TestPlugin_Class::$ROLE_EDIT_USERS_CAPABILITY => true,

                            TestPlugin_Class::$ROLE_ADMIN_CAPABILITY => false
                        ]
                    ],

                    TestPlugin_Class::$SUPERADMIN_ROLE => [
                        "name" => "Test Plugin SuperAdmin",
                        "capabilities" => [
                            TestPlugin_Class::$ROLE_VIEW_CAPABILITY => true,
                            TestPlugin_Class::$ROLE_EDIT_CAPABILITY => true,
                            TestPlugin_Class::$ROLE_EDIT_USERS_CAPABILITY => true,
                            TestPlugin_Class::$ROLE_ADMIN_CAPABILITY => true
                        ]
                    ]
                ];
            }

            return TestPlugin_Class::$pluginRoles;
        }

        private static $pluginDependencies = NULL;

        /**
         * Get DependencyInfo objects that represent dependencies for this plugin
         *
         * @return array The array of DependencyInfo objects that represent dependencies for this plugin
         */
        public static function getPluginDependencies():array {
            if(TestPlugin_Class::$pluginDependencies === NULL) {
                TestPlugin_Class::$pluginDependencies = [
                    new DependencyInfo("URE_Base_Lib","User Role Editor", DependencyType::CLASS_TYPE)
                    //current dependencies are the "User Role Editor" plugin
                ];
            }

            return TestPlugin_Class::$pluginDependencies;
        }

        /**
         * Veries dependencies for this plugin, and gets any messages about missing ones (empty if there aren't any missing)
         *
         * @return array The reuslting messages about missing dependencies (or empty if none are missing)
         */
        public static function checkDependencies():array {
            $resultMessages = [];

            foreach (TestPlugin_Class::getPluginDependencies() as $dependency) {
                if(!$dependency->verify()) {
                    $resultMessages[] = $dependency->getMissingMessage()." This is needed by the \"".TestPlugin_Class::$pluginName."\" plugin.";
                }
            }

            return $resultMessages;
        }

        private static $awsHelper = NULL;

        /**
         * Gets the AWSHelper object associated wth this plugin, and created via aws config files
         *
         * @return AWSHelper|null The helper to use to access AWS
         */
        public static function getAWSHelper():?AWSHelper {
            if(empty(TestPlugin_Class::$awsHelper)){
                $awsConfig = JSONHelper::load_json_file("aws_config_rw", TestPlugin_SRC_DIR . DIRECTORY_SEPARATOR . "Config");
                $s3Config = JSONHelper::load_json_file("aws_s3", TestPlugin_SRC_DIR . DIRECTORY_SEPARATOR . "Config");

                if(($awsConfig !== NULL) && ($s3Config !== NULL)){
                    try {
                        $awsHelper = new AWSHelper($awsConfig, $s3Config);
                        TestPlugin_Class::$awsHelper = $awsHelper;
                    } catch(\Exception $e) {
                        error_log("getAWSHelper - Exception:" . print_r($e, true));
                    }
                } else {
                    error_log("Unable to load AWS and S3 config files.");
                }
            }

            return TestPlugin_Class::$awsHelper;
        }

        private static $isDebug = false;
        public static function enableDebug() {TestPlugin_Class::$isDebug = true;}
        public static function disableDebug() {TestPlugin_Class::$isDebug = false;}
        public static function isDebug():bool {return TestPlugin_Class::$isDebug;}

        /**
         * TestPlugin_Class constructor.
         * This is called by the "entrance PHP file" that WordPress uses for plugins, that has the "header comment" for this plugin.
         *
         * @param string $mainPluginFile The full path to the "entrance PHP file" that has the plugin "header comment" for this plugin
         * @param bool $checkForOldData Whether to check and remove old plugin data -- mainly used for development to have a clean slate every execution
         */
        public function __construct($mainPluginFile, $checkForOldData = false) {
            global $wpdb;
            //stores the main plugin "entrance file" full path as provided to the constructor
            TestPlugin_Class::$mainPluginFile = $mainPluginFile;

            //create the template loader to be used with this plugin
            TestPlugin_Class::$templates = new Template(implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, "Templates"]), implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, "Templates", "Pages", "user"]), TestPlugin_Class::getPluginJSData());
            //create the SQL loader to be used with this plugin
            TestPlugin_Class::$sqlLoader = new SQLLoader(TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'SQL',$wpdb->prefix.TestPlugin_Class::$test_db_table_prefix, $wpdb->get_charset_collate() );
            //create the CSS loader to be used with this plugin
            TestPlugin_Class::$cssLoader = new CSSLoader(TestPlugin_DIR.DIRECTORY_SEPARATOR.'css', TestPlugin_URL.'/css', TestPlugin_Class::$pluginShortName);
            //create the JS loader to be used with this plugin
            TestPlugin_Class::$jsLoader = new JSLoader(TestPlugin_DIR.DIRECTORY_SEPARATOR.'js', TestPlugin_URL.'/js', TestPlugin_URL.'/css', TestPlugin_Class::$pluginShortName);
            //create the page manager object to be used with this plugin
            TestPlugin_Class::$pageManager = new PageManager(TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'Templates'.DIRECTORY_SEPARATOR.'Pages', TestPlugin_Class::$pluginName);
            //create the INI helper object to be used with this plugin
            TestPlugin_Class::$iniHelper = new INIHelper(TestPlugin_DIR.DIRECTORY_SEPARATOR.'private');

            if($checkForOldData) {
                TestPlugin_Class::removePluginData();
            }

            //The actions to take when activating the plugin
            register_activation_hook(TestPlugin_Class::$mainPluginFile, array(__NAMESPACE__.'\\TestPlugin_Class', 'activate_ops'));
            //The actions to take when deactivating the plugin
            register_deactivation_hook(TestPlugin_Class::$mainPluginFile, array(__NAMESPACE__.'\\TestPlugin_Class', 'deactivate_ops'));
            //The actions to take when uninstalling the plugin
            register_uninstall_hook(TestPlugin_Class::$mainPluginFile, array(__NAMESPACE__.'\\TestPlugin_Class', 'uninstall_ops') );

            //When plugins_loaded hook is called, we then can safely call our init function
            add_action('plugins_loaded', array($this,'initPlugin') );
        }

        public function initPlugin(){
            //check dependencies
            $resultMessages = TestPlugin_Class::checkDependencies();
            if(!empty($resultMessages)) {
                if(TestPlugin_Class::isDebug()){
                    error_log('Dependencies for the plugin \"' . TestPlugin_Class::$pluginName . ' are missing the following dependencies:' . print_r($resultMessages, true));
                }

                add_action('admin_notices', function() use ($resultMessages) {
                    ?>
                        <div class="notice notice-error">
                            <?php
                                foreach($resultMessages as $msg) {
                                    echo "<p>"._e( implode(' \n', $resultMessages) )."</p>";
                                }
                            ?>
                        </div>
                    <?php
                });
            }

            //any scripts to include when generating a head HTML element for a request
            add_action('wp_head', array(__NAMESPACE__ .'\\TestPlugin_Class', 'head_snippets') );

            TestPlugin_Class::registerUserAjaxEndpoints();
            TestPlugin_Admin::registerAjaxEndpoints();

            //initializes our hooks for this plugin
            new TestPlugin_Hooks();

            //register enqueue methods for determining what scripts/styles to enqueue using the wordpress api
            add_action('wp_enqueue_scripts', array(__NAMESPACE__.'\\TestPlugin_Class', 'enqueuePluginPageScriptsAndStyles'), UtilityFunctions::get_latest_wp_filter_priority('wp_enqueue_scripts'));
            add_filter('style_loader_tag', array(__NAMESPACE__.'\\TestPlugin_Class', 'handlePluginStyleTags'), 10, 4 );
            add_filter('script_loader_tag', array(__NAMESPACE__.'\\TestPlugin_Class', 'handlePluginScriptTags'), 10, 3);

            //init scripts / styles that should be loaded on every page of this plugin
            if(!TestPlugin_Class::$scriptsInit) {
                //Web Components 2.2.3
                TestPlugin_Class::addPluginScript(new JSResource(
                    'webcomponents-223-js',TestPlugin_URL.'/js/lib/@webcomponents/webcomponentsjs/webcomponents-bundle.js',[],'2.2.3',true,
                    'https://unpkg.com/@webcomponents/webcomponentsjs@2.2.3/webcomponents-bundle.js',['webcomponents223.min'],'sha384-Pu+Y0h0fO2Spp4zkEhZ6JSA+XueALk6Mauzpzuf7AK/A2LsOXsdY/XbcIuSU1WAp'
                ));
                //RequireJS 2.3.6
                TestPlugin_Class::addPluginScript(new JSResource(
                    'requirejs-236-js',TestPlugin_URL.'/js/lib/requirejs/require.js',[],'2.3.6',true,
                    'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js', ['requirejs236.min'],'sha384-38qS6ZDmuc4fn68ICZ1CTMDv4+Yrqtpijvp5fwMNdbumNGNJ7JVJHgWr2X+nJfqM'
                ));
                TestPlugin_Class::addPluginScript(new JSResource(
                    TestPlugin_Class::$pluginShortName.'_helper-js',TestPlugin_URL.'/js/testplugin_helper.js',[],false,true
                ));
                TestPlugin_Class::addPluginScript(new JSResource(
                    TestPlugin_Class::$pluginShortName.'_user-js',TestPlugin_URL.'/js/user/user.js',[],false,true
                ));
                TestPlugin_Class::addPluginStyle(new CSSResource(
                    TestPlugin_Class::$pluginShortName.'_global-css',TestPlugin_URL.'/css/global/global.min.css',[],false
                ));
                TestPlugin_Class::addPluginStyle(new CSSResource(
                    TestPlugin_Class::$pluginShortName.'_user-css',TestPlugin_URL.'/css/user/user.min.css',[],false
                ));

                //init any page specific scripts/styles
                $scriptsForPage = [];
                $stylesForPage = [];
                /*
                $scriptsForPage[] = new JSResource(
                    'test-js',TestPlugin_URL.'/js/test.js',[],false,true
                )
                $stylesForPage[] = new CSSResource(
                    'test-css',TestPlugin_URL.'/css/user/test.css',[],false
                )

                TestPlugin_Class::$pageScripts['pageName'] = $scriptsForPage;
                TestPlugin_Class::$pageStyles['pageName'] = $stylesForPage;
                //reset arrays to prevent further page definitions from using the same arrays
                $scriptsForPage = [];
                $stylesForPage = [];
                */

                TestPlugin_Class::$pageScripts['testpluginuser'] = [
                    //bootstrap4-tagsinput JS 0.8.0
                    new JSResource(
                        'tagsinput-080-js',TestPlugin_URL.'/js/fallbacks/tagsinput080.min.js',['jquery'],'0.8.0',true
                    )
                ];

                TestPlugin_Class::$pageStyles['testpluginuser'] = [
                    //bootstrap4-tagsinput CSS 0.8.0
                    new CSSResource(
                        'bootstrap4-tagsinput-080-css',TestPlugin_URL.'/css/local/tagsinput/tagsinput080.min.css',[],'0.8.0'
                    )
                ];

                //wp_enqueue_script('gc-plugin-loaded-js', GC_URL.'/js/plugin_loaded.min.js', array('jquery'), false, false);
                $pluginLoadedJS = new JSResource(
                    TestPlugin_Class::$pluginShortName.'_plugin_loaded-js',TestPlugin_URL.'/js/plugin_loaded.min.js',[],false,true
                );
                $pluginLoadedJS->extraDataToPass = new JSResourceLocalizedData('GlobalJSData', TestPlugin_Class::getPluginJSData());
                TestPlugin_Class::addPluginScript($pluginLoadedJS);

                TestPlugin_Class::$scriptsInit = true;
            }

            TestPlugin_Admin::init();

            //init our options class, so that option-related operations can be done
            add_action('admin_init', array(__NAMESPACE__ .'\\TestPlugin_Options', 'options_init'));

            //init any connections to any external DBs / services
            TestPlugin_Class::initExternalConnections(false, true);

            //check db when plugin is loaded if the db needs to be updated (the activation hook isn't called when the plugin is upgraded, or files copied via FTP)
            TestPlugin_Class::upgrade_plugin_check();

            //add hook to check if plugin pages exist in DB as WordPress posts (as a "page" for post type) and NOT trashed
            add_action('init', array(__NAMESPACE__ .'\\TestPlugin_Class', 'doPluginPagesCheck'));
            //ensure plugin roles exist
            add_action('init', array(__NAMESPACE__ .'\\TestPlugin_Class', 'doRoleCheck'));

            //attach handlers for other plugin filtering operations
            //hide plugin URL query variables from over-complicating the URL. Don't include any variables to hide that you want the user to be able to copy to get the ame page state to share with others
            add_filter('query_vars',array(__NAMESPACE__ .'\\TestPlugin_Class', 'maskPluginQueryVariables'));

            //include our template page loader, IFF the requested page is one of our plugin pages (as this template loader overrides the template being used by WordPress for the requested page)
            add_filter('template_include',array(__NAMESPACE__ .'\\TestPlugin_Class', 'loadPluginPageTemplates'));
            //if this plugin uploads files to be stored under "wp_contnt" or "uploads" then the media library normally will render these in it's menus -- you can hide them with this
            add_filter('posts_where',array(__NAMESPACE__ .'\\TestPlugin_Class', 'hideAssetsFromMediaLibrary'), 10, 2);
        }

        public static function initExternalConnections(bool $resetDB = false, bool $logConnections = true){
            global $wpdb;

            if(TestPlugin_Class::isDebug()){
                error_log("----------------------------- initExternalConnections -----------------------------");
            }

            /*
            if(!array_key_exists(TestPlugin_Class::TESTPLUGIN_EXT_DB_KEY,TestPlugin_Class::$externalConnections)) {
                try {
                    $configInfo = JSONHelper::load_json_file("aws_rds_rw",TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR."Config");
                    $loader = new SQLLoader(TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'SQL', 'tbl', PDOConnectionInfo::DEFAULT_CHARSET, ["{database_name}" => $configInfo["database"]]);
                    $rdsHelper = new RDSHelper($configInfo, $loader);
                    $helper = $rdsHelper->getPDOHelper();
                    $connected = $helper->isConnected();

                    if($connected){
                        TestPlugin_Class::$externalConnections[TestPlugin_Class::TESTPLUGIN_EXT_DB_KEY] = $helper;

                        if($logConnections){
                            error_log("Connected to external database: " . $helper->getDBEndpoint());
                        }
                    } else {
                        if($logConnections){
                            error_log("There was an error connecting to the external database: " . $helper->getDBEndpoint());
                        }
                    }

                    //reset the external db for dev testing
                    if($resetDB){
                        error_log("////////////////////////// --Reset DB-- //////////////////////////");
                        $result = $helper->ResetDB();
                        if(!$result->success) {
                            error_log("Errors occurred while resetting the DB:" . print_r($result->messages, true));
                        } else {
                            error_log("DB reset successful.");
                            //db has been reset
                        }
                    }
                } catch(\Exception $e){
                    if($logConnections) {
                        error_log("There was an exception when connecting to the RDS database:" . $e->getMessage());
                    }
                }
            }
            */

            if(!array_key_exists(TestPlugin_Class::TESTPLUGIN_PDO_DB_KEY,TestPlugin_Class::$externalConnections)) {
                error_log('Initializing PDO database:'.TestPlugin_Class::TESTPLUGIN_PDO_DB_KEY);
                $dbPrefix = $wpdb->prefix.'tppdo_';
                try {
                    $loader = new SQLLoader(TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'SQL', $dbPrefix, PDOConnectionInfo::DEFAULT_CHARSET);
                    $info = new PDOConnectionInfo(DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, "", DB_CHARSET);
                    $helper = new PDOHelper($info, $loader);
                    $connected = $helper->isConnected();

                    if($connected){
                        TestPlugin_Class::$externalConnections[TestPlugin_Class::TESTPLUGIN_PDO_DB_KEY] = $helper;

                        if($logConnections){
                            error_log("Connected to PDO database: " . $helper->getDBEndpoint());
                        }
                    } else {
                        if($logConnections){
                            error_log("There was an error connecting to the PDO database: " . $helper->getDBEndpoint());
                        }
                    }

                    //reset the external db for dev testing
                    if($resetDB){
                        error_log("////////////////////////// --Reset DB-- //////////////////////////");
                        $result = ModelBase::dropAllModelTables($helper);

                        if(!$result->success) {
                            error_log("Errors occurred while resetting the PDO database:" . print_r($result->messages, true));
                        } else {
                            error_log("DB reset successful.");
                            //db has been reset, set DB version option

                            $removedODBVersionOption = TestPlugin_Options::removePluginOption(TestPlugin_Options::PLUGIN_DB_VERSION_OPTION);
                            if(!$removedODBVersionOption) {
                                error_log("Unable to remove DB version option of:".TestPlugin_Options::PLUGIN_DB_VERSION_OPTION);
                            }

                        }
                    }
                } catch(\Exception $e){
                    if($logConnections) {
                        error_log("There was an exception when connecting to the PDO database:" . $e->getMessage());
                    }
                }
            }
        }

        public static function registerUserAjaxEndpoints() {
            foreach(TestPlugin_UserAjax::$exposedEndpoints as $endpoint) {
                add_action('wp_ajax_nopriv_'.TestPlugin_Class::$pluginShortName.'_'.$endpoint, array(__NAMESPACE__.'\\TestPlugin_UserAjax', $endpoint));
                add_action('wp_ajax_'.TestPlugin_Class::$pluginShortName.'_'.$endpoint, array(__NAMESPACE__.'\\TestPlugin_UserAjax', $endpoint));
            }
        }

        public static function head_snippets() {
            if(TestPlugin_Class::isPluginPage() ) {
                $pageName = TestPlugin_Class::getUserPluginPage();

                echo TestPlugin_Class::$templates->render('head_snippets', array(), $pageName);
            }
        }

        public static function upgrade_plugin_check() {
            if (TestPlugin_Options::getPluginOption(TestPlugin_Options::PLUGIN_VERSION_OPTION) != TestPlugin_Class::$test_plugin_version || true) {
                TestPlugin_Class::activate_ops();
            }

        }

        //used to ECHO the warning if the plugin is missing any files
        public static function incomplete_install_warning() {
            $msgStr = 'The installation of the plugin "'.TestPlugin_Class::$pluginName.'" is incomplete. Please re-install the plugin.';
            UtilityFunctions::log_message($msgStr);
            echo UtilityFunctions::noticeMessageHtml($msgStr, NoticeType::ERROR);
        }

        public static function maskPluginQueryVariables($vars) {
            //$vars[] = "var1";
            return $vars;
        }

        public static function doPluginPagesCheck(){
            foreach(TestPlugin_Class::pluginPages() as $pageToCheck) {
                TestPlugin_Class::$pageManager->ensureBasicPluginPageExists($pageToCheck);
            }
        }

        /**
         * @return bool Whether the page is a USER-side plugin page
         */
        public static function isUserPluginPage() {
            return !empty(TestPlugin_Class::getUserPluginPage());
        }

        /**
         * @return string Gets the USER-side plugin page name
         */
        public static function getUserPluginPage(){
            $pageName = "";
            foreach (TestPlugin_Class::pluginPages() as $page) {
                $isPage = $page->isCurrentPage();
                if($isPage) {
                    $pageName = $page->getPostName();
                    break;
                }
            }

            return $pageName;
        }

        /**
         * @return bool Whether the page is a plugin page (user or admin side)
         */
        public static function isPluginPage() {
            $isAdmin = TestPlugin_Admin::isAdminPage();
            $isUser = TestPlugin_Class::isUserPluginPage();
            $isAjax = wp_doing_ajax();
            return  (!$isAjax) && ($isUser || $isAdmin);
        }

        /**
         * @param mixed $template The current WordPress template for this request
         * @return string The full path to this plugin's template loader file
         */
        public static function loadPluginPageTemplates($template){
            if(TestPlugin_Class::isPluginPage()){
                $template = implode(DIRECTORY_SEPARATOR, [
                    TestPlugin_SRC_DIR,
                    'Templates',
                    'Pages',
                    'base-template.php'
                ]);
            }
            return $template;
        }

        public static function hideAssetsFromMediaLibrary($where, $query) {
            global $wpdb;
            //to safeguard custom attachments, we need to add a filter for every type that could show up in the media library
            //we dont want users to see / edit any of these resources from the media library

            $assetKeywordsToHide = [
                "test_plugin_asset"//a folder name that contains assets for this plugin in wp_content\uploads
            ];

            foreach ($assetKeywordsToHide as $keyword) {
                $where .= $wpdb->prepare( ' AND (' . $wpdb->posts . '.guid NOT LIKE \'%%%s%%\')', $keyword );
            }

            return $where;
        }

        public static function activate_ops() {
            global $wpdb;
            //ensure secure use
            if (!current_user_can( 'activate_plugins') ){
                return;
            }
            $plugin = isset($_REQUEST['plugin']) ? $_REQUEST['plugin'] : '';
            //the below check fails, likely due to a wrong nonce name (or the nonce isn't available in this phase of the WordPress lifecycle)
            //enabling this currently will make an endless loop as this check executes every "cycle" of WordPress. It has been disabled for now
            //The error message caused by this will be (as of current 5.0.3): The link you followed has expired.

            //check_admin_referer( "activate-plugin_".$plugin );

            require_once(ABSPATH.'wp-admin'.DIRECTORY_SEPARATOR.'includes'.DIRECTORY_SEPARATOR.'upgrade.php' );

            $installed_ver = TestPlugin_Options::getPluginOption(TestPlugin_Options::PLUGIN_VERSION_OPTION);
            $newInstall = !$installed_ver;//option doesn't exist and is "falsey," so this must be a new install

            //now if the db hasn't been initialized -- a freshly installed plugin, do that here
            if($newInstall) {
                //do any plugin file manipulations
                TestPlugin_Class::install_ops();
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

            TestPlugin_Class::initExternalConnections(false, true);
            TestPlugin_Class::db_update_ops();

            error_log("************ Activated ".TestPlugin_Class::$pluginName." - Version: ".$installed_ver." ************");
        }

        public static function db_update_ops() {
            $extDBHelper = TestPlugin_Class::getExternalConnection(TestPlugin_Class::TESTPLUGIN_PDO_DB_KEY);

            $installed_db_ver = TestPlugin_Options::getPluginOption(TestPlugin_Options::PLUGIN_DB_VERSION_OPTION);
            $newInstall = !$installed_db_ver;//option doesn't exist and is "falsey," so this must be a new install

            //now if the db hasn't been initialized -- a freshly installed plugin, do that here
            if($newInstall) {
                //create tables, data, etc
                if(!empty($extDBHelper)) {
                    $result = TestPlugin_Class::initEmptyDatabase($extDBHelper);

                    //If the above failed, then FAIL early as the DB isn't set up
                    if (!$result->success) {
                        throw new \Exception("Initializing the empty database for \"".TestPlugin_Class::TESTPLUGIN_PDO_DB_KEY."\" failed.");
                    } else {
                        $setDBVersionOption = TestPlugin_Options::addPluginOption(TestPlugin_Options::PLUGIN_DB_VERSION_OPTION, TestPlugin_Class::$test_plugin_db_version);
                    }

                    // The below was used for TESTING this phase of operation of the plugin lifecycle, currently not needed
                    //TestPlugin_Class::processDBUpdatePhase(['v1_tables','v1_tables_2'],'v1_constraints', 'v1_data');
                } else {
                    if(TestPlugin_Class::isDebug()) {
                        throw new \Exception("A connection to the external database \"".TestPlugin_Class::TESTPLUGIN_PDO_DB_KEY."\" failed.");
                    }
                }
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

        public static function initEmptyDatabase(PDOHelper $helper):DBResult {
            error_log("-------------------------- Setup SQL --------------------------");
            $allSQL = ModelBase::getAllModelSetupSQL($helper);
            //create tables
            $result = $helper->SetupDB($allSQL['table']);

            if(!$result->success) {
                $msg = "There were errors running table setup scripts: ".print_r($result->messages,true);
                error_log($msg);
                $result->addMessage($msg);
            } else {
                if(!empty($allSQL['translation_table'])) {
                    $result = $helper->SetupDB($allSQL['translation_table']);
                }

                if($result->success) {//either be true from prior setup, or true from translation table setup
                    //all tables created
                    error_log("(".count($allSQL['table']).") table setup SQL statements successful.");
                    error_log("-------------------------- Create Model Objects --------------------------");
                    $allModels = TestPluginModelDataHelper::getBaseDataModels([
                        "modelDatabaseVersion" => TestPlugin_Class::$test_plugin_db_version
                    ]);
                    //models created
                    error_log("Created ".count($allModels)." models to be saved.");
                    error_log("-------------------------- Save Model Objects --------------------------");

                    $helper->disableForeignKeyChecks();
                    $result = TestPluginModelDataHelper::saveDataModels($helper, $allModels);
                    $helper->enableForeignKeyChecks();
                    if(!$result->success) {
                        $msg = 'Save models had an error:'.print_r($result,true);
                        error_log($msg);
                        $result->addMessage($msg);
                    } else {
                        error_log("Saved ".count($allModels)." models.");
                        $result->result = $allModels;
                    }

                } else {
                    $msg = "There were errors running translation table setup scripts: ".print_r($result->messages,true);
                    error_log($msg);
                    $result->addMessage($msg);
                }
            }

            return $result;
        }

        /**
         * A convenience method to process a PHASE of updating the database, such as migrating from one version of the database to another
         */
        private static function processDBUpdatePhase($tblSqlFiles, $constraintSqlFiles, $dataSqlFiles){
            //The below calls are for DEMONSTRATION of general things done here
            //These methods do NOT take an array of filenames (parameter type of 'filename' is a STRING), so a loop would be needed to actually utilize these methods for genuine use

            //$tblSqlArray = TestPlugin_Class::$sqlLoader->getSqlFileStatements($tblSqlFiles);
            //$constraintSqlArray = TestPlugin_Class::$sqlLoader->getSqlFileStatements($constraintSqlFiles);
            //$dataSqlArray = TestPlugin_Class::$sqlLoader->getSqlFileStatements($dataSqlFiles);

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

        public static function install_ops() {
            global $wpdb;

            error_log("************ Installed ".TestPlugin_Class::$pluginName." - Version: ".TestPlugin_Class::$test_plugin_version." ************");
        }

        public static function uninstall_ops() {
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
            TestPlugin_Class::removePluginRoles();

            error_log("************ Uninstalled ".TestPlugin_Class::$pluginName." - Version: ".$installed_ver." ************");
        }

        public static function removePluginData() {
            $uninstallSqlArray = TestPlugin_Class::$sqlLoader->getSqlFileStatements('uninstall');

            TestPlugin_Options::removePluginOption(TestPlugin_Options::PLUGIN_VERSION_OPTION);
            TestPlugin_Options::removePluginOption(TestPlugin_Options::PLUGIN_DB_VERSION_OPTION);

            TestPlugin_Class::removePluginPages();
        }

        public static function removePluginPages(){
            foreach (TestPlugin_Class::pluginPages() as $page) {
                TestPlugin_Class::$pageManager->deletePluginPage($page);
            }
        }

        public static function getAjaxEndpoints($includeAdmin = false):array {
            $ajaxEndpoints = ['user'=>[],'admin'=>[]];

            foreach(TestPlugin_UserAjax::$exposedEndpoints as $endpoint) {
                $ajaxEndpoints['user'][$endpoint] = TestPlugin_Class::$pluginShortName.'_'.$endpoint;
            }
            unset($endpoint);

            if($includeAdmin){
                foreach(TestPlugin_AdminAjax::$exposedEndpoints as $endpoint){
                    $ajaxEndpoints['admin'][$endpoint] = TestPlugin_Class::$pluginShortName . '_' . $endpoint;
                }
                unset($endpoint);
            }

            if(TestPlugin_Class::isDebug()) {
                error_log('Ajax endpoints:'.print_r($ajaxEndpoints,true));
            }

            return $ajaxEndpoints;
        }

        public static function enqueuePluginPageScriptsAndStyles() {
            //gather ajax endpoints to expose
            $ajaxEndpoints = TestPlugin_Class::getAjaxEndpoints(true);

            //load scripts and styles that apply to all pages related to the plugin
            if(TestPlugin_Class::isUserPluginPage() ) {
                $pageName = TestPlugin_Class::getUserPluginPage();

                //enqueue our scripts, in order (and chain them via dependencies to force a load order)
                //our script filter will handle outputting any tags for them
                //We can add fallback scripts as normal

                $lastScriptHandle = TestPlugin_Class::$jsLoader->enqueueAndProcessScripts(TestPlugin_Class::$pluginScripts);
                $lastStyleHandle = TestPlugin_Class::$cssLoader->enqueueAndProcessStyles(TestPlugin_Class::$pluginStyles);

                $lastStyleHandle = TestPlugin_Class::$cssLoader->enqueueCSSIfExists('global', '', 'global', $lastStyleHandle);

                //load scripts and styles that pertain to a specific page (based on the page name)
                $lastStyleHandle = TestPlugin_Class::$cssLoader->enqueueCSSForPage($pageName, false, $lastStyleHandle);
                $lastScriptHandle = TestPlugin_Class::$jsLoader->enqueueJSForPage($pageName, false, $lastScriptHandle);

                //load page specific scripts defined for this plugin
                $scriptsForPage = TestPlugin_Class::getScriptsForPagename($pageName);
                if(count($scriptsForPage) > 0) {
                    //we have scripts to process for this page
                    $lastScriptHandle = TestPlugin_Class::$jsLoader->enqueueAndProcessScripts($scriptsForPage, $lastScriptHandle);
                }

                //load page specific styles defined for this plugin
                $stylesForPage = TestPlugin_Class::getStylesForPagename($pageName);
                if(count($stylesForPage) > 0) {
                    //we have scripts to process for this page
                    $lastStyleHandle = TestPlugin_Class::$cssLoader->enqueueAndProcessStyles($stylesForPage, $lastStyleHandle);
                }

                //add any data used by scripts, using "wp_localize_script"
                wp_localize_script(TestPlugin_Class::$pluginShortName.'_helper-js', TestPlugin_Class::$pluginShortName.'_GlobalJSData', TestPlugin_Class::getPluginJSData());

            }
        }

        /**
         * Gets the script tag HTML element for a given tag (the existing tag being created - and passed to this filter by WordPress) and handle.
         * This is hooked to the WordPress action "script_loader_tag" in the function TestPlugin::initPlugin.
         * This was created because WordPress doesn't support an easy way for Subresource Integrity (SRI) usage and fallbacks if a script fails to load/isn't found
         *
         * @param $tag
         * @param $handle
         * @return mixed
         */
        public static function handlePluginScriptTags($tag,$handle) {
            //find a script of our plugin that matches the handle parameter of this filter
            //if none is found, then do nothing
            if(!is_admin() && array_key_exists($handle, TestPlugin_Class::$pluginScriptsIndex)) {
                $scriptIdx = TestPlugin_Class::$pluginScriptsIndex[$handle];
                $script = TestPlugin_Class::$pluginScripts[$scriptIdx];
                $tag = TestPlugin_Class::$jsLoader->getScriptTag($script);
            } else if(array_key_exists($handle, TestPlugin_Admin::$pluginScriptsIndex)) {
                $scriptIdx = TestPlugin_Admin::$pluginScriptsIndex[$handle];
                $script = TestPlugin_Admin::$pluginScripts[$scriptIdx];
                $tag = TestPlugin_Class::$jsLoader->getScriptTag($script);
            }

            return $tag;
        }

        /**
         * Gets the style tag HTML element for a given tag (the existing tag being created - and passed to this filter by WordPress) and handle.
         * This is hooked to the WordPress action "style_loader_tag" in the function TestPlugin::initPlugin.
         * This was created because WordPress doesn't support an easy way for Subresource Integrity (SRI) usage and fallbacks if a style fails to load/isn't found
         *
         * @param $tag
         * @param $handle
         * @return mixed
         */
        public static function handlePluginStyleTags($html,$handle) {
            //find a style of our plugin that matches the handle parameter of this filter
            //if none is found, then do nothing
            if(!is_admin() && array_key_exists($handle, TestPlugin_Class::$pluginStylesIndex)) {
                $styleIdx = TestPlugin_Class::$pluginStylesIndex[$handle];
                $style = TestPlugin_Class::$pluginStyles[$styleIdx];
                $html = TestPlugin_Class::$cssLoader->getScriptTag($style);
            } else if(array_key_exists($handle, TestPlugin_Admin::$pluginStylesIndex)) {
                $styleIdx = TestPlugin_Admin::$pluginStylesIndex[$handle];
                $style = TestPlugin_Admin::$pluginStyles[$styleIdx];
                $html = TestPlugin_Class::$cssLoader->getScriptTag($style);
            }

            return $html;
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
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'BasicEnum.php',
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'DependencyType.php',
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'IntervalType.php',
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'LocalizationHelper.php',
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'NoticeType.php',
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'Template.php',
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'TestPlugin_Admin.php',
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'TestPlugin_AdminAjax.php',
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'TestPlugin_Class.php',
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'TestPlugin_Hooks.php',
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'TestPlugin_Options.php',
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'TestPlugin_UserAjax.php',
                    TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'UtilityFunctions.php',
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'AjaxFunctionClasses', 'Pages', 'Admin', 'testplugin_AjaxFunctions.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'AjaxFunctionClasses', 'Pages', 'User', 'testpluginuser_AjaxFunctions.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'ContentHelpers', 'AjaxResponse.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'ContentHelpers', 'AjaxResponseWithHTML.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'ContentHelpers', 'CSSLoader.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'ContentHelpers', 'CSSResource.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'ContentHelpers', 'DependencyInfo.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'ContentHelpers', 'FileUploadHelper.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'ContentHelpers', 'FileValidationOptions.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'ContentHelpers', 'FileValidationResult.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'ContentHelpers', 'INIHelper.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'ContentHelpers', 'JSLoader.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'ContentHelpers', 'JSONHelper.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'ContentHelpers', 'JSResource.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'ContentHelpers', 'JSResourceLocalizedData.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'ContentHelpers', 'PageInfo.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'ContentHelpers', 'PageManager.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'ContentHelpers', 'UploadException.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'ContentHelpers', 'WPUploadHelper.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'DataServiceHelpers', 'AWSHelper.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'DataServiceHelpers', 'DBResult.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'DataServiceHelpers', 'FieldCondition.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'DataServiceHelpers', 'FieldConditionGroup.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'DataServiceHelpers', 'PDOConnectionInfo.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'DataServiceHelpers', 'PDOHelper.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'DataServiceHelpers', 'PDOHelperContainer.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'DataServiceHelpers', 'SessionHelper.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'DataServiceHelpers', 'SQLLoader.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'DataServiceHelpers', 'YouTubeHelper.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'DataServiceHelpers', 'YouTubeSearchResult.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'DataServiceHelpers', 'ServiceHelpers', 'RDSHelper.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'DataServiceHelpers', 'ServiceHelpers', 'S3Bucket.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'DataServiceHelpers', 'ServiceHelpers', 'S3Helper.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'Models', 'ManyToMany.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'Models', 'ModelBase.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'Models', 'ModelCache.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'Models', 'ModelDataHelper.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'Models', 'Referencable.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'Models', 'TestPluginModelDataHelper.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'Models', 'Translatable.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'Models', 'Classes', 'Language.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'Models', 'Classes', 'Role.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'Models', 'Classes', 'Setting.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'Models', 'Classes', 'StoredString.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'Models', 'Classes', 'User.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'Models', 'Classes', 'UserGroup.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'Models', 'Classes', 'UserUserGroup.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'Templates', 'Pages', 'base-template.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'Templates', 'Pages', 'admin', 'testplugin', 'head_snippets.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'Templates', 'Pages', 'admin', 'testplugin', 'test-tab-content.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'Templates', 'Pages', 'admin', 'testplugin', 'testplugin.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'Templates', 'Pages', 'admin', 'testplugin', 'testplugin-data.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'Templates', 'Pages', 'user', 'testpluginuser', 'head_snippets.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'Templates', 'Pages', 'user', 'testpluginuser', 'testpluginuser.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'Templates', 'Pages', 'user', 'testpluginuser', 'testpluginuser-data.php']),
                    implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, 'Templates', 'Pages', 'user', 'testpluginuser', 'user-page-content.php']),
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

        public static function doRoleCheck(){
            if (!function_exists('add_role') ) {
                require_once(ABSPATH.'wp-includes/capabilities.php');
            }

            //if plugin roles don't exist, create them
            //this assumes capabilities of the roles haven't been modified
            $currentRoles = UtilityFunctions::getWPRoles();
            $addedRole = false;
            foreach(TestPlugin_Class::getPluginRoles() as $key => $role) {
                if(!array_key_exists($key, $currentRoles)) {
                    add_role($key, $role['name'], $role['capabilities']);
                    $addedRole = true;
                }
            }

            if($addedRole) {
                UtilityFunctions::getWPRoles(true);
            }
        }

        public static function removePluginRoles(){
            if (!function_exists('add_role') ) {
                require_once(ABSPATH.'wp-includes/capabilities.php');
            }

            foreach(TestPlugin_Class::getPluginRoles() as $key => $role) {
                remove_role($key);
            }
        }
    }
}
 ?>