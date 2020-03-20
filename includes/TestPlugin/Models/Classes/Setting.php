<?php
namespace TestPlugin\Models {
    /**
     * Class Setting
     * A class that represents a setting that can be saved
     * @package TestPlugin\Models
     */
    class Setting extends ModelBase {
        public $settingname;
        public $settingvalue;

        public function __construct() {
            parent::__construct();

        }
    }
}