<?php
namespace TestPlugin {
    /**
     * A class used for representing the results from validating an uploaded file
     */
    class FileValidationResult implements \JsonSerializable {
        public $success;
        public $result;
        public $message;

        public function __construct(bool $success = false, $result = [], string $message = ""){
            $this->success = $success;
            $this->result = $result;
            $this->message = $message;
        }

        public function jsonSerialize(){
            return [
                "result" => $this->result,
                "message" => $this->message,
                "success" => $this->success,
            ];
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

        public function addMessage(string $msg) {
            if(!empty($this->message)){
                if(!is_array($this->message)){
                    $this->message = [$this->message];
                }

                $this->message[] = $msg;
            } else {
                $this->message = $msg;
            }
        }

        public function getMessages(bool $mergeMessages = true):string {
            $resultMessages = $this->message;
            if($mergeMessages && is_array($resultMessages)) {
                $resultMessages = implode('',$resultMessages);
            }

            return $resultMessages;
        }

        public function combine(FileValidationResult $other){
            $this->success = $this->success && $other->success;
            if(!empty($other->message)) {
                $this->addMessage($other->message);
            }
            if(!empty($other->result)) {
                $this->addToResult($other->result);
            }
        }
    }
}