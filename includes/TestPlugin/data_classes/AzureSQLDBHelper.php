<?php
class TestPlugin_AzureSQLDBHelper {
    private static $server = "tcp:resource-library.database.windows.net";
    private static $port = "1433";
    private static $dbName = "";
    private static $dbUser = "";
    private static $dbUserPass = "";

    private static $dbConnection = NULL;

    public function __construct() {
        $this->initConnection();
    }

    private function initConnection() {
        // PHP Data Objects(PDO) Sample Code:
        try {
            $this->dbConnection = new PDO("sqlsrv:server = ".$this->server.",".$this->port."; Database = ".$this->dbName, $this->dbUser, $this->dbUserPass);
            $this->dbConnection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        }
        catch (PDOException $e) {
            print("Error connecting to Azure SQL Server.");
            die(print_r($e));
        }
    }
}
