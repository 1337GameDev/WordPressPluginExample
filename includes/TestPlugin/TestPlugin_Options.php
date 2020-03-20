<?php
namespace TestPlugin {
    /**
     * Class TestPlugin_Options
     *
     * A class that provides an interface for this plugin, to store/get plugin options uniquely to/from WordPress
     *
     * @package TestPlugin
     */
    class TestPlugin_Options {
        private static $pluginOptionPrefix = "tp_option_";

        /* Option Key Strings */
        const PLUGIN_DB_VERSION_OPTION = "db_version";
        const PLUGIN_VERSION_OPTION = "plugin_version";
        const PLUGIN_INTEGRITY_CHECK_TIMESTAMP_OPTION = "plugin_integrity_check_timestamp";

        //uses the standard WordPress capability of 'edit_posts' to verify they are an admin
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

        public static function setPluginOption($optionName, $newVal):bool {
            return update_option(TestPlugin_Options::$pluginOptionPrefix.$optionName, $newVal);
        }

        public static function addPluginOption($optionName, $newVal):bool {
            return add_option(TestPlugin_Options::$pluginOptionPrefix.$optionName, $newVal);
        }

        public static function removePluginOption($optionName):bool {
            return delete_option(TestPlugin_Options::$pluginOptionPrefix.$optionName);
        }

    }
}

