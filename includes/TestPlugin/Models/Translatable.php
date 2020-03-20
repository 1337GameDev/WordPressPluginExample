<?php
namespace TestPlugin\Models\Translation {
    static $DEFAULT_LANG_CODE = "en";
    /**
     * Interface Translatable
     * Represents a model that can be translated, and an extra table created in the database is needed for this to work (the model's table + '_translations')
     *
     * @package TestPlugin\Models\Translation
     */
    interface Translatable {
        /**
         * Get field names that are translated
         *
         * @return array
         */
        public function getTranslatedFieldNames():array;

        /**
         * Get field names that are translated (but access them in a static context)
         *
         * @return array
         */
        public static function getStaticTranslatedFieldNames():array;

    }
}