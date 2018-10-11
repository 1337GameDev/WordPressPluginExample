<?php
namespace TestPlugin {
    use TestPlugin\NoticeType;

    class UtilityFunctions
    {
        public static function create_json_result($resultData, $message, $successValue, $nonceName)
        {
            $array = array(
                "result" => $resultData,
                "message" => $message,
                "success" => $successValue,
                "newNonce" => wp_create_nonce($nonceName)
            );

            return json_encode($array);
        }

        public static function create_json_result_no_nonce($resultData, $message, $successValue)
        {
            $array = array(
                "result" => $resultData,
                "message" => $message,
                "success" => $successValue
            );

            return json_encode($array);
        }

        public static function rstrpos($haystack, $needle, $offset)
        {
            $size = strlen($haystack);
            $pos = strpos(strrev($haystack), $needle, $size - $offset);

            if ($pos === false) {
                return false;
            }

            return $size - $pos;
        }

        public static function getJSON($str)
        {
            $json = str_replace("\n", "\\n", $str);
            $json = str_replace("\r", "", $json);
            $json = str_replace("\\", "", $json);
            $json = preg_replace('/([{,]+)(\s*)([^"]+?)\s*:/', '$1"$3":', $json);
            $json = preg_replace('/(,)\s*}$/', '}', $json);
            $json = json_decode($json);
            return $json;
        }

        public static function imageThumbnailExists($imagePathDirectoryArray, $imageName, $imageExt)
        {
            $thumbnailPath = $_SERVER['DOCUMENT_ROOT'] . DIRECTORY_SEPARATOR . DIRECTORY_SEPARATOR . implode(DIRECTORY_SEPARATOR . DIRECTORY_SEPARATOR, $imagePathDirectoryArray) . DIRECTORY_SEPARATOR . DIRECTORY_SEPARATOR . $imageName . "_thumbnail." . $imageExt;
            return file_exists($thumbnailPath);
        }

        public static function noticeMessageHtml($message, $noticeTypeEnum)
        {
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
    }
}
