<?php
namespace TestPlugin\Models {
    use TestPlugin\PDOHelper;

    /**
     * Class UserUserGroup
     * A class that represents a many-to-many relationship between User and UserGroup (hence the name *User**UserGroup*)
     *
     * @package TestPlugin\Models
     */
    class UserUserGroup extends ModelBase implements ManyToMany {
        public $userid;
        public $usergroup;

        public function __construct() {
            parent::__construct();
        }

        public static function getFromClass():string {return User::class;}
        public static function getFromFieldName():string {return "userid";}
        public static function getToClass():string{return UserGroup::class;}
        public static function getToFieldName():string{return "usergroup";}

        protected function loadExtraFields(PDOHelper $source, bool $includeSecureFields = false):bool {
            if(ModelBase::isDebug()){
                error_log('loadExtraFields:' . $this->getClassname());
            }

            //usergroup
            $userGroup = new UserGroup();
            $userGroup->id = $this->usergroup;
            $success = $userGroup->loadByID($source, $includeSecureFields);
            if($success) {
                if(ModelBase::isDebug()){
                    error_log('Load UserGroup success');
                }
                $this->usergroup = $userGroup;
            }

            return $success;
        }
    }
}