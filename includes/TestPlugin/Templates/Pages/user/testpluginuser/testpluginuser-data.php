<?php
use TestPlugin\DBResult;
use TestPlugin\Models\Language;
use TestPlugin\TestPlugin_Class;

$dataToReturn = [
    "Languages" => []
];
$dataSource = TestPlugin_Class::getExternalConnection(TestPlugin_Class::TESTPLUGIN_PDO_DB_KEY);
$result = NULL;

/* Languages */
$result = Language::loadAllBy($dataSource, false, [], 1, 100, "id");
$dataToReturn["Languages"] = ($result !== NULL) && $result->success ? $result->result['results'] : [];//the result field is an array of properties about the results, one of which has ANOTHER "results" field

return $dataToReturn;