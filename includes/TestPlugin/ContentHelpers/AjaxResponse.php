<?php
namespace TestPlugin {
    /**
     * A class that represents a response from an AJAX call.
     * */
    class AjaxResponse implements \JsonSerializable {
        public $success;
        public $result;
        public $message;
        public $newNonce;

        public function __construct(bool $success = false, $result = [], string $message = "", string $newNonce = ""){
            $this->success = $success;
            $this->result = $result;
            $this->message = $message;
            $this->newNonce = $newNonce;
        }

        public function jsonSerialize():array {
            if(!empty($this->newNonce)){
                return [
                    "result" => $this->result,
                    "message" => $this->message,
                    "success" => $this->success,
                    "newNonce" => $this->newNonce
                ];
            } else {
                return [
                    "result" => $this->result,
                    "message" => $this->message,
                    "success" => $this->success
                ];
            }
        }

        public function addMessage(string $msg) {
            if(!empty($msg)){
                if(!empty($this->message)){
                    if(!is_array($this->message)){
                        $this->message = [$this->message];
                    }

                    $this->message[] = $msg;
                } else {
                    $this->message = $msg;
                }
            }
        }

        public function addToResult($result) {
            if(!empty($this->result)){
                if(!is_array($this->result)){
                    $this->result = [$this->result];
                }

                $this->result[] = $result;
            } else {
                $this->result = $result;
            }
        }

        public function getMessages(bool $mergeMessages = true):string {
            $resultMessages = $this->message;
            if($mergeMessages && is_array($resultMessages)) {
                $resultMessages = implode('',$resultMessages);
            }

            return $resultMessages;
        }

        public function combine(AjaxResponse $other){
            $this->success = $this->success && $other->success;
            $thisMessages = $this->message;
            $otherMessages = $other->message;

            if(!is_array($thisMessages)) {
                $thisMessages = [$thisMessages];
            }
            if(!is_array($otherMessages)) {
                $otherMessages = [$otherMessages];
            }

            $this->message = array_merge($thisMessages, $otherMessages);
            $this->message = array_filter($this->message);

            if(!empty($other->result)) {
                $this->addToResult($other->result);
            }
        }
    }
}