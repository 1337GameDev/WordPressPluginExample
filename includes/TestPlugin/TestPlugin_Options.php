<?php
namespace TestPlugin {
    class TestPlugin_Options {
        private static $pluginOptionPrefix = "tp_option_";

        /* Option Key Strings */
        const PLUGIN_DB_VERSION_OPTION = "db_version";
        const PLUGIN_VERSION_OPTION = "plugin_version";

        public static function user_can_manage() {
            $user_can_manage = current_user_can('edit_posts');
            return $user_can_manage;
        }

        public static function options_init() {
            static $already_init = false;
            if ($already_init) {
                return;
            }
            //do special admin init operations

            $already_init = true;
        }

        public static function getPluginOption($optionName) {
            return get_option(TestPlugin_Options::$pluginOptionPrefix.$optionName);
        }

        public static function setPluginOption($optionName, $newVal) {
            update_option(TestPlugin_Options::$pluginOptionPrefix.$optionName, $newVal);
        }

        public static function addPluginOption($optionName, $newVal) {
            add_option(TestPlugin_Options::$pluginOptionPrefix.$optionName, $newVal);
        }

        public static function removePluginOption($optionName) {
            delete_option(TestPlugin_Options::$pluginOptionPrefix.$optionName);
        }

    }
}

