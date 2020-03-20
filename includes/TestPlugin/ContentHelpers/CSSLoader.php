<?php

namespace TestPlugin {
    /**
     * A class used to handle loading CSS files, as well as enqueuing them and ensuring they exist when enqueued.
     * */
    class CSSLoader {
        private $cssFolder = "";
        private $cssURL = "";
        public $pluginShortName = "";

        private static $isDebug = false;
        public static function enableDebug() {CSSLoader::$isDebug = true;}
        public static function disableDebug() {CSSLoader::$isDebug = false;}
        public static function isDebug():bool {return CSSLoader::$isDebug;}
        public function __construct($folder = "", $url = "", $shortname = "") {
            $this->cssFolder = $folder;
            $this->cssURL = $url;
            $this->pluginShortName = $shortname;
        }

        /**
         * Gets the contents of a CSS file, as a string (or empty string if it doesn't exist / can't be accessed)
         *
         * @param string $fileName The filename of the CSS file
         * @param string $subdir The folder (inside the 'cssFolder') that this css file resides (can be a subdirectory path)
         *
         * @return string The CSS of the file, as a string
         */
        public function getCssContents($fileName = "", $subdir = ""):string {
            if(empty($fileName)) {
                return "";
            }

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

        /**
         * Directly outputs the HTML structure for a 'style moule' for a Polymer module / Shadow DOM.
         *
         * @param string $cssFilename The filename of the CSS file
         * @param string $subdir The folder (inside the 'cssFolder') that this css file resides (can be a subdirectory path)
         *
         */
        public function makeDOMStyleModule($cssFilename="", $subdir="") {
            $cssContents = $this->getCssContents($cssFilename, $subdir);
            $baseName = basename($cssFilename);

            ?>
            <dom-module id="<?php echo $baseName;?>-styles">
                <template>
                    <style>
                        <?php echo $cssContents;?>
                    </style>
                </template>
            </dom-module>
            <?php
        }

        /**
         * Directly outputs the HTML structure for a 'style module' for a Polymer component
         *
         * @param string $componentName The Polymer component name
         *
         */
        public function makeDOMStyleModuleForComponent($componentName="") {
            if(empty($componentName)) {
                return;
            }

            $wantedSubdir = implode(DIRECTORY_SEPARATOR,["components",$componentName]);
            $this->makeDOMStyleModule($componentName,$wantedSubdir);
        }

        /**
         * Enqueues a CSS (if it exists) after the given CSS slug of a dependent enqueued CSS file (omitted if left blank)
         *
         * @param string $fileName The filename of the CSS file
         * @param string $prefix The prefix of the file, excluded if empty string
         * @param string $subdir The folder (inside the 'cssFolder') that this css file resides (can be a subdirectory path)
         * @param string $loadAfterCSSSlug The slug of a dependant CSS file, that is/to be enqueued, that this file will be included after. If the dependency isn't written to the page, THIS file won't be included either.
         *
         * @return string The CSS slug that the CSS file is enqueued with
         */
        public function enqueueCSSIfExists($fileName = "", $prefix="", $subdir = "", $loadAfterCSSSlug = ""):string {
            if(empty($fileName)) {
                return $loadAfterCSSSlug;
            }

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

            $enqueuedCSSHandle = $this->pluginShortName.$prefix.$baseFilename.'-css';
            if(file_exists($wantedCssPath) ) {
                $dependencies = array($this->pluginShortName.'_global-css');
                if(!empty($loadAfterCSSSlug) && is_string($loadAfterCSSSlug) ) {
                    array_push($dependencies, $loadAfterCSSSlug);
                }

                wp_enqueue_style($enqueuedCSSHandle, $wantedCssURL, $dependencies);
            } else {
                $enqueuedCSSHandle = $loadAfterCSSSlug;
            }

            return $enqueuedCSSHandle;
        }

        /**
         * Enqueues a CSS (if it exists) after the given CSS slug of a dependent enqueued CSS file (omitted if left blank)
         *
         * @param string $pageName The page to enqueue CSS for
         * @param bool $isAdmin Whether this CSS file is an admin or user related CSS file
         * @param string $loadAfterCSSSlug The slug of a dependant CSS file, that is/to be enqueued, that this file will be included after. If the dependency isn't written to the page, THIS file won't be included either.
         *
         * @return string The CSS slug that the CSS file is enqueued with
         */
        public function enqueueCSSForPage($pageName = "", $isAdmin = false, $loadAfterCSSSlug = ""):string {
            $enqueuedCSSHandle = "";//default to return the slug we passed in
            if(!empty($pageName) ){
                $subdir = implode(DIRECTORY_SEPARATOR,[($isAdmin ? "admin" : "user"),"pages",$pageName]);
                $enqueuedCSSHandle = $this->enqueueCSSIfExists($pageName, "", $subdir, $loadAfterCSSSlug);
            } else {
                $enqueuedCSSHandle = $loadAfterCSSSlug;
            }

            return $enqueuedCSSHandle;
        }

        /**
         * Gets a style tag for a given CSSResource object
         *
         * @param CSSResource $css The CSSResource of the CSS file to generate a style tag for
         *
         * @return string The resulting style tag HTML
         */
        public function getScriptTag(CSSResource $css):string {
            $hasCdnURL = !empty($css->externalURL);
            $hasIntegrity = !empty($css->integrityMetadata);
            $extraAttrs = "";
            foreach ($css->extraAttributes as $name => $val) {
                $extraAttrs .= $name.'="'.$val.'" ';
            }

            return '<link rel="stylesheet" href="'.($hasCdnURL ? $css->externalURL : $css->localURL.'?ver='.$css->version).'" '
                .($hasCdnURL && !empty($hasIntegrity) ? 'integrity="'.$css->integrityMetadata.'" crossorigin="anonymous" ' : ' ').' '
                .$extraAttrs.'></link>';
        }

        /**
         * Enqueues multiple CSSresource objects, in order, AFTER the given CSS handle (if provided)
         *
         * @param array $cssResourceArray The CSSResource array to enqueue
         * @param string $priorHandle The prior handle (if provided) to enqueue the CSSResource array after
         *
         * @return string The final CSS handle after enqueueing the CSSResource array
         */
        public function enqueueAndProcessStyles($cssResourceArray, $priorHandle = ""):string {
            foreach ($cssResourceArray as $style) {
                $hasCdnURL = !empty($style->externalURL);

                wp_enqueue_style($style->handle,($hasCdnURL ? $style->externalURL : $style->localURL),(!empty($priorHandle) ? array_merge([$priorHandle], $style->dependencies) : $style->dependencies),$style->version,$style->media);
                $priorHandle = $style->handle;
            }

            return $priorHandle;
        }
    }
}

