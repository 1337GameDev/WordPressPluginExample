<?php
namespace TestPlugin {
    class CSSLoader {
        private $cssFolder = "";
        private $cssURL = "";
        public function __construct($folder = "", $url = "") {
            $this->cssFolder = $folder;
            $this->cssURL = $url;
        }

        public function getCssContents($fileName = "", $subdir = "") {
            if(!UtilityFunctions::stringEndsWith($fileName,'.css') ) {
                $fileName.='.css';
            }

            $cssContents = '';
            $filePath = $this->cssFolder.DIRECTORY_SEPARATOR;
            if(!empty($subdir)) {
                $filePath .= $subdir.DIRECTORY_SEPARATOR;
            }
            $filePath .= $fileName;

            if(file_exists($filePath) ) {
                $cssContents = file_get_contents($filePath);
            }

            return $cssContents;
        }

        public function makeDOMStyleModule($cssFilename) {
            $cssContents = TestPlugin_Class::$cssLoader->getCssContents($cssFilename, "components");
            ?>
            <dom-module id="test-component-styles">
                <template>
                    <style>
                        <?php echo $cssContents;?>
                    </style>
                </template>
            </dom-module>
            <?php
        }

        public function enqueueCSSIfExists($fileName = "", $prefix="", $subdir = "") {
            if(!UtilityFunctions::stringEndsWith($fileName,'.css') ) {
                $fileName.='.css';
            }
            $baseFilename = $path_parts = pathinfo($fileName)['filename'];

            $wantedCssPath = $filePath = $this->cssFolder.DIRECTORY_SEPARATOR;
            $wantedCssURL = $filePath = $this->cssURL.'/';

            if(!empty($subdir)) {
                $wantedCssPath .= $subdir.DIRECTORY_SEPARATOR;
                $wantedCssURL .= str_replace(DIRECTORY_SEPARATOR, "/", $subdir)."/";
            }

            $wantedCssPath .= $prefix.$fileName;
            $wantedCssURL .= $prefix.$fileName;
            if(file_exists($wantedCssPath) ) {
                wp_enqueue_style(TestPlugin_Class::$pluginShortName.$prefix.$baseFilename.'-css', $wantedCssURL, array(TestPlugin_Class::$pluginShortName.'_global-css'));
            }
        }

        public function enqueueCSSForPage($pageName = "", $isAdmin = false) {
            if(!empty($pageName) ){
                $this->enqueueCSSIfExists($pageName, TestPlugin_Class::$pluginShortName."_", ($isAdmin ? "admin" : "user").DIRECTORY_SEPARATOR."pages" );
            }
        }
    }
}

