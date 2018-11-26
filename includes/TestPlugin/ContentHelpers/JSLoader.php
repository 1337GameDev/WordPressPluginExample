<?php
namespace TestPlugin {
    class JSLoader {
        private $jsFolder = "";
        private $jsURL = "";
        public function __construct($folder = "", $url = "") {
            $this->jsFolder = $folder;
            $this->jsURL = $url;
        }

        public function getJsContents($fileName = "", $subdir = "") {
            if(!UtilityFunctions::stringEndsWith($fileName,'.js') ) {
                $fileName.='.js';
            }

            $jsContents = '';
            $filePath = $this->jsFolder.DIRECTORY_SEPARATOR;
            if(!empty($subdir)) {
                $filePath .= $subdir.DIRECTORY_SEPARATOR;
            }
            $filePath .= $fileName;

            if(file_exists($filePath) ) {
                $jsContents = file_get_contents($filePath);
            }

            return $jsContents;
        }

        public function enqueueJSIfExists($fileName = "", $prefix="", $subdir = "") {
            if(!UtilityFunctions::stringEndsWith($fileName,'.js') ) {
                $fileName.='.js';
            }
            $baseFilename = $path_parts = pathinfo($fileName)['filename'];

            $wantedJsPath = $filePath = $this->jsFolder.DIRECTORY_SEPARATOR;
            $wantedJsURL = $filePath = $this->jsURL.'/';

            if(!empty($subdir)) {
                $wantedJsPath .= $subdir.DIRECTORY_SEPARATOR;
                $wantedJsURL .= str_replace(DIRECTORY_SEPARATOR, "/", $subdir)."/";
            }

            $wantedJsPath .= $prefix.$fileName;
            $wantedJsURL .= $prefix.$fileName;
            if(file_exists($wantedJsPath) ) {
                wp_enqueue_script(TestPlugin_Class::$pluginShortName.$prefix.$baseFilename.'-js', $wantedJsURL, array(TestPlugin_Class::$pluginShortName.'_helper-js'));
            }
        }

        public function enqueueJSForPage($pageName = "", $isAdmin = false) {
            if(!empty($pageName) ){
                $this->enqueueJSIfExists($pageName, TestPlugin_Class::$pluginShortName."_", ($isAdmin ? "admin" : "user").DIRECTORY_SEPARATOR."pages" );
            }
        }
    }
}

