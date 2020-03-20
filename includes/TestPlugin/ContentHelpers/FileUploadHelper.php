<?php
namespace TestPlugin {
    use Mimey\MimeTypes;
    use Upload\File;
    use Upload\Upload;
    /**
     * A class used for assisting with uploading files.
     */
    class FileUploadHelper {
        private static $isDebug = false;
        public static function enableDebug() {FileUploadHelper::$isDebug = true;}
        public static function disableDebug() {FileUploadHelper::$isDebug = false;}
        public static function isDebug():bool {return FileUploadHelper::$isDebug;}

        public function __construct(){

        }

        /**
         * Moves a file that is uploaded ina  temp directory, to another directly (generally a permanent one).
         *
         * @param array $file The individual file information, given as an array (generally as an element found in $_FILES global when uploading a file)
         * @param string $newFileName The new filename for the file
         * @param string $dir The directory to place the file.
         * @param bool $createDirIfMissing Whether to create the destination directory if it doesn't exist
         * @return bool Whether the file move was successful.
         */
        public static function moveUploadedFileToDir(array $file, string $newFileName, string $dir, bool $createDirIfMissing = false):bool {
            if(FileUploadHelper::isDebug()){
                error_log("----------------------------- moveUploadedFileToDir -----------------------------");
            }
            $success = false;
            if(!empty($file) && !empty($dir)) {
                if (!file_exists($dir)) {
                    if(FileUploadHelper::isDebug()){
                        error_log("dir:".print_r($dir,true));
                    }

                    $successMkdir = false;
                    if($createDirIfMissing){
                        $successMkdir = mkdir($dir, 0755, true);
                    }

                    if(!$successMkdir) {
                        return false;
                    }
                }

                return move_uploaded_file($file["tmp_name"], $dir.DIRECTORY_SEPARATOR.$newFileName );
            }

            return $success;
        }

        /**
         * Validates a $_FILES array, given options, to ensure that uploaded files follow rules / security-minded options desired.
         *
         * @param array $files The file information, given as an array (generally the $_FILES global when uploading a file)
         * @param FileValidationOptions $options The validation options to use to determine rules when validating uploaded files.
         * @return FileValidationResult The results object after validating - containing messages and a boolean on whether validation succeeded.
         */
        public static function validateFiles(array $files, FileValidationOptions $options):FileValidationResult {
            $result = new FileValidationResult();
            $uploadObj = new Upload($files, $options->toArray());

            // for each file
            /* @var $file File */
            foreach ($uploadObj->files as $file) {
                if($file->validate()) {
                    //now validate based on MIME type of the file, based on mime types of extensions allowed/denied

                    //get all mime types
                    //because an extension can return multiple mime types, the result could be an array
                    $result->success = true;
                    $mimeOfFile = [FileUploadHelper::getMimeType($file->tmp_name)];

                    if(!empty($options->extensions["is"])) {
                        $mimesFromExtensionList = FileUploadHelper::getMimesOfExtension($options->extensions["is"]);
                        $requiredMimes = UtilityFunctions::flatten(array_values($mimesFromExtensionList) );
                        $requiredMimesInCommon = array_intersect($mimeOfFile, $requiredMimes);

                        if(empty($requiredMimesInCommon)){
                            $result->success = false;
                            $result->addMessage("The file can only be of the following types: " . implode(',', $requiredMimes));
                        }
                    }

                    if(!empty($options->extensions["not"])){
                        $mimesFromExtensionList = FileUploadHelper::getMimesOfExtension($options->extensions["not"]);
                        $rejectedMimes = UtilityFunctions::flatten(array_values($mimesFromExtensionList) );
                        $rejectedMimesInCommon = array_intersect($mimeOfFile, $rejectedMimes);

                        if(!empty($rejectedMimesInCommon)){
                            $result->success = false;
                            $result->addMessage("The file category(s) \"" . implode(',', $rejectedMimes) . "\" are not allowed.");
                        }
                    }
                } else {
                    $errorMessage = $file->get_error();
                    $result->addMessage($errorMessage);
                }
            }

            return $result;
        }

        /**
         * Gets the next number for a file in a directory (to ensure a file name is unique) based on conditions on what files to consider.
         * @param  string $dir The directory to scan, to determine the next file number for
         * @param  bool $getMaximumNumberFromFileNames Whether to consider the existing file numbers parsed from filenames, and finding the maximum (instead of based on counts of files)
         * @param  string $fileNumberDelimitter The delimiter (last occurrence) that separates the filename from the file number
         * @param  string $fileext The file extension to use when considering files when getting the next number
         * @param  string $filefilterprefix The prefix to use when determine whether a file should be considered for the next number
         * @param  string $filefiltersuffix The suffix to use when determine whether a file should be considered for the next number
         * @return int The next file number based on conditions given (to be used to ensure filenames are unique in the given directory)
         */
        public static function getNextFileNumber(string $dir, bool $getMaximumNumberFromFileNames = false, string $fileNumberDelimitter = "_", string $fileext="", string $filefilterprefix="", string $filefiltersuffix="") {
            $number = 0;
            if(!empty($dir) && is_dir($dir)) {
                $filelist = array_values(array_diff(scandir($dir), array('.', '..')));
                //if fileext provided, then ensure its an array
                if(!empty($fileext)){
                    if(is_string($fileext)){
                        $fileext = [$fileext];
                    } else if(!is_array($fileext)){
                        //invalid param
                        return 0;
                    }
                }

                foreach($filelist as $file){
                    if(is_file($dir.DIRECTORY_SEPARATOR.$file)){
                        $fileInfo = pathinfo($file);

                        $inFileExts = !empty($fileext) ? in_array($fileInfo['extension'], $fileext) : true;
                        $filenameMatchesPrefix = !empty($filefilterprefix) ? UtilityFunctions::stringStartsWith($file, $filefilterprefix) : true;
                        $filenameMatchesSuffix = !empty($filefiltersuffix) ? UtilityFunctions::stringEndsWith($file, $filefiltersuffix) : true;

                        if($inFileExts && $filenameMatchesPrefix && $filenameMatchesSuffix) {
                            if($getMaximumNumberFromFileNames) {
                                //get number from filename
                                $split = explode($fileNumberDelimitter, $fileInfo['filename']);

                                $last = end($split);
                                if(($last === false) || !UtilityFunctions::isInteger($last)) {
                                    //delimiter not found / incorrect suffix (not an integer)
                                    continue;//skip this file
                                } else {
                                    $number = max(intval($last), $number);
                                }
                            } else {
                                $number++;
                            }
                        }
                    }
                }
                //now got max number
                //get the NEXT number
                $number++;
            }

            return $number;
        }

        /**
         * Gets the mime type of a given file
         * @param  string $file The file to get the mime type for
         * @return string The mime type determined form the given file (or "unknown" if it can't be determined)
         */
        public static function getMimeType(string $file):string {
            $mtype = "unknown";
            if (function_exists('finfo_open')) {
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mtype = finfo_file($finfo, $file);
                finfo_close($finfo);
            } elseif (function_exists('mime_content_type')) {
                $mtype = mime_content_type($file);
            }

            return $mtype;
        }

        /**
         * Gets the mime types associated with the extension (or array of extensions)
         * @param  string|string[] $ext The extensions to get mime types for
         * @return array The mime types associated with each extension provided. EG: [".txt"=>"text/plain"]. There can be MULTIPLE mime types for an extension (an array of strings)
         */
        public static function getMimesOfExtension($ext):array {
            $mimes = new MimeTypes();

            if(is_array($ext)) {
                $extArray = array_flip($ext);//set passed in extensions as the keys
                array_walk($extArray, function(&$value, $key) use ($mimes){
                    $mimeTypeFound = $mimes->getMimeType($key);
                    $value = $mimeTypeFound;
                });

                return $extArray;
            } else if(is_string($ext)){
                return [$ext => $mimes->getMimeType($ext)];
            } else {
                return [];
            }
        }

        /**
         * Gets the mime types associated with the extension (or array of extensions)
         * @param string $dir The directory to ensure exists.
         * @return bool Whether the directory now exists
         */
        public static function createDirIfNotExists(string $dir):bool{
            if (!file_exists($dir)) {
                return mkdir($dir, 0755, true);
            }

            return true;
        }

        /**
         * Gets the attachment post, and metadata for a given filename/subdirectory.
         *
         * $_FILES has a multiple upload array like:
         *
         Array
         (
            [name] => Array
            (
                [0] => foo.txt
                [1] => bar.txt
            )

            [type] => Array
            (
                [0] => text/plain
                [1] => text/plain
            )

            [tmp_name] => Array
            (
                [0] => /tmp/phpYzdqkD
                [1] => /tmp/phpeEwEWG
            )

            [error] => Array
            (
                [0] => 0
                [1] => 0
            )

            [size] => Array
            (
                [0] => 123
                [1] => 456
            )
         )
         *
         * This function will restructure it to be like:
         Array
         (
            [0] => Array
            (
                [name] => foo.txt
                [type] => text/plain
                [tmp_name] => /tmp/phpYzdqkD
                [error] => 0
                [size] => 123
            )

            [1] => Array
            (
                [name] => bar.txt
                [type] => text/plain
                [tmp_name] => /tmp/phpeEwEWG
                [error] => 0
                [size] => 456
            )
        )
         * @param  array $uploadedFiles The uploaded $_FILES array
         * @return array The restructured array (as described above). This is passed BY REFERENCE to reduce overhead of copying data.
         */
        public static function reformatUploadedFilesArray(array &$uploadedFiles) {
            $result = [];
            $file_count = count($uploadedFiles['name']);
            $file_keys = array_keys($uploadedFiles);

            for ($i=0; $i<$file_count; $i++) {
                foreach ($file_keys as $key) {
                    $result[$i][$key] = $uploadedFiles[$key][$i];
                }
            }

            return $result;
        }

        /**
         * Simplifies a filename to make it "safe" for use when storing an uploaded file.
         * @param string $fileName The filename that is to be simplified
         * @return string The filename simplified
         */
        public static function makeSimplifiedFileName(string $fileName):string {
            $fileName = pathinfo($fileName, PATHINFO_FILENAME);
            $result = preg_replace("/\s+/", " ", $fileName);
            $result = str_replace(" ", "_", $result);
            $result = preg_replace("/[^A-Za-z0-9_]/","",$result);
            $result = strtolower($result);
            return $result;
        }

        /**
         * Checks the $_FILES uploaded array (the "error" state of files) and returns an array of UploadException objects for each file error.
         * @param  array The uploaded files array retrieved from $_FILES
         * @return UploadException[] The resulting UploadException array
         */
        public static function getUploadedFilesSystemErrors(array $uploadedFilesArray):array {
            $result = [];
            $file_count = count($uploadedFilesArray['name']);

            if(!empty($uploadedFilesArray)) {
                for ($i=0; $i<$file_count; $i++) {
                    $errorCode = $uploadedFilesArray['error'][$i];
                    if($errorCode !== UPLOAD_ERR_OK) {
                        //error status NOT ok, so get the error code and filename
                        $result[] = new UploadException($errorCode, $uploadedFilesArray['name'][$i]);
                    }
                }
            }

            return $result;
        }

        /**
         * Format a number of bytes to be human readable, with a number and units
         *
         * @param int $bytes Number of bytes (eg. 25907)
         * @param int $precision [optional] Number of digits after the decimal point (eg. 1)
         * @return string Value converted with unit (eg. 25.3KB)
         */
        public static function formatBytes(int $bytes, int $precision = 2):string {
            $unit = ["B", "KB", "MB", "GB"];
            $exp = floor(log($bytes, 1024)) | 0;
            return round($bytes / (pow(1024, $exp)), $precision).$unit[$exp];
        }

        /**
         * Checks if a file with the given filename (the filename must exist in $_FILES)
         * was successfully uploaded into temporary storage (sometimes it fails,
         * if there isn't enough free space/permissions).
         *
         * @param string $fileParamName The filename key in the $_FILES array to check was uploaded
         * @return bool If the file was uploaded
         */
        public static function fileUploaded(string $fileParamName):bool {
            if(empty($_FILES) || !array_key_exists($fileParamName, $_FILES)) {
                return false;
            }
            $file = $_FILES[$fileParamName];
            $tmpName = is_array($file['tmp_name']) ? $file['tmp_name'][0] : $file['tmp_name'];

            return file_exists($tmpName) && is_uploaded_file($tmpName);
        }
    }
}