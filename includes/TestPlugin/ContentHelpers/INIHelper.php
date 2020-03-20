<?php

namespace TestPlugin {
    /**
     * A class used for interacting with .ini files
     */
    class INIHelper {
        private $iniFolder = "";
        public function __construct($folder = "") {
            $this->iniFolder = $folder;
        }

        /**
         * Gets the contents of an INI file, as an array, with every key/value pair in each section. Uses PHP's "parse_ini_file" function.
         *
         * @param string $fileName The filename of the ini file
         * @param string $subdir The folder (inside the 'iniFolder') that this ini file resides (can be a subdirectory path)
         *
         * @return array The ini of the file, as an array of key/value pairs, and possibly organized by sections
         */
        public function getIniContents($fileName = "", $subdir = ""):array {
            if(!UtilityFunctions::stringEndsWith($fileName,'.ini') ) {
                $fileName.='.ini';
            }

            $iniContents = '';
            $filePath = $this->iniFolder.DIRECTORY_SEPARATOR;
            if(!empty($subdir)) {
                $filePath .= $subdir.DIRECTORY_SEPARATOR;
            }
            $filePath .= $fileName;

            if(file_exists($filePath) ) {
                $iniContents = parse_ini_file($filePath, true);
                if($iniContents === false) {
                    $iniContents = [];
                }
            }

            return $iniContents;
        }
    }
}