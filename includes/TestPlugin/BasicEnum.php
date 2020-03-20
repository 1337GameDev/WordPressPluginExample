<?php
namespace TestPlugin {
    /**
     * Class BasicEnum
     * Because PHP doesn't natively support enums, this was made.
     * Subclass this to make new enum types
     *
     * This was made from a comment made by the user "mohanrajnr at gmail dot com"
     *
     * https://www.php.net/manual/en/class.splenum.php
     *
     * @package TestPlugin
     */
    abstract class BasicEnum
    {
        private static $constCacheArray = NULL;

        private function __construct()
        {
            /* Prevent instancing */
        }

        private static function getConstants()
        {
            if (self::$constCacheArray == NULL) {
                self::$constCacheArray = [];
            }
            $calledClass = get_called_class();
            if (!array_key_exists($calledClass, self::$constCacheArray)) {
                $reflect = new ReflectionClass($calledClass);
                self::$constCacheArray[$calledClass] = $reflect->getConstants();
            }
            return self::$constCacheArray[$calledClass];
        }

        public static function isValidName($name, $strict = false) {
            $constants = self::getConstants();

            if ($strict) {
                return array_key_exists($name, $constants);
            }

            $keys = array_map('strtolower', array_keys($constants));
            return in_array(strtolower($name), $keys);
        }

        public static function isValidValue($value) {
            $values = array_values(self::getConstants());
            return in_array($value, $values, $strict = true);
        }
    }
}