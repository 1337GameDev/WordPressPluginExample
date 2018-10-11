<?php
namespace TestPlugin {
//check if WP uninstall is calling this (this constant is not set by the uninstall hook)
    if (!defined('WP_UNINSTALL_PLUGIN')) {
        die;
    }
    use TestPlugin\TestPlugin_Class;
    //require_once(TestPlugin_DIR.DIRECTORY_SEPARATOR.'class-test-plugin.php');

    TestPlugin_Class::uninstallOps();
}

