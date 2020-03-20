<?php
namespace TestPlugin {
    /**
     * Class SessionHelper
     * A class used to help interact with a PHP session.
     * The methods in this object should be self explanatory.
     *
     * @package TestPlugin
     */
    class SessionHelper {
        public function __construct() {}

        public static function openSession(){
            if (!SessionHelper::isSessionOpen()) {
                session_start();
            }
        }

        public static function isSessionClosed(){
            return (session_status() == PHP_SESSION_NONE) || (session_status() == PHP_SESSION_DISABLED);
        }

        public static function isSessionOpen(){
            return (session_status() == PHP_SESSION_ACTIVE);
        }

        public static function releaseSessionLock(){
            session_write_close();
        }

        public static function sessionContains(string $key, bool $andNotEmpty = false):bool {
            $result = false;
            SessionHelper::openSession();

            if(!empty($key)){
                $result = array_key_exists($key, $_SESSION);
                if($result && $andNotEmpty){
                    $result = !empty($_SESSION[$key]);
                }
            }

            return $result;
        }

        public static function addToSession(string $key, $value, bool $overwrite=false):bool{
            if(!empty($key)){
                if(SessionHelper::sessionContains($key) && !$overwrite){
                    return false;
                } else {
                    $_SESSION[$key] = $value;
                    return true;
                }
            }
        }

        public static function getFromSession(string $key, $immediatelyCloseSession = false){
            $value = null;
            SessionHelper::openSession();
            if(!empty($key)){
                $value = $_SESSION[$key];
            }

            if($immediatelyCloseSession) {
                SessionHelper::releaseSessionLock();
            }

            return $value;
        }

        public static function removeFromSession($key, $immediatelyCloseSession = false) {
            SessionHelper::openSession();
            if(!empty($key)){
                unset($_SESSION[$key]);
            }

            if($immediatelyCloseSession) {
                SessionHelper::releaseSessionLock();
            }
        }
    }
}