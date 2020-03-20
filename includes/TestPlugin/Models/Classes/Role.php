<?php
namespace TestPlugin\Models {
    /**
     * Class Role
     * A class that represents a security role a user can have
     * @package TestPlugin\Models
     */
    class Role extends ModelBase {
        public $rolename;
        public $description;

        public static function getExtraProperties():array{
            static $extra;
            if(empty($extra)) {
                $extra = array_merge([
                ], parent::getExtraProperties());
            }

            return $extra;
        }

        public function __construct() {
            parent::__construct();

        }
    }
}