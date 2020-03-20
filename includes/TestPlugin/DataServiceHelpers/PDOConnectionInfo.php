<?php
namespace TestPlugin {
    /**
     * Class PDOConnectionInfo A class that represents information needed to connect to a database via PDO
     * @package TestPlugin
     */
    class PDOConnectionInfo {
        public $host;
        public $database;
        public $user;
        public $pass;
        public $charset;
        public $port;

        public const DEFAULT_CHARSET = "utf8mb4";

        public function __construct(string $host, string $db, string $user, string $pass, string $port = "", string $charset = PDOConnectionInfo::DEFAULT_CHARSET) {
            $this->host = $host;
            $this->database = $db;
            $this->user = $user;
            $this->pass = $pass;
            $this->port = $port;
            $this->charset = $charset;
        }

        public static function fromAssocArray($settings) {
            if(
                (array_key_exists("host", $settings) && !empty($settings["host"])) &&
                (array_key_exists("database", $settings) && !empty($settings["database"])) &&
                (array_key_exists("user", $settings) && !empty($settings["user"])) &&
                (array_key_exists("pass", $settings) && !empty($settings["pass"]))
            ){
                if(!array_key_exists("charset", $settings) || empty($settings["charset"])) {
                    $settings["charset"] = PDOConnectionInfo::DEFAULT_CHARSET;
                }

                return new PDOConnectionInfo($settings["host"], $settings["database"], $settings["user"], $settings["pass"], $settings["port"], $settings["charset"]);
            } else {
                return NULL;
            }
        }

        public function verify():bool{
            return (!empty($this->host)) &&
                (!empty($this->database)) &&
                (!empty($this->user)) &&
                (!empty($this->pass)) &&
                (!empty($this->charset));
        }

        /**
         * Uses this object to construct a DSN to connect to a database
         *
         * @return string The DSN to be fed to a PDO object so a connect to a database can be made
         */
        public function makeMySQL_DSN():string {
            $dsn = "mysql:host={$this->host};";
            if(!empty($this->port) ) {
                $dsn .= "port={$this->port};";
            }

            $dsn .= "dbname={$this->database};charset={$this->charset}";
            return $dsn;
        }
    }
}