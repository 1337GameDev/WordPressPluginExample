<?php
namespace TestPlugin {
    class TestPlugin_Options {
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

    }
}

