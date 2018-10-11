<?php
    /*
    Plugin Name: Test Plugin
    Plugin URI:
    Description: A test example plugin
    Author: R. W. Duerr
    Version: 1.0.0
    Author URI:
    */

    $loader = require __DIR__.'/vendor/autoload.php';
    use TestPlugin\TestPlugin_Class;

    //disable external access
    if (!defined('ABSPATH')) {
        die('Invalid Usage. Use through the wordpress plugin API.');
    }

    //init the plugin variables (inside this namespace)
    define('TestPlugin\\TestPlugin_DIR', dirname(__FILE__));
    define('TestPlugin\\TestPlugin_URL', plugins_url('', __FILE__));
    define('TestPlugin\\TestPlugin_SRC_DIR', TestPlugin\TestPlugin_DIR.DIRECTORY_SEPARATOR.'includes'.DIRECTORY_SEPARATOR.'TestPlugin');

    //do incomplete plugin check
    $files = [
        TestPlugin\TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'TestPlugin_Admin.php',
        TestPlugin\TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'TestPlugin_AdminAjax.php',
        TestPlugin\TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'TestPlugin_UserAjax.php',
        TestPlugin\TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'TestPlugin_Class.php',
        TestPlugin\TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'TestPlugin_Options.php',
        TestPlugin\TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'UtilityFunctions.php',
        TestPlugin\TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'BasicEnum.php',
        TestPlugin\TestPlugin_SRC_DIR.DIRECTORY_SEPARATOR.'NoticeType.php',
    ];

    //loop through all files declared above and check their existence
    $allFilesPresent = false;
    foreach ($files as $filePath) {
        $allFilesPresent = file_exists($filePath);
        if(!$allFilesPresent) {
            break;
        }
    }

    if (!$allFilesPresent) {
        // Warn if the plugin install is incomplete - can happen if WP crashes (e.g. out of disk space) when upgrading the plugin
        add_action('all_admin_notices', array('TestPlugin\\TestPlugin_Class', 'incomplete_install_warning'));
    } else {
        //require_once(TestPlugin_DIR.DIRECTORY_SEPARATOR.'includes'.DIRECTORY_SEPARATOR.'class-test-plugin.php');
        $test_plugin_class = new TestPlugin_Class();
    }

