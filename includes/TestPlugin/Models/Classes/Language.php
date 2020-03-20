<?php
namespace TestPlugin\Models {
    use TestPlugin\Models\Translation\Translatable;

    /**
     * Class Language
     * A model that represents a Language
     * @package TestPlugin\Models
     */
    class Language extends ModelBase implements Translatable {
        private static $fieldsToTranslate = ["languagename"];

        public $languagename;
        public $languagefamily;
        public $iso639_1;//2 letter code
        public $iso639_2;//3 letter code - ISO 639-2/T

        public function __construct() {
            parent::__construct();
        }

        /**
         * Get field names that are translated
         *
         * @return array
         */
        public function getTranslatedFieldNames():array{
            return Language::$fieldsToTranslate;
        }

        /**
         * Get field names that are translated
         *
         * @return array
         */
        public static function getStaticTranslatedFieldNames():array {
            return Language::$fieldsToTranslate;
        }
    }
}