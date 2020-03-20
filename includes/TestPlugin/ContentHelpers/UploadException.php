<?php

namespace TestPlugin {
    /**
     *  A class used to represent an exception when uploading a file
     * @package TestPlugin
     */
    class UploadException extends \Exception  {
        public function __construct(int $code, $fileName="") {
            $message = $this->codeToMessage($code, $fileName);
            parent::__construct($message, $code);
        }

        /**
         * Converts an uploaded file error code to a user-friendly message
         *
         * @param int $code The error code to get a message for (generally provided by the "error" field when uploading a file)
         * @param string $fileName The name of the file to use in messages to give a user-friendly message (generally provided by uploaded file data)
         *
         * @return bool Whether this page is currently being rendered
         */
        private function codeToMessage(int $code, $fileName="") {
            switch ($code) {
                case UPLOAD_ERR_INI_SIZE:
                    if(!empty($fileName)) {
                        $message = "The uploaded file \"".$fileName."\" exceeds the upload_max_filesize directive in php.ini";
                    } else {
                        $message = "The uploaded file exceeds the upload_max_filesize directive in php.ini";
                    }
                    break;
                case UPLOAD_ERR_FORM_SIZE:
                    if(!empty($fileName)){
                        $message = "The uploaded file \"".$fileName."\" exceeds the MAX_FILE_SIZE directive that was specified in the HTML form";
                    } else {
                        $message = "The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form";
                    }
                    break;
                case UPLOAD_ERR_PARTIAL:
                    if(!empty($fileName)){
                        $message = "The uploaded file \"".$fileName."\" was only partially uploaded";
                    } else {
                        $message = "The uploaded file was only partially uploaded";
                    }
                    break;
                case UPLOAD_ERR_NO_FILE:
                    $message = "No file was uploaded";
                    break;
                case UPLOAD_ERR_NO_TMP_DIR:
                    $message = "Missing a temporary folder";
                    break;
                case UPLOAD_ERR_CANT_WRITE:
                    if(!empty($fileName)){
                        $message = "Failed to write file \"".$fileName."\" to disk";
                    } else {
                        $message = "Failed to write file to disk";
                    }
                    break;
                case UPLOAD_ERR_EXTENSION:
                    $message = "File upload stopped by extension";
                    break;

                default:
                    $message = "Unknown upload error";
                    break;
            }
            return $message;
        }
    }
}