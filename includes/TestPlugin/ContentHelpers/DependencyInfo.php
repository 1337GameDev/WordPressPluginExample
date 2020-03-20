<?php
namespace TestPlugin {
    /**
     * A class used to represent a dependency on something else for the plugin.
     * The dependency types this class can represent are: A class, function or constant.
     * */
    class DependencyInfo {
        public $dependencyKeyToCheck;
        public $dependencyName;
        public $type;
        public function __construct($keyToCheck, $name, $type = DependencyType::CLASS_TYPE) {
            $this->dependencyKeyToCheck = $keyToCheck;
            $this->dependencyName = $name;
            $this->type = $type;
        }

        /**
         * Verifies that this dependency is satisfied.
         *
         * @return bool If this dependency is satisfied
         */
        public function verify():bool {
            $valid = false;

            switch ($this->type) {
                case DependencyType::CLASS_TYPE:
                    $valid = class_exists($this->dependencyKeyToCheck);
                    break;
                case DependencyType::CONSTANT_TYPE:
                    $valid = defined($this->dependencyKeyToCheck);
                    break;
                case DependencyType::FUNCTION_TYPE:
                    $valid = function_exists($this->dependencyKeyToCheck);
                    break;
                default:

            }

            return $valid;
        }

        /**
         * Gets the message to display if this dependency is not satisfied.
         *
         * @return string The message.
         */
        public function getMissingMessage():string {
            $msg = "The ";

            switch ($this->type) {
                case DependencyType::CLASS_TYPE:
                    $msg .= "Class";
                    break;
                case DependencyType::CONSTANT_TYPE:
                    $msg .= "Constant";
                    break;
                case DependencyType::FUNCTION_TYPE:
                    $msg .= "Function";
                    break;
                default:
                    $msg .= "Dependency";
            }

            $msg .= " \"{$this->dependencyKeyToCheck}\" was not found, and is part of the plugin \"".$this->dependencyName.".\"";
            return $msg;
        }
    }
}

