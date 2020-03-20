<?php
namespace TestPlugin {
    use TestPlugin\TestPlugin_Options;
    use TestPlugin\DataClasses\AWSHelper;

    class TestPlugin_Admin {
        public static $admin_pages = [
            "testplugin"
        ];

        public static $scriptsInit = false;
        //scripts and index of scripts
        public static $pluginScripts = [];
        //used to optimize searching/fetching during script output
        public static $pluginScriptsIndex = [];

        /**
         * Adds a JSResource script to be loaded whenever this plugin (admin-side) is loaded
         *
         * @param JSResource $script The script to associate with the plugin
         */
        public static function addPluginScript(JSResource $script) {
            if(!empty($script)) {
                $currentIdx = count(TestPlugin_Admin::$pluginScripts);
                TestPlugin_Admin::$pluginScripts[] = $script;
                TestPlugin_Admin::$pluginScriptsIndex[$script->handle] = $currentIdx;
            }
        }

        /**
         * Gets the last plugin script handle, so it can be used to enqueue scripts after it
         *
         * @return string|null The last plugin script handle, or null if no scripts were added
         */
        public static function getLastPluginScriptHandle(){
            end(TestPlugin_Admin::$pluginScriptsIndex);
            $lastScriptHandle = key(TestPlugin_Admin::$pluginScriptsIndex);
            reset(TestPlugin_Admin::$pluginScriptsIndex);

            return $lastScriptHandle;
        }

        //styles and index of styles
        public static $pluginStyles = [];
        //used to optimize searching/fetching during script output
        public static $pluginStylesIndex = [];

        /**
         * Adds a CSSResource script to be loaded whenever this plugin (admin-side) is loaded
         *
         * @param CSSResource $style The CSS to associate with the plugin
         */
        public static function addPluginStyle(CSSResource $style) {
            if(!empty($style)) {
                $currentIdx = count(TestPlugin_Admin::$pluginStyles);
                TestPlugin_Admin::$pluginStyles[] = $style;
                TestPlugin_Admin::$pluginStylesIndex[$style->handle] = $currentIdx;
            }
        }
        /**
         * Gets the last plugin CSS handle, so it can be used to enqueue styles after it
         *
         * @return string|null The last plugin CSS handle, or null if no CSSResources were added
         */
        public static function getLastPluginStyleHandle(){
            end(TestPlugin_Admin::$pluginStylesIndex);
            $lastStyleHandle = key(TestPlugin_Admin::$pluginStylesIndex);
            reset(TestPlugin_Admin::$pluginStylesIndex);

            return $lastStyleHandle;
        }

        private static $pluginJSData = NULL;

        /**
         * Gets the data array that's passed to admin JS scripts, via "wp_localize_script"
         *
         * @return array The data array for the admin JS script data, with the following structure:
         * ["ajaxurl"=>"","nonce"=>"","pluginURL"=>"","siteURL"=>"","uploadsURL"=>"","pluginName"=>"","ajaxEndpoints"=>""]
         */
        public static function getAdminPluginJSData() {
            if(TestPlugin_Admin::$pluginJSData == NULL) {
                TestPlugin_Admin::$pluginJSData = array('ajaxurl' => admin_url('admin-ajax.php'), 'nonce' => wp_create_nonce('ajax-test-plugin-admin-pages'), 'pluginURL' => TestPlugin_URL, 'siteURL' => site_url(), 'uploadsURL' => wp_upload_dir()['baseurl'], 'pluginName'=>TestPlugin_Class::$pluginShortName, 'ajaxEndpoints'=>TestPlugin_Class::getAjaxEndpoints(true));
            }

            return TestPlugin_Admin::$pluginJSData;
        }

        //ADMIN page specific scripts/styles
        public static $pageScripts = [];
        public static $pageStyles = [];

        public static $templates;
        public static function getTemplates():Template{
            return TestPlugin_Admin::$templates;
        }

        private static $isDebug = false;
        public static function enableDebug() {TestPlugin_Admin::$isDebug = true;}
        public static function disableDebug() {TestPlugin_Admin::$isDebug = false;}
        public static function isDebug():bool {return TestPlugin_Admin::$isDebug;}

        public function __construct() {
            TestPlugin_Admin::$templates = new Template(implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, "Templates"]),implode(DIRECTORY_SEPARATOR, [TestPlugin_SRC_DIR, "Templates", "Pages", "admin"]), TestPlugin_Admin::getAdminPluginJSData());

            //hook to make the admin menu bar show up
            add_action('wp_before_admin_bar_render', array(__NAMESPACE__.'\\TestPlugin_Admin', 'wp_before_admin_bar_render'));
            //hook to get the admin scripts to enqueue
            add_action('admin_enqueue_scripts', array(__NAMESPACE__.'\\TestPlugin_Admin', 'admin_enqueue_scripts_and_styles'), 9999);
            //hook to output things in the head of the HTML of a page in the admin side
            add_action('admin_head', array(__NAMESPACE__ .'\\TestPlugin_Admin', 'admin_head_snippets') );

            //register menu options
            add_action('admin_menu', array(__NAMESPACE__ .'\\TestPlugin_Admin', 'add_admin_pages'));

            //init scripts / styles that should be loaded on every ADMIN page of this plugin
            if(!TestPlugin_Admin::$scriptsInit) {
                //jQuery Validate 1.19.0
                TestPlugin_Admin::addPluginScript(new JSResource(
                    'jqueryvalidate-1190-js',TestPlugin_URL.'/js/lib/jquery-validation/dist/jquery.validate.min.js',['jquery'],'1.19.0',true,
                    'https://cdn.jsdelivr.net/npm/jquery-validation@1.19.0/dist/jquery.validate.min.js',['jqueryvalidate1190.min'],'sha384-jR1IKAba71QSQwPRf3TY+RAEovSBBqf4Hyp7Txom+SfpO0RCZPgXbINV+5ncw+Ph'
                ));
                TestPlugin_Admin::addPluginScript(new JSResource(
                    'jqueryvalidate-additional-1190-js',TestPlugin_URL.'/js/lib/jquery-validation/dist/additional-methods.min.js',['jquery'],'1.19.0',true,
                    'https://cdn.jsdelivr.net/npm/jquery-validation@1.19.0/dist/additional-methods.min.js',[],'sha384-dIRuOjq+VyvX1yZK4DxOQmeAaqKo5j5C1benwAYm2wXpif4kDSSxhAyn0fl933e3'
                ));
                //Tooltipster 4.2.6
                TestPlugin_Admin::addPluginScript(new JSResource(
                    'tooltipster-426-js',TestPlugin_URL.'/js/lib/tooltipster/dist/js/tooltipster.bundle.min.js',[],'4.2.6',true
                ));
                TestPlugin_Admin::addPluginScript(new JSResource(
                    'tooltipster-svg-426-js',TestPlugin_URL.'/js/lib/tooltipster/dist/js/plugins/tooltipster/SVG/tooltipster-SVG.min.js',[],'4.2.6',true
                ));
                TestPlugin_Admin::addPluginStyle(new CSSResource(
                    'tooltipster-426-css',TestPlugin_URL.'/js/lib/tooltipster/dist/css/tooltipster.bundle.min.css',[],'4.2.6'
                ));
                TestPlugin_Admin::addPluginStyle(new CSSResource(
                    'tooltipster-426-sideTip-light-css',TestPlugin_URL.'/js/lib/tooltipster/dist/css/plugins/tooltipster/sideTip/themes/tooltipster-sideTip-light.min.css',[],'4.2.6'
                ));
                //jQueryConfirm 3.3.4
                /*
                TestPlugin_Admin::addPluginScript(new JSResource(
                    'jQueryConfirm-334-js',TestPlugin_URL.'/js/lib/bootstrap/dist/js/local/jquery-confirm/jquery-confirm.min.js',[],'3.3.4',true,
                    'https://cdnjs.cloudflare.com/ajax/libs/jquery-confirm/3.3.4/jquery-confirm.min.js',['jqueryconfirm334.min'],'sha384-kjb3ERfmTd6UCpsYld+ISpM404X6LT804aaMmj/2Ffz3XK2RXIQdWhSdtIFve+OO'
                ));
                */
                TestPlugin_Admin::addPluginStyle(new CSSResource(
                    'jQueryConfirm-334-css',TestPlugin_URL.'/css/local/jquery-confirm/jquery-confirm.min.css',[],'3.3.4',
                    'https://cdnjs.cloudflare.com/ajax/libs/jquery-confirm/3.3.4/jquery-confirm.min.css'
                ));
                //FontAwesome 4.7.0
                TestPlugin_Admin::addPluginStyle(new CSSResource(
                    'font-awesome-470-css',TestPlugin_URL.'/css/local/fontawesome/css/font-awesome.min.css',[],'4.7.0',
                    'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css'
                ));

                //Popper 1.14.6
                TestPlugin_Admin::addPluginScript(new JSResource(
                    'popper-1146-js',TestPlugin_URL.'/js/lib/popper.js/dist/popper.min.js',['jquery'],'1.14.6',true,
                    'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js',['popper1146'],'sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut'
                ));
                //Bootstrap 4.2.1
                TestPlugin_Admin::addPluginScript(new JSResource(
                    'bootstrap-421-js',TestPlugin_URL.'/js/lib/bootstrap/dist/js/bootstrap.min.js',['jquery','json2'],'4.2.1',true,
                    'https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js',['fontawesome470.min','bootstrap421.min'],''
                ));
                TestPlugin_Admin::addPluginStyle(new CSSResource(
                    'bootstrap-421-css',TestPlugin_URL.'/js/lib/bootstrap/dist/css/bootstrap.min.css',[],'4.2.1',
                    'https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css'
                ));
                //JSCookie 2.2.1
                TestPlugin_Admin::addPluginScript(new JSResource(
                    'jscookie-221-js',TestPlugin_URL.'/js/lib/js-cookie/src/js.cookie.js',[],'2.2.1',true,
                    'https://cdn.jsdelivr.net/npm/js-cookie@2.2.1/src/js.cookie.js',['jscookie221.min'],'sha256-P8jY+MCe6X2cjNSmF4rQvZIanL5VwUUT4MBnOMncjRU='
                ));
                //jQuery InputMask 4.0.6
                TestPlugin_Admin::addPluginScript(new JSResource(
                    'jquery-inputmask-406-js',TestPlugin_URL.'/js/lib/inputmask/dist/min/jquery.inputmask.bundle.min.js',[],'4.0.6',true
                ));
                //DateRange Picker 3.0.5
                TestPlugin_Admin::addPluginScript(new JSResource(
                    'daterangepicker-305-js',TestPlugin_URL.'/js/lib/daterangepicker/daterangepicker.js',[],'3.0.5',true,
                    'https://cdn.jsdelivr.net/npm/bootstrap-daterangepicker@3.0.5/daterangepicker.js',['daterangepicker305.min'],'sha256-cHE5PSNtnDXwkEkH0he5XkJFPiBWpFKqBgBb9UWd+dI='
                ));
                TestPlugin_Admin::addPluginStyle(new CSSResource(
                    'daterangepicker-305-css',TestPlugin_URL.'/js/lib/daterangepicker/daterangepicker.css',[],'3.0.5',
                    'https://cdn.jsdelivr.net/npm/bootstrap-daterangepicker@3.0.5/daterangepicker.css'
                ));
                //Flag Icons CSS 3.2.1
                TestPlugin_Admin::addPluginStyle(new CSSResource(
                    'flagicons-321-css',TestPlugin_URL.'/js/lib/flag-icon-css/css/flag-icon.min.css',[],'3.2.1'
                ));

                //JQuery Confirm CSS 3.3.3
                TestPlugin_Admin::addPluginStyle(new CSSResource(
                    'jqueryconfirm-333-css',TestPlugin_URL.'/js/lib/jquery-confirm/dist/jquery-confirm.min.css',[],'3.3.3'
                ));

                //Bootstrap MultiSelect CSS 0.9.15
                TestPlugin_Admin::addPluginStyle(new CSSResource(
                    'bootstrapmultiselect-0915-css',TestPlugin_URL.'/css/local/bootstrap-multiselect/bootstrap-multiselect.min.css',[],'0.9.15'
                ));

                //Bootstrap Select CSS 1.13.7
                TestPlugin_Admin::addPluginStyle(new CSSResource(
                    'bootstrapselect-1137-css',TestPlugin_URL.'/js/lib/bootstrap-select/dist/css/bootstrap-select.min.css',[],'1.13.7',
                    "https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.7/dist/css/bootstrap-select.min.css","sha384-GRv+W7LEquTrIrxJ4vfPVxi/jq1ahj5zF24RHYM6qY/Hbfv4OUvafEHSDRAdHRD0"
                ));

                //Tooltipster CSS 4.2.6
                TestPlugin_Admin::addPluginStyle(new CSSResource(
                    'tooltipster-426-css',TestPlugin_URL.'/js/lib/tooltipster/dist/css/tooltipster.bundle.min.css',[],'4.2.6',
                    "https://cdn.jsdelivr.net/npm/tooltipster@4.2.6/dist/css/tooltipster.bundle.min.css","sha256-Qc4lCfqZWYaHF5hgEOFrYzSIX9Rrxk0NPHRac+08QeQ="
                ));

                //bootstrap4-tagsinput CSS 0.8.0
                TestPlugin_Admin::addPluginStyle(new CSSResource(
                    'bootstrap4-tagsinput-080-css',TestPlugin_URL.'/js/lib/bootstrap4-tagsinput-douglasanpa/tagsinput.min.css',[],'0.8.0'
                ));

                //Web Components 2.2.3
                TestPlugin_Admin::addPluginScript(new JSResource(
                    'webcomponents-223-js',TestPlugin_URL.'/js/lib/@webcomponents/webcomponentsjs/webcomponents-bundle.js',[],'2.2.3',true,
                    'https://unpkg.com/@webcomponents/webcomponentsjs@2.2.3/webcomponents-bundle.js',['webcomponents223.min'],'sha384-Pu+Y0h0fO2Spp4zkEhZ6JSA+XueALk6Mauzpzuf7AK/A2LsOXsdY/XbcIuSU1WAp'
                ));
                //RequireJS 2.3.6
                TestPlugin_Admin::addPluginScript(new JSResource(
                    'requirejs-236-js',TestPlugin_URL.'/js/lib/requirejs/require.js',[],'2.3.6',true,
                    'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js', ['requirejs236.min'],'sha384-38qS6ZDmuc4fn68ICZ1CTMDv4+Yrqtpijvp5fwMNdbumNGNJ7JVJHgWr2X+nJfqM'
                ));
                TestPlugin_Admin::addPluginScript(new JSResource(
                    TestPlugin_Class::$pluginShortName.'_console_polyfill',TestPlugin_URL.'/js/console.min.js',[],false,true
                ));
                TestPlugin_Admin::addPluginScript(new JSResource(
                    TestPlugin_Class::$pluginShortName.'_polyfills',TestPlugin_URL.'/js/CustomPolyfills.js',[],false,true
                ));
                TestPlugin_Admin::addPluginScript(new JSResource(
                    TestPlugin_Class::$pluginShortName.'_helper-js',TestPlugin_URL.'/js/testplugin_helper.js',[],false,true
                ));
                TestPlugin_Admin::addPluginScript(new JSResource(
                    TestPlugin_Class::$pluginShortName.'_admin-js',TestPlugin_URL.'/js/admin/admin.js',[],false,true
                ));
                TestPlugin_Admin::addPluginStyle(new CSSResource(
                    TestPlugin_Class::$pluginShortName.'_admin-css',TestPlugin_URL.'/css/admin/admin.min.css',[],false
                ));
                TestPlugin_Admin::addPluginStyle(new CSSResource(
                    TestPlugin_Class::$pluginShortName.'_global-css',TestPlugin_URL.'/css/global/global.min.css',[],false
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

                TestPlugin_Admin::$pageScripts['pageName'] = $scriptsForPage;
                TestPlugin_Admin::$pageStyles['pageName'] = $stylesForPage;
                //reset arrays to prevent further page definitions from using the same arrays
                $scriptsForPage = [];
                $stylesForPage = [];
                */

                TestPlugin_Admin::$scriptsInit = true;
            }
        }

        //kick off the admin part of the plugin to work
        //called in TestPlugin_Class->initPlugin method (which is executed in the "plugins_loaded" WordPress hook)
        public static function init() {
            // load the admin file
            global $test_plugin_admin;
            if (empty($test_plugin_admin)) {
                //check if class is defined, if not, instantiate it
                $test_plugin_admin = new TestPlugin_Admin();
            }
        }

        /**
         * Check if the current request is an admin page.
         * Uses "get_current_screen" which is ONLY available after the "admin_init" hook
         *
         * @return bool Whether the current request is on/for an admin page
         */
        public static function isAdminPage(){
            $pageName = TestPlugin_Admin::getCurrentAdminPageName();
            return in_array($pageName, TestPlugin_Admin::$admin_pages);
        }

        /**
         * If the current page is an admin page, this gets the page name
         *
         * @return string The current page name (if this page is an admin page)
         */
        public static function getCurrentAdminPageName(){
            $pageName = "";
            if(is_admin() ) {//ensure this check ONLY runs on admin-side, as get_current_screen() is undefined on user pages
                $currentScreen = get_current_screen();
                $pageName = TestPlugin_Admin::getPageNameFromHookSuffix($currentScreen->id);
            }

            return $pageName;
        }

        /**
         * Gets the page name from a suffix provided from "admin_enqueue_scripts".
         * This hook will prepend "settings_page_" to settings pages, before the real page name
         *
         * @param string $hooksuffix The hook suffix to get the page name from
         * @return string The page name
         */
        public static function getPageNameFromHookSuffix($hooksuffix) {
            $isSettingsPage = strpos($hooksuffix, 'settings_page_') === 0;
            $pageName = $hooksuffix;

            if($isSettingsPage) {
                $pageName = str_replace("settings_page_","",$pageName);
            }
            return $pageName;
        }

        /**
         * Registers the admin ajax endpoints so they can be called from the browser side.
         * This is called from TestPlugin_Class->initPlugin from the WordPress hook "plugins_loaded"
         */
        public static function registerAjaxEndpoints() {
            foreach(TestPlugin_AdminAjax::$exposedEndpoints as $endpoint) {
                $ajaxActionName = TestPlugin_Class::$pluginShortName.'_'.$endpoint;

                if(TestPlugin_Admin::isDebug()) {
                    error_log('Admin ajax endpoint:'.$ajaxActionName);
                }

                add_action('wp_ajax_'.$ajaxActionName, array(__NAMESPACE__ . '\\TestPlugin_AdminAjax', $endpoint));
            }
        }

        /**
         * Is used to output data in the head area of HTML for admin pages.
         * This is called via the WordPress hook "admin_head"
         */
        public static function admin_head_snippets() {
            if(TestPlugin_Class::isPluginPage() ) {
                $pageName = TestPlugin_Admin::getCurrentAdminPageName();

                if(!empty($pageName) ) {
                    echo TestPlugin_Class::$templates->render('head_snippets', array(), $pageName);
                }
            }
        }

        /**
         * Enqueues admin scripts/styles for ADMIN pages
         *
         * @param string $hook_suffix The hook suffix provided by the WordPress hook "admin_enqueue_scripts"
         */
        public static function admin_enqueue_scripts_and_styles($hook_suffix) {
            $pageName = TestPlugin_Admin::getPageNameFromHookSuffix($hook_suffix);
            $isAdminPage = in_array($pageName, TestPlugin_Admin::$admin_pages);

            if($isAdminPage) {
                $lastScriptHandle = TestPlugin_Class::$jsLoader->enqueueAndProcessScripts(TestPlugin_Admin::$pluginScripts);
                $lastStyleHandle = TestPlugin_Class::$cssLoader->enqueueAndProcessStyles(TestPlugin_Admin::$pluginStyles);

                ////load scripts and styles that pertain to a specific page (based on the page name)
                $lastStyleHandle = TestPlugin_Class::$cssLoader->enqueueCSSForPage($pageName, true, $lastStyleHandle);
                $lastScriptHandle = TestPlugin_Class::$jsLoader->enqueueJSForPage($pageName, true, $lastScriptHandle);

                //load ADMIN page specific scripts defined for this plugin
                if(array_key_exists($pageName, TestPlugin_Admin::$pageScripts) && count(TestPlugin_Admin::$pageScripts)>0) {
                    //we have scripts to process for this page
                    $lastScriptHandle = TestPlugin_Class::$jsLoader->enqueueAndProcessScripts(TestPlugin_Admin::$pageScripts, $lastScriptHandle);
                }
                //load ADMIN page specific styles defined for this plugin
                if(array_key_exists($pageName, TestPlugin_Admin::$pageStyles) && count(TestPlugin_Admin::$pageStyles)>0) {
                    //we have scripts to process for this page
                    $lastStyleHandle = TestPlugin_Class::$cssLoader->enqueueAndProcessScripts(TestPlugin_Admin::$pageStyles, $lastStyleHandle);
                }

                //add any data used by scripts, using "wp_localize_script"
                wp_localize_script(TestPlugin_Class::$pluginShortName.'_helper-js', TestPlugin_Class::$pluginShortName.'_GlobalJSData', TestPlugin_Admin::getAdminPluginJSData());

            }
        }

        /**
         * Generates the admin page HTML
         */
        public static function adminPageHtml() {
            echo TestPlugin_Admin::$templates->render('', array(
                'pluginVersion'=>TestPlugin_Options::getPluginOption(TestPlugin_Options::PLUGIN_VERSION_OPTION),
            ), 'testplugin');
        }

        public static function wp_before_admin_bar_render() {
            global $wp_admin_bar;
            $allowedRoles = [TestPlugin_Class::$VIEWER_ROLE, TestPlugin_Class::$MANAGER_ROLE, TestPlugin_Class::$ADMIN_ROLE, TestPlugin_Class::$SUPERADMIN_ROLE];
            if(!UtilityFunctions::userHasRole($allowedRoles)){
                return;
            }

            $option_location = TestPlugin_Admin::admin_page_url();

            $args = array(
                'id' => 'test_admin_node',
                'title' => 'Test Plugin'
            );
            $wp_admin_bar->add_node($args);

            $args = array(
                'id' => 'test_admin_node_option',
                'title' => 'Summary',
                'parent' => 'test_admin_node',
                'href' => $option_location . '?page=testplugin&tab=summary&var1=value1'//can add a bunch of extra query parameters if needed
            );
            $wp_admin_bar->add_node($args);

            $args = array(
                'id' => 'test_admin_node_option2',
                'title' => 'Test',
                'parent' => 'test_admin_node',
                'href' => $option_location . '?page=testplugin&tab=test&var1=value2'//can add a bunch of extra query parameters if needed
            );
            $wp_admin_bar->add_node($args);
        }

        //adds the settings page to the left-side menus of the dashboard (needed so the top-level admin menu can link to it)

        /**
         * Adds The LEFT side menu bar for the TestPlugin.
         * Called via the WordPress hook "admin_menu"
         */
        public static function add_admin_pages() {
            add_submenu_page('options-general.php', 'Test Plugin', 'Test Plugin', 'edit_pages', "testplugin", array(__NAMESPACE__.'\\TestPlugin_Admin', "adminPageHtml"));
        }

        /**
         * Gets the URL to the admin page, so you can navigate to admin options pages via an HREF
         *
         * @return string
         */
        public static function admin_page_url() {
            return admin_url('options-general.php');
        }
    }
}

