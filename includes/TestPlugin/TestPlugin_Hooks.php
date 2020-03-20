<?php
namespace TestPlugin {
    use TestPlugin\UtilityFunctions;
    use TestPlugin\TestPlugin_Class;
    use TestPlugin\LocalizationHelper;

    /**
     * Class TestPlugin_Hooks
     *
     * A class used to coordinate the creation of hooks/filters for this plugin
     *
     * @package TestPlugin
     */
    class TestPlugin_Hooks {
        public static $hookPrefix = "TestPlugin_";

        public function __construct() {
            $this->do_other_hooks();
            $this->add_our_hooks();
            $this->add_our_hooks_that_return_data();
        }

        //things we call, that others have provided
        private function do_other_hooks() {
            global $gc_class;

            //do_action('name', $args);
        }

        //things we provide others to call - that don't return data
        private function add_our_hooks() {
            global $gc_class;

            //ability to add i18n localization data to a page given the "pagename" and loaded from "{plugin root}\js\localization\i18n\"
            add_action(TestPlugin_Hooks::$hookPrefix.'output_localization_for_pagename', array($this, 'do_Localization_setup_for_pagename_hook'), 10, 1);
        }

        public function do_Localization_setup_for_pagename_hook($pageName){
            LocalizationHelper::doLocalizationSetupForPagename($pageName, TestPlugin_DIR);
        }

        //things we provide others to call, where data is returned
        private function add_our_hooks_that_return_data() {
            global $gc_class;

            //returns boolean if the localization info ws added/found
            add_filter(TestPlugin_Hooks::$hookPrefix.'register_localization_scripts', array($this, 'register_localization_hook'), 10, 1);
            //returns the jscookie script handle, so scripts can be loaded after
            add_filter(TestPlugin_Hooks::$hookPrefix.'register_cookie_js_hook', array($this, 'register_cookie_js_hook'), 10, 1);
            //gets all plugin pages, to provide a way for other plugins to know what pages we create
            add_filter(TestPlugin_Hooks::$hookPrefix.'get_plugin_pages', array($this, 'get_plugin_pages'), 10, 1);
        }

        public function register_localization_hook($dataToPassToScripts) {
            if (TestPlugin_Class::isPluginPage()) {
                return false;
            } else {
                return registerLocalizationScripts($dataToPassToScripts);
            }
        }

        public function register_cookie_js_hook($dataToRegister) {
            if (TestPlugin_Class::isPluginPage()) {
                return false;
            } else {
                $scriptHandle = TestPlugin_Hooks::$hookPrefix.'-cookies-js';
                wp_register_script($scriptHandle, TestPlugin_URL.'/js/fallbacks/jscookie220.min.js', array('jquery'), false, true);
                return $scriptHandle;
            }
        }

        public function get_plugin_pages() {
            $pages = array_map(function($k) {
                return str_replace(" ", "-", strtolower($k->pageName));
            }, TestPlugin_Class::pluginPages() );

            return $pages;
        }

    }

    /* Helper Methods For The Above */
    function registerLocalizationScripts($dataToPassToScripts) {
        if(empty($dataToPassToScripts)) {
            $dataToPassToScripts = TestPlugin_Class::getPluginJSData();
        }

        $finalScriptSlug = TestPlugin_Hooks::$hookPrefix."localize-setup-js";

        wp_register_script(TestPlugin_Hooks::$hookPrefix.'localize-CLDRPluralRuleParser-js', TestPlugin_URL.'/js/localization/CLDRPluralRuleParser.min.js', array('jquery'), false, true);
        wp_register_script(TestPlugin_Hooks::$hookPrefix.'localize-i18n-js', TestPlugin_URL.'/js/localization/jquery.i18n.min.js', array(TestPlugin_Hooks::$hookPrefix.'localize-CLDRPluralRuleParser-js'), false, true);
        wp_register_script(TestPlugin_Hooks::$hookPrefix.'localize-i18n-messagestore-js', TestPlugin_URL.'/js/localization/jquery.i18n.messagestore.min.js', array(TestPlugin_Hooks::$hookPrefix.'localize-i18n-js'), false, true);
        wp_register_script(TestPlugin_Hooks::$hookPrefix.'localize-i18n-fallbacks-js', TestPlugin_URL.'/js/localization/jquery.i18n.fallbacks.min.js', array(TestPlugin_Hooks::$hookPrefix.'localize-i18n-messagestore-js'), false, true);
        wp_register_script(TestPlugin_Hooks::$hookPrefix.'localize-i18n-parser-js', TestPlugin_URL.'/js/localization/jquery.i18n.parser.min.js', array(TestPlugin_Hooks::$hookPrefix.'ocalize-i18n-fallbacks-js'), false, true);
        wp_register_script(TestPlugin_Hooks::$hookPrefix.'localize-i18n-emitter-js', TestPlugin_URL.'/js/localization/jquery.i18n.emitter.min.js', array(TestPlugin_Hooks::$hookPrefix.'localize-i18n-parser-js'), false, true);
        wp_register_script(TestPlugin_Hooks::$hookPrefix.'localize-i18n-language-js', TestPlugin_URL.'/js/localization/jquery.i18n.language.min.js', array(TestPlugin_Hooks::$hookPrefix.'localize-i18n-emitter-js'), false, true);

        wp_register_script(TestPlugin_Hooks::$hookPrefix.'localize-setup-js', TestPlugin_URL.'/js/localization/localizeSetup.min.js', array(TestPlugin_Hooks::$hookPrefix.'localize-i18n-language-js'), false, true);
        wp_localize_script(TestPlugin_Hooks::$hookPrefix.'localize-setup-js', TestPlugin_Class::$pluginShortName.'_GlobalJSData', $dataToPassToScripts);

        return $finalScriptSlug;
    }

}
?>