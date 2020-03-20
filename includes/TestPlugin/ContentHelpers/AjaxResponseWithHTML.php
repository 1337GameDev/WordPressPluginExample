<?php
namespace TestPlugin {
    /**
     * A class that represents a response from an AJAX call with HTML to be used to render something.
     * */
    class AjaxResponseWithHTML extends AjaxResponse {
        public $html;

        public function __construct(bool $success = false, $result = [], string $message = "", string $newNonce = "", string $html = ""){
            parent::__construct($success, $result, $message, $newNonce);

            $this->html = $html;
        }

        public function jsonSerialize():array {
            $result = parent::jsonSerialize();
            $result['html'] = $this->html;
            return $result;
        }

        public function combine(AjaxResponse $other){
            parent::combine($other);
            if($other instanceof AjaxResponseWithHTML){
                $this->html .= AjaxResponseWithHTML::asThisClass($other)->html;
            }
        }

        public static function asThisClass($obj):AjaxResponseWithHTML {
            return $obj;
        }
    }
}