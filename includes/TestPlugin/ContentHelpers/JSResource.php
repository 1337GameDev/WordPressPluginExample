<?php
namespace TestPlugin {
    /**
    * A class used to represent a JS file/resource.
    * */
    class JSResource {
        public static $SCRIPTTYPE = [
            "DEFER" => 2,
            "ASYNC" => 1,
            "STANDARD" => 0
        ];

        public $handle = "";
        public $version = "";
        public $localURL = "";
        public $externalURL = "";
        public $integrityMetadata = "";
        public $fallbackScriptNames = [];
        public $dependencies = [];
        public $scriptType = 0;
        public $inFooter = false;
        public $extraAttributes = [];

        public $extraDataToPass = NULL;

        public function __construct($handle="",$localURL="",$dependencies=[],$ver="",$footer=false,$extURL="",$fallbacks=[],$integrity="",$type=0, $attrs=[], $extraDataToPass = NULL) {
            $this->handle = $handle;
            $this->localURL = $localURL;
            $this->dependencies = $dependencies;
            $this->version = $ver;
            $this->inFooter = $footer;
            $this->externalURL = $extURL;
            $this->fallbackScriptNames = $fallbacks;
            $this->integrityMetadata = $integrity;
            $this->scriptType = $type;
            $this->extraAttributes = $attrs;
            $this->extraDataToPass = $extraDataToPass;
        }
    }
}

