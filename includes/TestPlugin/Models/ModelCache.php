<?php
namespace TestPlugin\Models {

    /**
     * Class ModelCache
     * A class that assist with caching loading of models to reduce database calls.
     * A great example for this is loading objects that reference a base type - for example a User and a Role.
     * Loading all users would invoke loading role objects, and this cache ensures only ONE database call is used to load one of each primary key/loading condition
     *
     * @package TestPlugin\Models
     */
    class ModelCache {
        private static $isDebug = false;
        public static function enableDebug() {ModelCache::$isDebug = true;}
        public static function disableDebug() {ModelCache::$isDebug = false;}
        public static function isDebug():bool {return ModelCache::$isDebug;}

        private static $cache = [];

        public static function getFromCache($key) {
            if(!empty($key) && ModelCache::existsInCache($key)) {
                return ModelCache::$cache[$key];
            } else {
                return NULL;
            }
        }

        public static function putInCache($key, $value) {
            if(!empty($key) && !empty($value)) {
                return ModelCache::$cache[$key] = $value;
            }
        }

        public static function clearCache(){
            ModelCache::$cache = [];
        }

        public static function removeFromCache($key){
            if(ModelCache::existsInCache($key)) {
                unset(ModelCache::$cache[$key]);
            }
        }

        public static function existsInCache($key) {
            $exists = array_key_exists($key, ModelCache::$cache);
            if(ModelCache::isDebug()) {
                error_log('Exists in cache-"'.$key.'":'.print_r($exists,true));
            }

            return $exists;
        }

        /**
         * This is used to fetch the model key, given the wanted fields (a loaded object will be cached based on fields loaded when cached to ensure proper fetching later)
         *
         * @param ModelBase $model  The model object instance to get a key for
         * @param string|array $fieldNameToFetchBy The field name/names to fetch a key by (the provided array must be an array of strings)
         * @param array $fieldsToLoad The array of strings of the fields intended to be loaded, to help make the key unique (to ensure every field wanted were stored previously)
         *
         * @return string The resulting key to use for the model when caching / loading from the cache
         */
        public static function getModelKey(ModelBase $model, $fieldNameToFetchBy, array $fieldsToLoad = []):string {
            $key = $model->getClassname();
            if(is_array($fieldNameToFetchBy)) {
                foreach ($fieldNameToFetchBy as $field) {
                    $key = $field.'='.$model->$field;
                }
            } else if(is_string($fieldNameToFetchBy)) {
                $key = $fieldNameToFetchBy.'='.$model->$fieldNameToFetchBy;
            }

            if(!empty($fieldsToLoad)) {
                $key.='-fields['.implode(',',$fieldsToLoad).']';
            }
            return $key;
        }
    }
}