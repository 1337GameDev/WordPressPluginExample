<?php
namespace TestPlugin\Models {
    use \TestPlugin\DBResult;
    use \TestPlugin\PDOHelper;

    /**
     * Class TestPluginModelDataHelper
     * Used to instantiate models used in database setup to load base data into the database
     *
     * @package TestPlugin\Models
     */
    class TestPluginModelDataHelper extends ModelDataHelper {
        private static $classNames = [];
        public static function getAllModelClassNames(array $dataArray = []):array{
            if(empty(TestPluginModelDataHelper::$classNames)) {
                TestPluginModelDataHelper::$classNames = ModelBase::getAllModelClassNames();
            }

            return TestPluginModelDataHelper::$classNames;
        }

        public static function instantiateByName(string $className):ModelBase{
            $result = NULL;

            if(TestPluginModelDataHelper::isModelName($className)){
                $className = __NAMESPACE__ . '\\' . $className;
                $result = new $className();
            }

            return $result;
        }

        public static function isModelName($modelName):bool{
            return in_array($modelName, TestPluginModelDataHelper::getAllModelClassNames() );
        }

        public static function getBaseDataModels(array $dataArray = []):array{
            if(static::isDebug()){
                error_log("----------------------------- " . static::class . ":getBaseDataModels -----------------------------");
            }
            $resultModels = [];

            $roleSuperAdmin = new Role();
            $roleSuperAdmin->rolename = "SuperAdmin";
            $roleSuperAdmin->lastUserModified = 0;
            $roleSuperAdmin->description = "Used for total control of the plugin, and managing of low-level actions / processes.";
            $resultModels["roleSuperAdmin"] = $roleSuperAdmin;

            $roleAdmin = new Role();
            $roleAdmin->rolename = "Admin";
            $roleAdmin->lastUserModified = 0;
            $roleAdmin->description = "Used for managing this plugin, beyond basic user functions.";
            $resultModels["roleAdmin"] = $roleAdmin;

            $roleStaff = new Role();
            $roleStaff->rolename = "Staff";
            $roleStaff->lastUserModified = 0;
            $roleStaff->description = "Used for staff of the plugin that will simply be using the plugin.";
            $resultModels["roleStaff"] = $roleStaff;

            $roleViewer = new Role();
            $roleViewer->rolename = "Viewer";
            $roleViewer->lastUserModified = 0;
            $roleViewer->description = "";
            $resultModels["roleViewer"] = $roleViewer;

            $roleUser = new Role();
            $roleUser->rolename = "User";
            $roleUser->lastUserModified = 0;
            $roleUser->description = "";
            $resultModels["roleUser"] = $roleUser;

            $userGroupSystem= new UserGroup();
            $userGroupSystem->groupname = "System";
            $userGroupSystem->lastUserModified = 0;
            $resultModels["userGroupSystem"] = $userGroupSystem;

            $userGroupGeneral = new UserGroup();
            $userGroupGeneral->groupname = "General";
            $userGroupGeneral->lastUserModified = 0;
            $resultModels["userGroupGeneral"] = $userGroupGeneral;

            $userSystem = new User();
            $userSystem->firstname = 'System';
            $userSystem->lastname = 'System';
            $userSystem->username = 'system';
            $userSystem->role = $roleSuperAdmin;
            $userSystem->groups[] = $userGroupSystem;
            $userSystem->lastUserModified = 0;
            $resultModels["userSystem"] = $userSystem;

            $userJsmith = new User();
            $userJsmith->firstname = 'John';
            $userJsmith->lastname = 'Smith';
            $userJsmith->username = 'jsmith';
            $userJsmith->role = $roleAdmin;
            $userJsmith->groups[] = $userGroupGeneral;
            $userJsmith->lastUserModified = $userSystem;
            $resultModels["userJsmith"] = $userJsmith;

            $langEN = new Language();
            $langEN->lastUserModified = $userSystem;
            $langEN->languagename = "English";
            $langEN->languagefamily = "Indo-European";
            $langEN->iso639_1 = "en";
            $langEN->iso639_2 = "eng";
            $resultModels["langEN"] = $langEN;

            $langFR = new Language();
            $langFR->lastUserModified = $userSystem;
            $langFR->languagename = "French";
            $langFR->languagefamily = "Indo-European";
            $langFR->iso639_1 = "fr";
            $langFR->iso639_2 = "fra";
            $resultModels["langFR"] = $langFR;

            $langES = new Language();
            $langES->lastUserModified = $userSystem;
            $langES->languagename = "Spanish";
            $langES->languagefamily = "Indo-European";
            $langES->iso639_1 = "es";
            $langES->iso639_2 = "spa";
            $resultModels["langES"] = $langES;

            //used for manual testing
            $setting2 = new Setting();
            $setting2->settingname = "TestSetting1";
            $setting2->settingvalue = "TestValue1";
            $setting2->lastUserModified = $userSystem;
            $resultModels["setting2"] = $setting2;

            return $resultModels;
        }

        /* Extra Database Operations */

    }
}