<?php
namespace TestPlugin {
    use JsonSchema\Exception\RuntimeException;
    use TestPlugin\JSResourceLocalizedData;

    /**
     * A class used to handle loading JS files, as well as enqueuing them and ensuring they exist when enqueued.
     * */
    class JSLoader {
        private $jsFolder = "";
        private $jsURL = "";
        private $cssURL = "";//used for fallbacks, and adding css if they fail to load
        public $pluginShortName = "";

        private static $isDebug = false;
        public static function enableDebug() {JSLoader::$isDebug = true;}
        public static function disableDebug() {JSLoader::$isDebug = false;}
        public static function isDebug():bool {return JSLoader::$isDebug;}

        public function __construct($folder = "", $url = "", $css = "", $shortname = "") {
            $this->jsFolder = $folder;
            $this->jsURL = $url;
            $this->cssURL = $css;
            $this->pluginShortName = $shortname;
        }

        /**
         * Gets the contents of a JS file, as a string (or empty string if it doesn't exist / can't be accessed)
         *
         * @param string $fileName The filename of the JS file
         * @param string $subdir The folder (inside the 'jsFolder') that this js file resides (can be a subdirectory path)
         *
         * @return string The JS of the file, as a string
         */
        public function getJsContents($fileName = "", $subdir = ""):string {
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

        /**
         * Gets the contents of a JS file, and gets a string of the fallback script tag, ready to be inserted into the DOM
         *
         * @param string $fileName The filename of the JS file to get a fallback script tag for
         *
         * @return string The string output of the fallback script
         */
        public function getFallbackScriptContents($fileName = ""):string {
            $jsContents = $this->getJsContents($fileName,"fallbacks");

            if(!wp_script_is('jquery', 'enqueued') ){
                wp_enqueue_script('jquery');
            }

            return '
            (function(variables){
                (function($){
                    $(function(){'.$jsContents.'});
                })(window.jQuery);
            })({"jsRootURL":"'.$this->jsURL.'","cssRootURL":"'.$this->cssURL.'"});';
        }

        /**
         * Gets the contents of a JS file, and inserts a fallback script into the DOM
         *
         * @param string $scriptHandle The script handle to add the fallback script tag for/after.
         * @param string $fallbackScriptFilename The filename of the JS file to get a fallback script tag for
         *
         */
        public function addFallbackScript($scriptHandle = "", $fallbackScriptFilename = "") {
            wp_scripts()->add_inline_script($scriptHandle, $this->getFallbackScriptContents($fallbackScriptFilename) );
        }

        /**
         * Enqueues a JS (if it exists) after the given JS slug of a dependent enqueued JS file (omitted if left blank)
         *
         * @param string $fileName The filename of the JS file
         * @param string $prefix The prefix of the file, excluded if empty string
         * @param string $subdir The folder (inside the 'jsFolder') that this js file resides (can be a subdirectory path)
         * @param string $loadAfterJSSlug The slug of a dependant JS file, that is/to be enqueued, that this file will be included after. If the dependency isn't written to the page, THIS file won't be included either.
         *
         * @return string The JS slug that the CSS file is enqueued with
         */
        public function enqueueJSIfExists($fileName = "", $prefix="", $subdir = "", $loadAfterJSSlug = ""):string {
            if(JSLoader::isDebug()) {
                error_log("-------------------------- enqueueJSIfExists --------------------------");
            }

            if(empty($fileName)) {
                return $loadAfterJSSlug;
            }

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

            $enqueuedJSHandle = $this->pluginShortName.$prefix.$baseFilename.'-js';
            if(file_exists($wantedJsPath) ) {
                $dependencies = array($this->pluginShortName.'_helper-js');
                if(!empty($loadAfterJSSlug) && is_string($loadAfterJSSlug) ) {
                    array_push($dependencies, $loadAfterJSSlug);
                }

                if(JSLoader::isDebug()) {
                    error_log("Enqueuing script:".print_r($enqueuedJSHandle,true));
                }

                wp_enqueue_script($enqueuedJSHandle, $wantedJsURL, $loadAfterJSSlug, false, true);
            } else {
                $enqueuedJSHandle = $loadAfterJSSlug;
            }

            return $enqueuedJSHandle;
        }

        /**
         * Enqueues a JS (if it exists) after the given JS slug of a dependent enqueued JS file (omitted if left blank)
         *
         * @param string $pageName The page to enqueue JS for
         * @param bool $isAdmin Whether this JS file is an admin or user related JS file
         * @param string $loadAfterJSSlug The slug of a dependant JS file, that is/to be enqueued, that this file will be included after. If the dependency isn't written to the page, THIS file won't be included either.
         *
         * @return string The JS slug that the JS file is enqueued with
         */
        public function enqueueJSForPage($pageName = "", $isAdmin = false, $loadAfterJSSlug = ""):string {
            if(JSLoader::isDebug()) {
                error_log("-------------------------- enqueueJSForPage --------------------------");
            }

            $enqueuedJSHandle = $loadAfterJSSlug;//default to return the slug we passed in
            if(!empty($pageName) ){
                $subdir = implode(DIRECTORY_SEPARATOR,[($isAdmin ? "admin" : "user"),"pages",$pageName]);
                $enqueuedJSHandle = $this->enqueueJSIfExists($pageName, "", $subdir, $loadAfterJSSlug);
            }

            return $enqueuedJSHandle;
        }

        /**
         * Gets a script tag for a given JSResource object
         *
         * @param JSResource $js The JSResource of the JS file to generate a script tag for
         *
         * @return string The resulting script tag HTML
         */
        public function getScriptTag(JSResource $js):string {
            $hasCdnURL = !empty($js->externalURL);
            $hasIntegrity = !empty($js->integrityMetadata);
            $scriptLoadingType = "";
            if($js->scriptType === JSResource::$SCRIPTTYPE['DEFER']) {
                $scriptLoadingType = "defer";
            } else if($js->scriptType === JSResource::$SCRIPTTYPE['ASYNC']) {
                $scriptLoadingType = "async";
            }
            $extraAttrs = "";
            foreach ($js->extraAttributes as $name => $val) {
                $extraAttrs .= $name.'="'.$val.'" ';
            }

            return '<script src="'.($hasCdnURL ? $js->externalURL : $js->localURL.'?ver='.$js->version).'" '
                .($hasCdnURL && !empty($hasIntegrity) ? 'integrity="'.$js->integrityMetadata.'" crossorigin="anonymous" ' : ' ')
                .$scriptLoadingType.' '.$extraAttrs.'></script>';
        }

        /**
         * Enqueues multiple JSResource objects, in order, AFTER the given JS handle (if provided)
         *
         * @param array $jsResourceArray The JSResource array to enqueue
         * @param string $priorHandle The prior handle (if provided) to enqueue the JSResource array after
         *
         * @return string The final JS handle after enqueueing the JSResource array
         */
        public function enqueueAndProcessScripts($jsResourceArray, $priorHandle = ""):string {
            if(JSLoader::isDebug()) {
                error_log("-------------------------- enqueueAndProcessScripts --------------------------");
            }

            if(JSLoader::isDebug()) {
                error_log("Scripts to enqueue:".print_r($jsResourceArray,true));
            }

            foreach ($jsResourceArray as $script) {
                $hasCdnURL = !empty($script->externalURL);

                wp_enqueue_script($script->handle,($hasCdnURL ? $script->externalURL : $script->localURL),(!empty($priorHandle) ? array_merge([$priorHandle], $script->dependencies) : $script->dependencies),$script->version,$script->inFooter);

                if(($script->extraDataToPass !== NULL) && (($script->extraDataToPass instanceof JSResourceLocalizedData))) {
                    wp_localize_script($script->handle, $script->extraDataToPass->variableNameToUse, $script->extraDataToPass->data);
                }

                if(!empty($script->fallbackScriptNames)) {
                    foreach ($script->fallbackScriptNames as $fallback){
                        $this->addFallbackScript($script->handle, $fallback);
                    }
                }

                $priorHandle = $script->handle;
            }

            return $priorHandle;
        }
    }
}

