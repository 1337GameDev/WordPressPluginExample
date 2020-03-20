<?php
namespace TestPlugin\Models {
    use TestPlugin\PDOHelper;
    use TestPlugin\Models\Role;

    /**
     * Class UserGroup
     * A class that represents a security group a user model can belong to
     *
     * @package TestPlugin\Models
     */
    class UserGroup extends ModelBase {
        public $groupname;

        public static function getExtraProperties():array {
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