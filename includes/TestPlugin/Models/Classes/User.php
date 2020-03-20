<?php
namespace TestPlugin\Models {
    use TestPlugin\FieldCondition;
    use TestPlugin\PDOHelper;
    use TestPlugin\Models\Role;

    /**
     * Class User
     * A class that represents a user (but WordPress users can be used with the plugin if need be instead)
     * @package TestPlugin\Models
     */
    class User extends ModelBase {
        public $username;
        public $role;
        public $firstname;
        public $lastname;

        public $groups = [];

        public static function getExtraProperties():array {
            static $extra;
            if(empty($extra)) {
                $extra = array_merge([
                    "groups"
                ], parent::getExtraProperties());
            }
            return $extra;
        }

        //fields that need extra security to ensure anonymous users dont have access (or malicious admins / scripts)
        public static function getSecureFields():array {
            return ['firstname','lastname'];
        }

        public function __construct() {
            parent::__construct();

        }

        public function loadBy(string $fieldName = "", PDOHelper $source = null, bool $includeSecureFields = false, array $fieldsToLoad = []):bool {
            $success = parent::loadBy($fieldName, $source, $includeSecureFields);

            if($success) {
                //ensure any passed in field names ACTUALLY are fields of this model
                $fieldsToLoad = $this->filterInvalidFields($fieldsToLoad);

                if(!$includeSecureFields) {
                    $fieldsToLoad = $this->filterSecureFields($fieldsToLoad);
                }

                /*
                if(in_array('role',$fieldsToLoad)){
                    //now load the role object, as it contains the id
                    $roleObj = new Role();
                    $roleObj->id = $this->role;
                    $success = $roleObj->loadByID($source, $includeSecureFields);
                    if($success){
                        $this->role = $roleObj;
                    }
                }
                */


            }

            return $success;
        }

        protected function afterLoad(PDOHelper $source, array $fieldsToLoad = [], bool $includeSecureFields = false):bool {
            $success = parent::afterLoad($source, $fieldsToLoad, $includeSecureFields);
            if($success){
                if(empty($fieldsToLoad)) {
                    $fieldsToLoad = $this->getProperties(true);
                }

                if(!$includeSecureFields) {
                    $fieldsToLoad = $this->filterSecureFields($fieldsToLoad);
                }

                if(in_array('role',$fieldsToLoad)){
                    //now load the role object, as it contains the id
                    $roleObj = new Role();
                    $roleObj->id = $this->role;
                    $success = $roleObj->loadByID($source, $includeSecureFields);
                    if($success){
                        $this->role = $roleObj;
                    }
                }

                $condition = new FieldCondition('userid', $this->id);
                //useroptions
                if(in_array('groups', $fieldsToLoad)){
                    $dbResult = UserUserGroup::loadAllBy($source, $includeSecureFields, [], 1, 32, "id", $condition);
                    if($dbResult->success){
                        $usergroups = $dbResult->result['results'];
                        $this->groups = $usergroups;
                    } else {
                        return false;
                    }

                }






            }

            return $success;
        }

        protected function saveExtraFields(PDOHelper $source, bool $alreadyInTransaction = false):bool{
            //common data elements to include in other objects to save
            $commonData = [
                "userid" => $this->id,
                "lastUserModified" => $this->lastUserModified
            ];

            //usergroups
            $userGroupsResult = UserUserGroup::saveManyToManyModel($source, $this->groups, $commonData, $alreadyInTransaction);
            if($userGroupsResult->success){
                $this->groups = $userGroupsResult->result;
            }

            return ($userGroupsResult->success);
        }
    }
}