<?php
class TestPlugin_AzureBlobStorageHelper {
    private static $server = "";
    private static $port = "";
    private static $storageName = "";
    private static $storageUser = "";
    private static $storageUserPass = "";

    private static $storageConnection = NULL;

    public function __construct() {
        $this->initConnection();
    }

    private function initConnection() {

    }
}