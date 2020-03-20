<?php
namespace TestPlugin {
    /**
     * A class used to represent a CSS file/resource.
     * */
    class CSSResource {
        public $handle = "";
        public $version = "";
        public $localURL = "";
        public $externalURL = "";
        public $integrityMetadata = "";
        public $dependencies = [];
        public $media = "all";
        public $extraAttributes = [];

        public function __construct($handle="",$localURL="",$dependencies=[],$ver="",$extURL="",$integrity="",$attrs=[], $media="all") {
            $this->handle = $handle;
            $this->localURL = $localURL;
            $this->dependencies = $dependencies;
            $this->version = $ver;
            $this->externalURL = $extURL;
            $this->integrityMetadata = $integrity;
            $this->extraAttributes = $attrs;
            $this->media = $media;
        }
    }
}

