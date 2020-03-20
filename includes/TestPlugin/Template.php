<?php
namespace TestPlugin {
    /**
     * Class Template - a very simple PHP class for rendering PHP templates
     *
     * Fetched from: https://www.daggerhart.com/simple-php-template-class/
     * Original Author: Jonathan Daggerhart
     *
     */
    class Template {
        private static $isDebug = false;
        public static function enableDebug() {Template::$isDebug = true;}
        public static function disableDebug() {Template::$isDebug = false;}
        public static function isDebug():bool {return Template::$isDebug;}

        /**
         * Root location of templates
         *
         * @var string
         */
        public $rootFolder;

        /**
         * Root location of page templates
         *
         * @var string
         */
        public $pagesTemplateFolder;

        /**
         * Extra data to provide to all templates
         *
         * @var array
         */
        public $extraData;

        /**
         * Template constructor.
         *
         * @param string $rootFolder
         * @param string $pagesFolder
         * @param array $extraData
         */
        function __construct(string $rootFolder = "", string $pagesFolder = "", array $extraData = []) {
            if(!empty($rootFolder)) {
                $this->set_root_folder($rootFolder);
            }
            if(!empty($pagesFolder)) {
                $this->set_page_folder($pagesFolder);
            }

            if(!empty($extraData)) {
                $this->extraData = $extraData;
            }
        }

        /**
         * Simple method for updating the root folder where templates are located.
         *
         * @param string $folder
         */
        function set_root_folder($folder) {
            // normalize the internal folder value by removing any final slashes
            $this->rootFolder = rtrim($folder, '/');
        }

        /**
         * Simple method for updating the root folder where templates for pages are located.
         *
         * @param string $pagesFolder
         */
        function set_page_folder($pagesFolder) {
            // normalize the internal folder value by removing any final slashes
            $this->pagesTemplateFolder = rtrim($pagesFolder, '/');
        }

        /**
         * Find and attempt to render a template with variables. If no name is passed, but a page is, the page name will be used as the template name.
         *
         * @param string[]|string $names The "suggested" template to render. This will be used to lookup the first template that matches.
         * @param mixed[] $variables Any variables that the template should have
         * @param string $pageName The name of the page to use to look up the template
         *
         * @return string The output string of the template being rendered
         */
        function render($names = "", $variables = array(), $pageName = ""):string {
            $template = $this->find_template($names, $pageName);
            if(Template::$isDebug) {
                error_log('render template:' . $template);
            }

            if(!empty($template)) {
                $fileinfo = pathinfo($template);
                $fetcherFilename = $fileinfo['dirname'].DIRECTORY_SEPARATOR.$fileinfo['filename'].'-data.php';
                $variables = $this->executeDataFetcher($fetcherFilename, $variables);
            }

            $output = '';
            if ($template) {
                $output = $this->render_template($template, $variables);
            }
            return $output;
        }

        /**
         * Executes a PHP file that loads data for a given page template
         *
         * @param string $filename The absolute path, with filename, to the data fetcher to execute
         * @param array $data The data array passed to the data fetcher, and combined with it's result
         *
         * @return array The resulting dta array from the data fetcher (or empty)
         */
        function executeDataFetcher(string $filename, array $data):array {
            if (!empty($filename) && file_exists($filename)) {
                $fetchedData = (include($filename));//ensures any "result" is enclosed as an expression

                if(($data===TRUE) || empty($data)) {
                    $data = [];
                }

                $data = array_merge($data, $fetchedData);
            }

            return $data;
        }

        /**
         * Look for the first template suggestion
         *
         * @param string[]|string $names The names of the template to find
         * @param string $pageName The page name to consider when looking up the template
         *
         * @return bool|string
         */
        function find_template($names = "", $pageName = "") {
            $namesArray = array();
            if (!is_array($names)) {
                $namesArray = array($names);
            } else {
                $namesArray = $names;
            }

            $namesArray = array_reverse($namesArray);
            $found = false;
            foreach ($namesArray as $name) {
                if(!empty($pageName)) {
                    if(empty($name)) {
                        $name = $pageName;
                    }

                    $file = implode(DIRECTORY_SEPARATOR, [
                        $this->pagesTemplateFolder,
                        $pageName,
                        $name.".php"
                    ]);

                    if(Template::$isDebug) {
                        error_log('template path in pages folder to check:' . $file);
                    }

                    if (file_exists($file)) {
                        $found = $file;
                        break;
                    }
                }

                $file = implode(DIRECTORY_SEPARATOR, [
                    $this->rootFolder,
                    $name.".php"
                ]);

                if(Template::$isDebug) {
                    error_log('template path in root folder to check:' . $file);
                }

                if (file_exists($file)) {
                    $found = $file;
                    break;
                }

            }
            return $found;
        }

        /**
         * Execute the template by extracting the variables into scope, and including
         * the template file.
         *
         * @internal param $template
         * @internal param $variables
         *
         * @return string
         */
        //variables kept unnamed to avoid scoping them to the template
        function render_template( /*$template, $variables*/) {
            ob_start();
            $model = array(
                //add any special values here
                "template" => func_get_args()[0]
            );
            $model = array_merge($model, $this->extraData);

            //put any functions directly in scope
            $expectInModel = function ($name) use (&$model) {
                if(isset($name) && !array_key_exists($name, $model)) {
                    throw new \Exception("The variable '".$name."' was not provided to the template '".$model['template']."'.");
                }
            };

            $model = array_merge($model, func_get_args()[1]);//combine with variables passed in arg1

            //include the template from arg0
            include func_get_args()[0];
            return ob_get_clean();
        }
    }
}