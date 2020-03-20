<?php
namespace TestPlugin {
    /**
     * A class that represents a result from a database operation.
     * */
    class DBResult {
        public $success;
        public $messages;
        public $result;

        //use to track if the "result" field has already been "combined" with another once
        private $combinedPreviously = false;

        public function __construct(bool $success = false, array $messages = [], $result = null) {
            $this->success = $success;
            $this->messages = $messages;
            $this->result = $result;
        }

        public function combine(DBResult $other) {
            $this->success = ($this->success && $other->success);
            $thisMessages = $this->messages;
            $otherMessages = $other->messages;

            if(!is_array($thisMessages)) {
                $thisMessages = [$thisMessages];
            }
            if(!is_array($otherMessages)) {
                $otherMessages = [$otherMessages];
            }

            $this->messages = array_merge($thisMessages, $otherMessages);
            $this->messages = array_filter($this->messages);

            if($this->combinedPreviously) {
                $this->result[] = $other->result;
            } else {
                $this->combinedPreviously = true;
                $this->result = [$this->result, $other->result];
            }
        }

        public function addMessage(string $msg) {
            if(!empty($msg)){
                if(!empty($this->messages)){
                    if(!is_array($this->messages)){
                        $this->messages = [$this->messages];
                    }

                    $this->messages[] = $msg;
                } else {
                    $this->messages = $msg;
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
            $resultMessages = $this->messages;
            if($mergeMessages && is_array($resultMessages)) {
                $resultMessages = implode(' ',$resultMessages);
            }

            return $resultMessages;
        }
    }
}