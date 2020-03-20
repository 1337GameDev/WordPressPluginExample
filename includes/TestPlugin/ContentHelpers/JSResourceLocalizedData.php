<?php
namespace TestPlugin {
    /**
    * A class used to represent data that is to be localized (injected into a JS file's scope via the WordPress function wp_localize_script)
    * */
    class JSResourceLocalizedData {
        public $variableNameToUse = "";
        public $data = [];

        public function __construct($varName, $data = []) {
            $this->variableNameToUse = $varName;
            $this->data = $data;
        }
    }
}

