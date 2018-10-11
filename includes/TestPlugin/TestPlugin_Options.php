<?php
namespace TestPlugin {
    class TestPlugin_Options
    {
        public static function user_can_manage()
        {
            $user_can_manage = current_user_can('edit_posts');
            return $user_can_manage;
        }

        public static function admin_init()
        {
            static $already_init = false;
            if ($already_init) {
                return;
            }
            //do special admin init operations

            $already_init = true;
        }

        //adds the settings page to the left-side menus of the dashboard (needed so the top-level admin menu cna link to it)
        public static function add_admin_pages()
        {
            global $test_plugin_admin;
            global $test_plugin_admin_page;
            $test_plugin_admin_page = add_submenu_page('options-general.php', 'Test Plugin', 'Test Plugin', 'edit_pages', "testplugin", array($test_plugin_admin, "adminPageHtml"));
        }

        public static function admin_page_url()
        {
            return admin_url('options-general.php');
        }

    }
}

