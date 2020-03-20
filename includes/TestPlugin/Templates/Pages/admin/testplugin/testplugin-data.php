<?php
use TestPlugin\DBResult;
use TestPlugin\Models\Language;
use TestPlugin\Models\Role;
use TestPlugin\Models\Setting;
use TestPlugin\Models\User;
use TestPlugin\Models\StoredString;
use TestPlugin\Models\UserGroup;
use TestPlugin\TestPlugin_Class;
use TestPlugin\AjaxFunctionClasses\Pages\Admin\testplugin_AjaxFunctions;

$dataToReturn = [
    "Languages" => [],
    "Roles" => [],
    "Settings" => [],
    "StoredStrings" => [],
    "Users" => [],
    "UserGroups" => []
];
$dataSource = TestPlugin_Class::getExternalConnection(TestPlugin_Class::TESTPLUGIN_PDO_DB_KEY);
$result = NULL;

/* Languages */
$result = Language::loadAllBy($dataSource, false, [], 1, 100, "id");
$dataToReturn["Languages"] = ($result !== NULL) && $result->success ? $result->result['results'] : [];//the result field is an array of properties about the results, one of which has ANOTHER "results" field

/* Roles */
$result = Role::loadAllBy($dataSource, false, [], 1, 100, "id");
$dataToReturn["Roles"] = ($result !== NULL) && $result->success ? $result->result['results'] : [];//the result field is an array of properties about the results, one of which has ANOTHER "results" field

/* Settings */
$result = Setting::loadAllBy($dataSource, false, [], 1, 100, "id");
$dataToReturn["Settings"] = ($result !== NULL) && $result->success ? $result->result['results'] : [];//the result field is an array of properties about the results, one of which has ANOTHER "results" field

/* StoredStrings */
$result = StoredString::loadAllBy($dataSource, false, [], 1, 100, "id");
$dataToReturn["StoredStrings"] = ($result !== NULL) && $result->success ? $result->result['results'] : [];//the result field is an array of properties about the results, one of which has ANOTHER "results" field

/* Users */
$result = User::loadAllBy($dataSource, false, [], 1, 100, "id");
$dataToReturn["Users"] = ($result !== NULL) && $result->success ? $result->result['results'] : [];//the result field is an array of properties about the results, one of which has ANOTHER "results" field

/* UserGroups */
$result = UserGroup::loadAllBy($dataSource, false, [], 1, 100, "id");
$dataToReturn["UserGroups"] = ($result !== NULL) && $result->success ? $result->result['results'] : [];//the result field is an array of properties about the results, one of which has ANOTHER "results" field

return $dataToReturn;