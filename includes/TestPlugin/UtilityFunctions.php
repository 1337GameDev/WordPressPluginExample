<?php
namespace TestPlugin {
    use TestPlugin\NoticeType;
    use \Mimey\MimeTypes;

    class UtilityFunctions {
        public static $logFileName = "TestPlugin.log";

        public static function rstrpos($haystack, $needle, $offset) {
            $size = strlen($haystack);
            $pos = strpos(strrev($haystack), $needle, $size - $offset);

            if ($pos === false) {
                return false;
            }

            return $size - $pos;
        }

        /**
         * Checks whether the given image, by the directory, filename and extension, has thumbnails generated for it.
         *
         * @param array $imagePathDirectoryArray An array of the parts of the path to the file (this function will add the right directory separator)
         * @param string $imageName The filename of the image to check
         * @param string $imageExt The file extension of the image
         * @return bool Whether the thumbnail, given the information, exists
         */
        public static function imageThumbnailExists($imagePathDirectoryArray, $imageName, $imageExt) {
            $thumbnailPath = implode(DIRECTORY_SEPARATOR.DIRECTORY_SEPARATOR, array_merge([$_SERVER['DOCUMENT_ROOT']],  $imagePathDirectoryArray, [$imageName]))."_thumbnail.".$imageExt;
            return file_exists($thumbnailPath);
        }

        /**
         * Gets HTML for a given NoticeType, and message
         *
         * @param string $message The message to display
         * @param int $noticeTypeEnum The notice type, given as an int, that corresponds to "NoticeType" BasicEnum
         * @return string The HTML generated for the notice
         * @throws \Exception
         */
        public static function noticeMessageHtml(string $message, int $noticeTypeEnum) {
            if(!is_int($noticeTypeEnum) ) {
                throw new \Exception('\'noticeTypeEnum\' is not an int!');
            }

            $noticeClass = "";
            switch ($noticeTypeEnum) {
                case NoticeType::ERROR:
                    $noticeClass = "error";
                    break;
                case NoticeType::WARNING:
                    $noticeClass = "warning";
                    break;
                case NoticeType::INFO:
                    $noticeClass = "info";
                    break;
                case NoticeType::SUCCESS:
                    $noticeClass = "success";
                    break;
            }

            return "<div class=\"is-dismissible notice notice-$noticeClass\">
                    <p>$message</p>
                </div>";
        }

        //Used for debug/testing, to vardump an variable
        public static function varDumpToPage($input) {
            echo "<pre>";
            var_dump($input);
            echo "</pre>";
        }

        /**
         * Writes a message to a basic log file provided by "UtilityFunctions::$logFileName"
         *
         * @param string $msg The message to log
         */
        public static function log_message($msg) {
            error_log($msg);
            require_once(ABSPATH . 'wp-admin/includes/file.php');
            global $wp_filesystem;
            if ( ! is_a( $wp_filesystem, 'WP_Filesystem_Base') ){
                $creds = request_filesystem_credentials( site_url() );
                wp_filesystem($creds);
            }

            $bt = debug_backtrace();
            $caller = array_shift($bt);
            $logStr = date("Y-m-d hh:ii A",time())." - ".$caller['file'].":".$caller['line']." - ".$msg;
            $filePathStr = TestPlugin_DIR.DIRECTORY_SEPARATOR.UtilityFunctions::$logFileName;
            $success = false;

            $file = fopen($filePathStr, "a+");//a for append -- could use a+ to create the file if it doesn't exist
            if($file) {
                $success = fwrite($file, "\n" . $logStr);
                fclose($file);
            }
        }

        /**
         * Checks whether a substring is the beginning of another string
         *
         * @param string $string The string to check
         * @param string $subString The substring to check if the provided string starts with
         * @param bool $caseSensitive Whether the check is case sensitive or not
         * @return bool
         */
        public static function stringStartsWith($string, $subString, $caseSensitive = true) {
            if ($caseSensitive === false) {
                $string = mb_strtolower($string);
                $subString  = mb_strtolower($subString);
            }

            if (mb_substr($string, 0, mb_strlen($subString)) == $subString) {
                return true;
            } else {
                return false;
            }
        }

        /**
         * Checks whether a substring is the end of another string
         *
         * @param string $string The string to check
         * @param string $subString The substring to check if the provided string ends with
         * @param bool $caseSensitive Whether the check is case sensitive or not
         * @return bool
         */
        public static function stringEndsWith($string, $subString, $caseSensitive = true) {
            if ($caseSensitive === false) {
                $string = mb_strtolower($string);
                $subString = mb_strtolower($subString);
            }

            $strlen = strlen($string);
            $subStringLength = strlen($subString);

            if ($subStringLength > $strlen) {
                return false;
            }

            return substr_compare($string, $subString,$strlen - $subStringLength, $subStringLength) === 0;
        }

        /**
         * Checks if a string contains another string
         *
         * @param string $haystack The string to search
         * @param string $needle The string to search for
         * @param bool $caseSensitive Whether the search is case sensitive or not
         * @return bool Whether the string to look for was found or not
         */
        public static function stringContains($haystack, $needle, $caseSensitive = true) {
            if ($caseSensitive === false) {
                $haystack = mb_strtolower($haystack);
                $needle = mb_strtolower($needle);
            }

            if (mb_substr_count($haystack, $needle) > 0) {
                return true;
            } else {
                return false;
            }
        }

        /**
         * Splits a string on common boundaries (space, comma, backslash, forward slash, or dash)
         *
         * @param string $str A string to split up
         * @return array The resulting substring pieces
         */
        public static function splitOnCommonBoundaries(string $str = ""):array {
            //splits on a space, comma, backslash, forward slash, and dash
            $result = preg_split("/[&\s,\/-]+/", $str);
            return ($result === false) ? [] : $result;
        }

        /**
         * Gets a classname, with a namespace, and removes the namespace part
         *
         * @param string $className The classname with namespace
         * @return string
         */
        public static function getClassWithoutNamespace($className){
            return substr($className, strrpos($className, '\\')+1);
        }

        /**
         * This method looks in an array, where each element -IS- an associative array,
         * and returns all elements that contain the given key which matches (compared loosely using ==)
         * to the given value.
         *
         * EG: [
         *      ["field1" => 0, "field2" => "foo"],
         *      ["field1" => 4, "field2" => "bar"],
         *      ["field1" => 3, "field2" => "baz"]
         * ]
         *
         * This function allows you to search, and find all elements that contain the key "field1" AND have a value of 0 and would return an array of those results:
         *  [
         *      ["field1" => 0, "field2" => "foo"]
         * ]
         *
         * @param array    $arr  The array that contains arrays to search
         * @param string $subArrayKey The sub array key to look for
         * @param string $valToSearchFor The value of the above key to check for (loosely using ==)
         *
         * @return array The found sub array(s) for the given key+value combination
         */
        public static function getSubArrayFromArray(array $arr, string $subArrayKey, $valToSearchFor):array {
            //array_values is needed to renumber the indices for the array returned from array_filter,
            // otherwise the old indices would be used
            $result = array_values(array_filter(
                $arr,
                function ($e) use ($subArrayKey, $valToSearchFor) {
                    return $e[$subArrayKey] == $valToSearchFor;
                }
            ));

            return $result;
        }

        /**
         * Checks if a string represents an integer or not
         *
         * @param string $str The string to check
         * @return bool Whether the string represents an integer or not
         */
        public static function isInteger(string $str):bool {
            return (ctype_digit(strval($str)));
        }

        /**
         * Converts a path, to a URL.
         * Generally used to fetch paths for files, and then convert those to
         * URLs to be used on browser-side JavaScript for ajax/resource tags
         *
         * @param string $path The path to convert
         * @return string The output path, in URL format
         */
        public static function convertPathToURL(string $path):string {
            return preg_replace('/\\\\\\\\*/','/', $path);
        }

        /**
         * Converts a DateInterval to a specific type (seconds, minutes, hours, or days)
         *
         * @param \DateInterval $interval The interval to convert
         * @param int $intervalType The IntervalType constant that represents what to convert to (a BasicEnum subclass, as PHP doesn't support enums)
         * @return float|int The resulting interval value
         */
        public static function intervalValueAs(\DateInterval $interval,  int $intervalType) {
            $intervalValueAsSeconds = UtilityFunctions::dateIntervalToSeconds($interval);

            $value = 0;
            switch($intervalType) {
                case IntervalType::SECONDS:
                    $value = $intervalValueAsSeconds;
                    break;
                case IntervalType::MINUTES:
                    $value = $intervalValueAsSeconds / 60;//secs in a minute
                    break;
                case IntervalType::HOURS:
                    $value = $intervalValueAsSeconds / 3600;//secs in an hour
                    break;
                case IntervalType::DAYS:
                    $value = $intervalValueAsSeconds / 86400;//secs in a day
                    break;
                default:
                    break;
            }

            return $value;
        }

        /**
         * A basic method to simply convert a DateInterval to it's total length in SECONDS.
         * Used to help convert, in the UtilityFunctions::intervalValueAs function.
         *
         * @param \DateInterval $interval The interval to convert
         * @return float|int The number of seconds in the interval
         */
        public static function dateIntervalToSeconds(\DateInterval $interval) {
            $seconds = $interval->days*86400 + $interval->h*3600
                + $interval->i*60 + $interval->s;
            return $interval->invert == 1 ? $seconds*(-1) : $seconds;
        }


        /**
         * Checks if an array of keys exists for a given array
         *
         * @param array $keys The keys to check for
         * @param array $arr The array to check
         * @return bool Whether all keys were found in the given array
         */
        public static function array_keys_exists(array $keys, array $arr) {
            return !array_diff_key(array_flip($keys), $arr);
        }

        /**
         * Sorts an array based on a provided array of keys, and ensures elements in the array are sorted by KEY.
         * <b>Also removes duplicate keys from the array, AND any keys not in the keys used to sort</b>
         *
         * @param array $arrayToSort Array to sort
         * @param array $keyOrder The array of keys to specify the order of elements of
         * @return array The resulting array, sorted by key, with any prior entry with a key not specified, removed.
         */
        public static function order_and_filter_by_keys(array $arrayToSort, array $keyOrder):array {
            //computes intersection (removes values NOT in keyOrder array)
            //array flip used to switch the indices for the current strings as keys (eg: [0=>"h"] => ["h"=>0])
            $arrayToSort = array_intersect_key($arrayToSort, array_flip($keyOrder));
            //sort based on keys
            uksort($arrayToSort, function ($a, $b) use ($keyOrder) {

                $pos_a = array_search($a, $keyOrder);
                $pos_b = array_search($b, $keyOrder);
                return $pos_a - $pos_b;
            });

            return $arrayToSort;
        }

        /**
         * Flattens an array, recursively
         *
         * @param array $array The array to flatten
         * @return array The resulting <b>flattened</b> array
         */
        public static function flatten(array $array):array {
            $return = array();
            array_walk_recursive($array, function($a) use (&$return) { $return[] = $a; });
            return $return;
        }

        /**
         * Gets the roles from WordPress (and capabilities of each if specified)
         *
         * @param bool $forceFetching If we should FORCE fetching even if a prior call cached the response
         * @param bool $includeCapabilities Whether to include WordPress capabilities with each role fetched
         * @return array The reuslting roles (and possibly capabilities of each)
         */
        public static function getWPRoles($forceFetching = false, $includeCapabilities = false):array {
            if (!function_exists('get_editable_roles') ) {
                require_once(ABSPATH.'wp-admin/includes/user.php');
            }
            static $editable_roles = NULL;
            if($forceFetching || ($editable_roles === NULL)){
                $editable_roles = get_editable_roles();
            }

            foreach ($editable_roles as $role => $details) {
                $sub['role'] = esc_attr($role);
                $sub['name'] = translate_user_role($details['name']);
                if($includeCapabilities) {
                    $sub['capabilities'] = $details['capabilities'];
                }
                $roles[] = $sub;
            }

            return $roles;
        }

        /**
         * Get roles for a given user, as specified by a user ID
         *
         * @param int $userID The user ID to fetch roles for
         * @return array The resulting roles of the specified user
         */
        public static function getUserRoles(int $userID):array {
            if (!function_exists('get_userdata') ) {
                return array();
            }

            $user = get_userdata($userID);
            return empty($user) ? array() : $user->roles;
        }

        /**
         * If the given user id (or current user if "$user_id" is empty)
         *
         * @param mixed $role The role/roles to check
         * @param bool $hasAny If the user has ANY vs ALL roles
         * @param string $user_id The user to check for role
         * @return bool Whether The user has the role/roles.
         */
        public static function userHasRole($role, $hasAny = true, $user_id = ""):bool {
            if(empty($user_id)) {
                $user_id = get_current_user_id();
            }

            if(is_string($role)) {
               $role = [$role];
            }

            if(!is_array($role)) {
                return false;
            }

            $userRoles = UtilityFunctions::getUserRoles($user_id);
            $intersect = array_intersect($role, $userRoles);

            return $hasAny ? count($intersect)>0 : count($intersect)==count($role);
        }

        /**
         * Gets the current user ID.
         *
         * @return int The user id
         */
        public static function getCurrentUserID(){
            if (!function_exists('get_current_user_id') ) {
                require_once(ABSPATH.'wp-admin/includes/user.php');
            }

            return get_current_user_id();
        }

        /**
         * Checks if the current user has the given role
         *
         * @param string $roleName The role to check
         * @return bool Whether the current user has the role
         */
        public static function currentUserHasRole($roleName = "") {
            if(empty($roleName)) {
                return false;
            }

            if (!function_exists('wp_get_current_user') ) {
                require_once(ABSPATH.'wp-includes/pluggable.php');
            }

            $user = wp_get_current_user();//returns a WP_User object
            return in_array($roleName, (array)$user->roles);
        }

        /**
         * Gets a file type category given a file extension.
         * <b>Uses the package "\Mimey\MimeTypes" to get a mime type for a given extension.</b>
         *
         * @param $fileExtension The file extension to get the category for
         * @return string The resulting file category
         */
        public static function getFileTypeCategoryFromExtension($fileExtension){
            if(empty($fileExtension)) {
                return "Empty";
            }

            $mimes = new \Mimey\MimeTypes;

            $foundMime = $mimes->getMimeType($fileExtension);
            if($foundMime == "application/json") {
                $foundMime = "json";
            } else if(UtilityFunctions::stringStartsWith($foundMime,'image', false)){
                $foundMime = "image";
            } else if(UtilityFunctions::stringContains($foundMime, 'pdf', false)) {
                $foundMime = "pdf";
            } else if(UtilityFunctions::stringContains($foundMime, 'video', false)
                || UtilityFunctions::stringContains($foundMime, 'mpeg', false)){
                $foundMime = "video";
            } else if(UtilityFunctions::stringContains($foundMime, 'msword', false)
                || UtilityFunctions::stringContains($foundMime, 'mspublisher', false)
                || UtilityFunctions::stringContains($foundMime, 'msexcel', false)
                || UtilityFunctions::stringContains($foundMime, 'mspowerpoint', false)
                || UtilityFunctions::stringContains($foundMime, 'powerpoint', false)
                || UtilityFunctions::stringContains($foundMime, 'msaccess', false)
                || UtilityFunctions::stringContains($foundMime, 'officedocument', false)
                || UtilityFunctions::stringContains($foundMime, 'wordprocessingml', false)
                || UtilityFunctions::stringContains($foundMime, 'ms-word', false)
                || UtilityFunctions::stringContains($foundMime, 'ms-excel', false)
                || UtilityFunctions::stringContains($foundMime, 'ms-powerpoint', false)
                || UtilityFunctions::stringContains($foundMime, 'ms-access', false)
                || UtilityFunctions::stringContains($foundMime, 'ms-publisher', false)
                || UtilityFunctions::stringContains($foundMime, 'text', false)
                || UtilityFunctions::stringContains($foundMime, 'opendocument', false)
                || UtilityFunctions::stringContains($foundMime, 'rtf', false)
            ){
                $foundMime = "document";
            } else if(UtilityFunctions::stringStartsWith($foundMime, 'audio', false)){
                $foundMime = "audio";
            }

            return $foundMime;
        }

        /**
         * Checks an array, and if it contains only empty values
         *
         * @param array $arr The array to check
         * @return bool Whether each key in the array has an empty value
         */
        public static function allArrayKeysEmpty(array $arr = []){
            if(empty($arr)) {
                return true;
            }

            $allEmpty = true;
            foreach($arr as $element) {
                $allEmpty = $allEmpty && empty($element);

                if(!$allEmpty) {
                    break;
                }
            }

            return $allEmpty;
        }

        /**
         * Used to enable/disable PHP warnings
         *
         * @param bool $enable Enable or disable the warnings
         */
        public static function setPHPWarningDisplay($enable = true){
            $current_error_reporting = error_reporting();
            if($enable){
                error_reporting($current_error_reporting & ~E_WARNING);//bitwise flags
            } else {
                error_reporting($current_error_reporting | E_WARNING);//bitwise flags
            }
        }

        /**
         * Send a POST requst using cURL
         * @param string $url to request
         * @param array $post values to send
         * @param array $options for cURL
         * @return string
         */
        public static function curl_post($url, array $post = array(), array $options = array()) {
            $defaults = array(
                CURLOPT_POST => 1,
                CURLOPT_HEADER => 0,
                CURLOPT_URL => $url,
                CURLOPT_FRESH_CONNECT => 1,
                CURLOPT_RETURNTRANSFER => 1,
                CURLOPT_FORBID_REUSE => 1,
                CURLOPT_TIMEOUT => 4,
                CURLOPT_POSTFIELDS => http_build_query($post)
            );

            $ch = curl_init();
            curl_setopt_array($ch, ($options + $defaults));
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            if( ! $result = curl_exec($ch)) {
                trigger_error(curl_error($ch));
            }

            curl_close($ch);
            return $result;
        }

        /**
         * Send a GET requst using cURL
         * @param string $url to request
         * @param array $get values to send
         * @param array $options for cURL
         * @return string
         */
        public static function curl_get($url, array $get = array(), array $options = array() ) {
            $defaults = array(
                CURLOPT_URL => $url.(strpos($url, '?') === FALSE ? '?' : '').http_build_query($get),
                CURLOPT_HEADER => 0,
                CURLOPT_RETURNTRANSFER => TRUE,
                CURLOPT_TIMEOUT => 4
            );

            $ch = curl_init();
            curl_setopt_array($ch, ($options + $defaults));
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            if( ! $result = curl_exec($ch)) {
                trigger_error(curl_error($ch));
            }

            curl_close($ch);
            return $result;
        }

        /**
         * Get the highest needed priority for a filter or action.
         *
         * If the highest existing priority for filter is already PHP_INT_MAX, this
         * function cannot return something higher.
         *
         * @param  string $filter
         * @return number|string
         */
        public static function get_latest_wp_filter_priority($filter) {
            if(empty($GLOBALS['wp_filter'][$filter]) ){
                return PHP_INT_MAX;
            }

            if(array_key_exists($filter, $GLOBALS['wp_filter'])) {
                $filter = $GLOBALS['wp_filter'][$filter];
                $allCallbackPriorities = array_keys($filter->callbacks);
                $largest = max($allCallbackPriorities);

                if (is_numeric($largest) && ($largest != PHP_INT_MAX)) {
                    return $largest + 1;
                } else {
                    return PHP_INT_MAX;
                }
            }
        }
    }
}
