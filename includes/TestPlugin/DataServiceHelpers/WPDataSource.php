<?php
namespace TestPlugin {
    class WPDataSource implements DataSource {
        public static function query($sql, $useTransaction = true) {
            global $wpdb;
            if($useTransaction) {
                WPDataSource::startTransaction();
            }

            $qrySuccess = $wpdb->query($sql);

            if($useTransaction) {
                if ($qrySuccess) {
                    WPDataSource::commitTransaction();
                } else {
                    WPDataSource::rollbackTransaction();
                }
            }

            return $qrySuccess;
        }
        public static function queries($sqlStatements, $useTransaction = true) {
            global $wpdb;
            if($useTransaction) {
                WPDataSource::startTransaction();
            }

            foreach ($sqlStatements as $stmt) {
                $qrySuccess = $wpdb->query($stmt);
                if(!$qrySuccess) {
                    break;
                }
            }


            if($useTransaction) {
                if ($qrySuccess) {
                    WPDataSource::commitTransaction();
                } else {
                    WPDataSource::rollbackTransaction();
                }
            }

            return $qrySuccess;
        }
        public static function dbDelta($sql) {
            global $wpdb;
            return dbDelta($sql);
        }
        public static function startTransaction() {
            global $wpdb;
            $wpdb->query('START TRANSACTION');
        }
        public static function rollbackTransaction() {
            global $wpdb;
            $wpdb->query('ROLLBACK');
        }
        public static function commitTransaction() {
            global $wpdb;
            $wpdb->query('COMMIT');
        }
        public static function get_results($sql, $format = OBJECT) {
            global $wpdb;
            return $wpdb->get_results($sql, $format);
        }
        public static function prepare($sql, $args) {
            global $wpdb;
            $wpdb->prepare($sql, $args);
        }
    }
}