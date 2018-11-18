<?php
namespace TestPlugin {
    interface DataSource {
        public static function query($sql);
        public static function queries($sql);
        public static function dbDelta($sql);
        public static function get_results($sql);
        public static function prepare($sql, $args);
        public static function startTransaction();
        public static function rollbackTransaction();
        public static function commitTransaction();

    }
}