<?php

namespace TestPlugin;
use TestPlugin\UtilityFunctions;

/**
 * A class used to assist in doing things with JSON
 * */
class JSONHelper {
    private static $sentHeaders = false;

    /**
     * Encodes a data array, as a JSON string, with optional parameters for escaping / preparing to be inserted as HTML
     *
     * @param array $data The data to encode
     * @param bool $escapeCharacters Whether to escape the characters in the JSON (sometimes the source data can already be escaped)
     * @param bool $prepareForHTML Whether to escape the string of any HTML entities
     *
     * @return string The encoded data, as a JSON string
     */
    public static function encode_as_json($data = [], bool $escapeCharacters = false, $prepareForHTML = false):string {
        $result = "";
        if($escapeCharacters) {
            $result = json_encode($data);
        } else {
            $result = json_encode($data, JSON_UNESCAPED_SLASHES);
        }

        if($prepareForHTML) {
            $result = htmlspecialchars($result, ENT_QUOTES, 'UTF-8');
        }

        return $result;
    }

    /**
     * Decodes a JSON string into an associative array.
     *
     * @param string $jsonStr The JSON string to decode
     * @param bool $unescapeJson Whether to unescape the characters in the JSON
     *
     * @return array The resulting associative array
     */
    public static function decode_from_json($jsonStr = "{}", bool $unescapeJson = true):array {
        $preparedJson = JSONHelper::remove_json_comments($jsonStr);
        $preparedJson = JSONHelper::remove_newlines($preparedJson);
        $preparedJson = JSONHelper::remove_extra_formatting($preparedJson);

        if($unescapeJson) {
            $preparedJson = stripslashes($preparedJson);
        }

        $result = json_decode($preparedJson, true);

        return (empty($result) ? [] : $result);
    }

    /**
     * Validates if a string is valid JSON
     *
     * @param string $data The string to validate
     * @param bool $unescapeJson Whether to unescape the characters in the JSON
     *
     * @return bool Whether the string was valid JSON or not
     */
    public static function validate_json($data = "{}", bool $unescapeJson = true):bool {
        $preparedJson = JSONHelper::remove_json_comments($data);
        $preparedJson = JSONHelper::remove_newlines($preparedJson);
        if($unescapeJson) {
            $preparedJson = stripslashes($preparedJson);
        }

        json_decode($data, $preparedJson);
        return (json_last_error() === JSON_ERROR_NONE);
    }

    /**
     * Gets the last error stored by "json_decode"
     *
     * @return string The last error message
     */
    public static function get_last_json_error():string {
        return json_last_error_msg();
    }

    /**
     * Removes JSON comments from a given string
     *
     * @param string $json The string to remove JSON comments from
     *
     * @return string The string, with JSON comments removed
     */
    public static function remove_json_comments(string $json):string {
        return preg_replace("#(/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+/)|([\s\t]//.*)|(^//.*)#", '', $json);
    }

    /**
     * Removes newlines from a given string
     *
     * @param string $json The string to remove newlines from
     *
     * @return string The string, with newlines removed
     */
    public static function remove_newlines(string $json):string {
        return str_replace(array("\n","\r","\t"),"",$json);
    }

    /**
     * Removes JSON formatting from a given string
     *
     * @param string $json The string to remove JSON formatting from
     *
     * @return string The string, with JSON formatting removed
     */
    public static function remove_extra_formatting(string $json):string {
        $preparedJSON = preg_replace('/([{,]+)(\s*)([^"]+?)\s*:/', '$1"$3":', $json);
        $preparedJSON = preg_replace('/(,)\s*}$/', '}', $json);
        return $preparedJSON;
    }

    /**
     * Sends a given AjaxResponse object as a JSON response
     *
     * @param AjaxResponse $json The string to remove JSON formatting from
     * @param string $nonceName (optional) The name of the none to create when returning the JSON as a response
     * @param bool $keepAlive Whether to flush the response buffer now and continue executing, or to call exit (which stops script execution and forces the response to be written)
     *
     */
    public static function send_json_response(AjaxResponse $response, string $nonceName = "", bool $keepAlive = false) {
        if(!empty($nonceName)) {
            $response->newNonce = wp_create_nonce($nonceName);
        }

        // response output
        if(!JSONHelper::$sentHeaders){
            header("Content-Type: application/json");
            self::$sentHeaders = true;
        }

        echo json_encode($response);
        if(!$keepAlive){
            exit;
        } else {
            flush(); // Push to the client / ajax
            ob_flush(); // As above
        }
    }

    /**
     * Sends a given AjaxResponse object as a JSON response
     *
     * @param string $filename The filename of the JSON file to load
     * @param string $dir The directory to load the JSON file from
     *
     * @return bool|array The result of loading the JSON file as an associative array or FALSE on failure
     */
    public static function load_json_file($filename = "", $dir = ""){
        if(!UtilityFunctions::stringEndsWith($filename, ".json")) {
            $filename .= ".json";
        }

        $fullPath = $dir.DIRECTORY_SEPARATOR.$filename;
        if(!empty($filename) && !empty($dir) && file_exists($fullPath)) {
            //@ to ignore warnings
            $contents = @file_get_contents($fullPath);

            if(($contents === FALSE) && !JSONHelper::validate_json($contents)) {
                return FALSE;
            } else {
                //valid contents
                //now parse into associative array
                return JSONHelper::decode_from_json($contents);
            }
        } else {
            return FALSE;
        }
    }
}