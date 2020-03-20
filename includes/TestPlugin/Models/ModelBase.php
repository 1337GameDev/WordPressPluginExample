<?php
namespace TestPlugin\Models {
    use TestPlugin\DBResult;
    use TestPlugin\PDOHelper;
    use TestPlugin\SQLLoader;
    use TestPlugin\Models\Referencable;
    use TestPlugin\Models\Translatable;
    use TestPlugin\Models\ModelCache;
    use TestPlugin\FieldCondition;
    use TestPlugin\UtilityFunctions;

    /**
     * Class ModelBase
     * A class that is used to save/load/manipulate data in a database, based on subclassing and calling these functions from the subclass.
     * This class operates basically like a rudimentary ORM
     *
     * @package TestPlugin\Models
     */
    abstract class ModelBase implements \JsonSerializable {
        //Base fields every model has
        public $lastModified;
        public $created;
        public $lastUserModified;
        public $id;
        //

        public $_serializeAllProperties = false;
        public $_fieldsToSerialize = [];
        //use this function to easily set the above array (which will be used when serializing)
        public function setFieldsToSerialize(array $fields = [], bool $includeAllNonExtraFields = true, bool $includeExtraProps = true) {
            if($includeAllNonExtraFields) {
                $this->_fieldsToSerialize = $this->getProperties($includeExtraProps);
            } else if($includeExtraProps) {
                $this->_fieldsToSerialize = static::getExtraProperties();
            }

            $this->_fieldsToSerialize = array_merge($this->_fieldsToSerialize, $fields);
        }
        public function addFieldToSerialize(string $fieldName) {
            if(!array_key_exists($fieldName, $this->_fieldsToSerialize)){
                $this->_fieldsToSerialize[] = $fieldName;
            }
        }
        public function removeFieldToSerialize(string $fieldName) {
            if(array_key_exists($fieldName, $this->_fieldsToSerialize)){
                foreach (array_keys($this->_fieldsToSerialize, $fieldName) as $key) {
                    unset($this->_fieldsToSerialize[$key]);
                }
            }
        }

        private static $modelClassesDir = "";
        public static function getModelClassesDir():string {
            if(empty(ModelBase::$modelClassesDir)) {
                ModelBase::$modelClassesDir = implode(DIRECTORY_SEPARATOR, [
                    __DIR__,
                    'Classes',
                    '*.php'
                ]);
            }

            return ModelBase::$modelClassesDir;
        }

        private static $isDebug = false;
        public static function enableDebug() {ModelBase::$isDebug = true;}
        public static function disableDebug() {ModelBase::$isDebug = false;}
        public static function isDebug():bool {return ModelBase::$isDebug;}

        public function __construct() {

        }

        //extra properties not related to db
        public static function isTranslatableStatic():bool {
            $translatableName = Translatable::class;
            return is_a(static::getFullStaticClassname(), $translatableName, true);
        }

        //extra properties not related to db
        public function isTranslatable():bool {
            $translatableName = Translatable::class;
            return $this instanceof $translatableName;
        }

        //extra properties not related to db that we generally want to ignore when fetching from the db/saving, or when serializing
        public static function getExtraProperties():array {
            static $extra = [
                "isDebug",
                "tableName",
                "_serializeAllProperties",
                "_fieldsToSerialize",
                "modelClassesDir",

                //fields of interfaces that we always want to avoid using when saving, loading or serializing
                "fieldsToTranslate"
            ];
            return $extra;
        }

        //fields that need extra security to ensure anonymous users dont have access (or malicious admins / scripts)
        public static function getSecureFields():array {
            return [];
        }

        //used to filter out secure fields from a list, if they are secure (for use when those fields shouldn't be used in an "insecure" operation)
        public static function filterSecureFields(array $fieldList = []):array {
            if(ModelBase::isDebug() ){
                error_log("----------------------------- filterSecureFields:" . self::getStaticClassname() . " -----------------------------");
            }

            $result = [];
            if(!empty($fieldList)){
                //get a list of all fields allowed for "non secure" loading
                $result = array_diff($fieldList, self::getSecureFields() );
                if(ModelBase::isDebug() ){
                    error_log("Fields to load - that aren't secure: " . print_r($result, true));
                }
            }

            return $result;
        }

        //used to filter out extra fields from a list, because they won't be present in the database
        public static function filterExtraFields(array $fieldList = []):array {
            if(ModelBase::isDebug() ){
                error_log("----------------------------- filterExtraFields:" . self::getStaticClassname() . " -----------------------------");
            }

            $result = [];
            if(!empty($fieldList)){
                $result = array_filter($fieldList, [static::class, 'extraPropertiesFilter'], ARRAY_FILTER_USE_BOTH);
                if(ModelBase::isDebug() ){
                    error_log("Fields to load - that aren't extra: " . print_r($result, true));
                }
            }

            return $result;
        }

        /**
         * This is used to filter an array of fields, and remove any that are NOT valid properties of this model (via "::getPropertiesStatic")
         *
         * @param array $fields The fields to verify.
         * @return array The fields that are valid
         */
        public static function filterInvalidFields(array $fields):array {
            if(ModelBase::isDebug() ){
                error_log("----------------------------- filterInvalidFields:" . self::getStaticClassname() . " -----------------------------");
            }

            $result = [];
            if(!empty($fields)){
                $props = self::getPropertiesStatic();
                if(ModelBase::isDebug()){
                    error_log("Fields specified, so ensure they belong to this object");
                    error_log('Fields provided:'.print_r($fields,true));
                }
                $result = array_intersect($fields, $props);
                if(ModelBase::isDebug()){
                    error_log("Properties of this object:".print_r($props,true));
                    error_log("Fields that are in this objects properties:".print_r($result,true));
                }
            }

            return $result;
        }

        public function addProperty($name, $value){
            $this->{$name} = $value;
        }

        public static function getFullStaticClassname():string {
            return static::class;
        }

        public function getFullClassname():string {
            return get_class($this);
        }

        public static function getStaticClassname():string {
            return UtilityFunctions::getClassWithoutNamespace(static::class);
        }

        public static function getStaticNamespace():string{
            return __NAMESPACE__;
        }

        public function getClassname():string {
            return UtilityFunctions::getClassWithoutNamespace(get_class($this) );
        }

        public function getTableName():string {
            return static::getTableNameStatic();
        }

        public static function getTableNameStatic():string {
            $tableName = "tableName";
            if(property_exists(static::class, $tableName)) {
                return static::$$tableName;
            } else {
                return static::getStaticClassname().'s';
            }
        }

        //used to "hide" properties that are used for programming (and are unrelated to the db)
        //an example could be a "many-to-many" model, such as keywords, where we dont care about the "intermediate model" just the keywords
        public static function extraPropertiesFilter($name):bool {
            $extraProperties = static::getExtraProperties();
            return !in_array($name, $extraProperties);
        }

        //gets properties that should be considered when doing database work
        public function getProperties(bool $getExtraProps = false, array $fieldsToInclude = []):array {
            $props = array_keys(get_object_vars($this));
            if(!$getExtraProps && empty($fieldsToInclude)){
                $props = static::filterExtraFields($props);
            }

            if(!empty($fieldsToInclude)) {
                $props = array_filter($props, function($k) use ($fieldsToInclude) {
                    return in_array($k, $fieldsToInclude);
                }, ARRAY_FILTER_USE_KEY);
            }

            if(ModelBase::isDebug()){
                error_log('getProperties of "' . static::class . '":' . print_r($props, true));
            }

            return $props;
        }

        //get properties of this model class, that should be considered for database work
        public static function getPropertiesStatic(bool $getExtraProps = false, array $fieldsToInclude = []):array {
            $props = array_keys(get_class_vars(static::class ));
            if(!$getExtraProps && empty($fieldsToInclude)){
                $props = static::filterExtraFields($props);
            }

            if(!empty($fieldsToInclude)) {
                $props = array_filter($props, function($k) use ($fieldsToInclude) {
                    return in_array($k, $fieldsToInclude);
                }, ARRAY_FILTER_USE_KEY);
            }

            if(ModelBase::isDebug()){
                error_log('getPropertiesStatic of "' . static::class . '":' . print_r($props, true));
            }

            return $props;
        }

        /**
         * @param bool $getExtraProps Whether to get "extra" properties (properties that exist in code, and are NOT to be persisted to the database)
         * @param array $fieldsToInclude An array of fields to selectively include (or all if omitted)
         * @return array An associative array of the properties of this model, and their respective values
         */
        public function getPropertiesAndValues(bool $getExtraProps = false, array $fieldsToInclude = []):array {
            $propsAndValues = get_object_vars($this);
            if(!$getExtraProps && empty($fieldsToInclude)){
                $propsAndValues = array_filter($propsAndValues, [static::class, 'extraPropertiesFilter'], ARRAY_FILTER_USE_KEY);
            }

            if(!empty($fieldsToInclude)) {
                $propsAndValues = array_filter($propsAndValues, function($k) use ($fieldsToInclude) {
                    return in_array($k, $fieldsToInclude);
                }, ARRAY_FILTER_USE_KEY);
            }

            if(ModelBase::isDebug()){
                error_log('getPropertiesAndValues of "' . static::class . '":' . print_r($propsAndValues, true));
            }

            return $propsAndValues;
        }

        //only looks at properties related to db work
        public function hasProperty(string $property):bool {
            return in_array($property, $this->getProperties());
        }

        public function idIsInteger():bool {
            return static::isInteger($this->id);
        }

        public static function isInteger($val = ""):bool {
            if((!isset($val) && empty($val)) || !is_numeric($val)){
                return false;
            }

            $isInt = filter_var($val, FILTER_VALIDATE_INT);
            return ($isInt !== FALSE);
        }

        /**
         * Gets base field names that exist on all models, that NEED a value when saving via "execute" of a prepared statement.
         *
         * @return array Base field names present on all models
         */
        public static function getBaseFieldNames():array{
            static $fieldsToPrepare = [
                "lastUserModified"
                //"lastModified" and "created" are defaulted to "now()" MySQL functions (so we don't need to provide values for them)
            ];

            return $fieldsToPrepare;
        }

        /**
         * Gets field names that are defaulted in SQL statements.
         * Generally used to know which fields to NOT include when passing parameter arrays to "execute" of a prepared statement
         *
         * @return array The field names that are given defaults in SQL
         */
        public static function geFieldNamesToDefault():array{
            static $fieldsToPrepare = [
                "lastModified",
                "created"
            ];

            return $fieldsToPrepare;
        }

        //used to translate many models at once, via a static reference of the class.
        //An example of this is: Language::TranslateMany() to translate languages
        public static function TranslateMany(string $langCode = "", PDOHelper $source = null, $recordIDsToTranslate = []):DBResult {
            if(ModelBase::isDebug()){
                error_log("----------------------------- TranslateMany: ".self::getStaticClassname()."-----------------------------");
            }
            $result = new DBResult();

            if(empty($source)) {
                $result->addMessage("Source PDOHelper is invalid.");
                return $result;
            }

            if(empty($langCode)) {
                $result->addMessage("The language code for this object is empty.");
                return $result;
            }

            if(!self::isTranslatableStatic()) {
                $result->addMessage("The object of type \"".self::getStaticClassname()."\" does not implement Translatable.");
                return $result;
            }

            $pdo = $source->getPDOConnection();
            $sqlLoader = $source->getSqlLoader();

            $where = 'langTbl.'.SQLLoader::escapeFieldName('langCode').'=?';

            if(!empty($recordIDsToTranslate)) {
                $where .= ' AND transTbl.'.SQLLoader::escapeFieldName('translatedrecordid').' IN ('.implode(",", $recordIDsToTranslate).')';
            }

            $sqlPlaceholders = [
                "{table_name}" => self::getTableNameStatic(),
                "{model_name}" => self::getStaticClassname(),
                "{model_fields}" => self::getStaticTranslatedFieldNames(),//object was checked above to implement the "Translatable" interface, so this method exists on this instance
                "{where_clause}" => $where
            ];

            $sql = $sqlLoader->getSingleSqlFileStatement("translate", $sqlPlaceholders);

            if(ModelBase::isDebug()){
                error_log("sql: ".$sql);
            }

            try {
                $prepared = $pdo->prepare($sql);
                $params = [$langCode];

                if(!empty($recordIDsToTranslate)) {
                    $params = array_merge($params, $recordIDsToTranslate);
                }

                $success = $prepared->execute($params);
                if($success) {
                    $dbResults = $prepared->fetchAll(\PDO::FETCH_ASSOC);
                    $translatedResults = [];

                    foreach ($dbResults as $dbResult) {
                        $translatedResult = new static();
                        $translatedResult->id = $dbResult["translatedrecordid"];
                        $translatedResult->langCode = $langCode;

                        $keyForCache = ModelCache::getModelKey($translatedResult, ["langCode","id"]);
                        //copy all fields to be translated to this object
                        foreach ($dbResult as $field => $value) {
                            $translatedResult->{$field} = $value;//could possibly add new fields, as the translation table could have new values NOT in the class or this object
                        }

                        ModelCache::putInCache($keyForCache, $result);

                        $translatedResults[] = $translatedResult;
                    }

                    $result->result = $translatedResults;
                    $result->success = true;
                }
            } catch(\PDOException $e){
                $result->success = false;
                if(ModelBase::isDebug()){
                    error_log("Exception when executing SQL:".$e->getMessage());
                }
            }

            return $result;
        }

        //translate an instance of a model
        public function Translate(string $langCode = "", PDOHelper $source = null):bool {
            if(ModelBase::isDebug()){
                error_log("----------------------------- Translate:{$this->getClassname()} -----------------------------");
            }
            $success = false;

            if(empty($source) || empty($langCode) || !$this->idIsInteger() || ($this->id == 0) || !$this->isTranslatable()) {
                return $success;
            }

            $keyForCache = ModelCache::getModelKey($this, ["langCode","id"]);
            $dataFromCache = ModelCache::getFromCache($keyForCache);
            if(!empty($dataFromCache)){
                if(ModelBase::isDebug()){
                    error_log("Loaded from cache. Cached object:".print_r($dataFromCache,true));
                }

                static::populateFromArray($this, $dataFromCache);
                return true;
            }

            $pdo = $source->getPDOConnection();
            $sqlLoader = $source->getSqlLoader();

            $sqlPlaceholders = [
                "{table_name}" => $this->getTableName(),
                "{model_name}" => $this->getClassname(),
                "{model_fields}" => $this->getTranslatedFieldNames(),//object was checked above to implement the "Translatable" interface, so this method exists on this instance
                "{where_clause}" => 'transTbl.'.SQLLoader::escapeFieldName('translatedrecordid').'=? AND langTbl.'.SQLLoader::escapeFieldName('langCode')."=?"
            ];

            $sql = $sqlLoader->getSingleSqlFileStatement("translate", $sqlPlaceholders);

            if(ModelBase::isDebug()){
                error_log("sql: ".$sql);
            }

            try {
                $prepared = $pdo->prepare($sql);
                $success = $prepared->execute([$this->id, $langCode]);
                if($success) {
                    $result = $prepared->fetch(\PDO::FETCH_ASSOC);

                    //copy all fields to be translated to this object
                    foreach ($result as $field => $value) {
                        $this->{$field} = $value;//could possibly add new fields, as the translation table could have new values NOT in the class or this object
                    }

                    $this->addProperty('langCode', $langCode);

                    ModelCache::putInCache($keyForCache, $result);
                }
            } catch(\PDOException $e){
                $success = false;
                if(ModelBase::isDebug()){
                    error_log("Exception when executing SQL:".$e->getMessage());
                }
            }

            return $success;
        }

        //save a translated model, and uses the interface "Translatable" to know what fields to save/are able t be translated
        public function SaveTranslation(PDOHelper $source, $fieldNamesToSave = [], bool $alreadyInTransaction = false, bool $defaultEmptyValues = true):DBResult {
            if(ModelBase::isDebug()){
                error_log("----------------------------- SaveTranslation:{$this->getClassname()} -----------------------------");
            }

            $result = new DBResult();

            if(empty($source)) {
                $result->messages[] = "Source PDOHelper is invalid.";
                return $result;
            }

            if(empty($this->langCode)) {
                $result->messages[] = "The language code for this object is empty.";
                return $result;
            }

            if(!$this->idIsInteger() || (intval($this->id) <= 0)) {
                $result->messages[] = "The ID for this object is empty.";
                return $result;
            }

            if(!$this->isTranslatable()) {
                $result->messages[] = "The object \"".$this->getClassname()."\" does not implement Translatable.";
                return $result;
            }

            $pdo = $source->getPDOConnection();
            $sqlLoader = $source->getSqlLoader();

            $isUpdate = $this->idIsInteger() && (intval($this->id) > 0);
            if(ModelBase::isDebug()){
                error_log("SaveTranslation - isUpdate:" . $isUpdate);
            }

            //remove any prop names included in the parameter array that are NOT valid for the translation of this object
            $translatedFields = $this->getTranslatedFieldNames();
            if(!empty($fieldNamesToSave) && $isUpdate) {
                $fieldNamesToSave = array_intersect($translatedFields, $fieldNamesToSave);
            } else {//if insert, save all fields
                $fieldNamesToSave = $translatedFields;
            }

            //the where clause is only used in an update
            $whereClause = SQLLoader::escapeFieldName("translatedrecordid")."=? AND ".SQLLoader::escapeFieldName("destinationlanguageid")."=(SELECT `id` FROM {table_prefix}_Languages AS langTbl WHERE langTbl.`iso639_1`=?)";

            $sqlPlaceholders = [
                "{table_name}" => $this->getTableName(),
                "{model_name}" => $this->getClassname(),
                "{where_clause}" => $whereClause

            ];

            if($isUpdate) {
                $sqlPlaceholders["{translated_fields}"] = implode("=?, ",array_keys($fieldNamesToSave)).'=?';
            } else {
                $sqlPlaceholders["{translated_fields}"] = implode(", ",array_keys($fieldNamesToSave));
                //get an array of "?" placeholders, including one for the "lastUserModified" property
                $sqlPlaceholders["{placeholders}"] = '?, '.implode(", ",array_fill(0,count(array_keys($fieldNamesToSave)),"?") );
            }

            if(ModelBase::isDebug()) {
                error_log('Placeholders: '.print_r($sqlPlaceholders,true));
            }

            $sql = $sqlLoader->getSingleSqlFileStatement(($isUpdate ? "update_translation" : "insert_translation"), $sqlPlaceholders);

            try {
                if(!$alreadyInTransaction) {
                    $pdo->beginTransaction();
                }

                if(ModelBase::isDebug()){
                    error_log("sql: ".$sql);
                }

                $prepared = $pdo->prepare($sql);
                $dataValuesToSave = [$this->lastUserModified];
                foreach($fieldNamesToSave as $fieldName) {//copy all of the translated field values we intend to save
                    $dataValuesToSave[] = $this->$fieldName;
                }

                if(!$isUpdate) {
                    array_unshift($dataValuesToSave, $this->langCode);//if this is an insert, we also have to provide the language code (because the where clause isn't used above)
                }

                if($isUpdate) {
                    //add ID of this object at end for where clause for use in the "update_translations.sql"
                    $dataValuesToSave[] = $this->id;
                    $dataValuesToSave[] = $this->langCode;
                }

                if(ModelBase::isDebug()){
                    error_log("dataValuesToSave: ".print_r($dataValuesToSave,true));
                }

                $result->success = $prepared->execute($dataValuesToSave);
                if($result->success) {
                    if(!$isUpdate) {
                        if(ModelBase::isDebug()){
                            error_log("was an insert");
                        }
                    } else {
                        if(ModelBase::isDebug()){
                            error_log("was an update");
                        }
                    }
                } else {
                    if(ModelBase::isDebug()){
                        error_log("Not successful:".print_r($result,true));
                    }
                    $result->success = false;
                    $result->messages[] = "Error saving \"".$this->getClassname()."\":".print_r($result,true);
                }

                if(!$alreadyInTransaction) {
                    if ($result->success) {
                        $pdo->commit();
                    } else {
                        $pdo->rollback();
                    }
                }

                return $result;
            } catch(\PDOException $e){
                $result->success = false;
                $result->messages[] = "Error saving translation for \"".$this->getClassname()."\" PDOException:(".$e->getCode()."): [".$e->getMessage()."]";
                if(ModelBase::isDebug()){
                    error_log("PDOException:(".$e->getCode()."): [".$e->getMessage()."]");
                }

                if(!$alreadyInTransaction) {
                    $pdo->rollback();
                }
            }

            return $result;
        }

        //Deletes a translation for this model, from it's "_translations" table
        public function DeleteTranslation(string $langCode = "", PDOHelper $source = null, $alreadyInTransaction = false):bool {
            if(ModelBase::isDebug()){
                error_log("----------------------------- DeleteTranslation-{$langCode}:{$this->getClassname()} -----------------------------");
            }

            $success = false;

            if(empty($source) || !$this->isTranslatable() || !$this->idIsInteger() || (intval($this->id) <= 0) || empty($langCode)) {
                return $success;
            }

            $pdo = $source->getPDOConnection();
            $sqlLoader = $source->getSqlLoader();

            $sqlPlaceholders = [
                "{table_name}" => $this->getTableName(),
                "{model_name}" => $this->getClassname()
            ];

            $sql = $sqlLoader->getSingleSqlFileStatement("delete_translation", $sqlPlaceholders);

            $result = $source->executeSQL($sql,[$this->id, $langCode],!$alreadyInTransaction);

            $success = $result->success;

            return $success;
        }

        public function loadByID(PDOHelper $source = null, bool $includeSecureFields = false, array $fieldsToLoad = []):bool {
            if(ModelBase::isDebug()){
                error_log("----------------------------- loadByID:{$this->getClassname()} -----------------------------");
            }
            return $this->loadBy('id', $source, $includeSecureFields, $fieldsToLoad);
        }
        public function loadBy(string $fieldName = "", PDOHelper $source = null, bool $includeSecureFields = false, array $fieldsToLoad = []):bool {
            if(ModelBase::isDebug()){
                error_log("----------------------------- loadBy ({$fieldName}):{$this->getClassname()} -----------------------------");
            }
            $success = false;
            $props = $this->getProperties();

            if(empty($source) || empty($fieldName) || !in_array($fieldName,$props) || empty($this->$fieldName)) {
                return $success;
            }

            //ensure any passed in field names ACTUALLY are fields of this model
            $filteredFieldsToLoad = $this->filterInvalidFields($fieldsToLoad);
            if(empty($filteredFieldsToLoad)) {//if empty, load ALL fields
                $props = $this->getProperties(true);
                $filteredFieldsToLoad = $props;
            }

            if(!$includeSecureFields) {
                $filteredFieldsToLoad = $this->filterSecureFields($filteredFieldsToLoad);
            }

            $keyForCache = ModelCache::getModelKey($this, $fieldName, $filteredFieldsToLoad);
            $dataFromCache = ModelCache::getFromCache($keyForCache);
            if(!empty($dataFromCache)){
                if(ModelBase::isDebug()){
                    error_log("Loaded from cache. Cached object:".print_r($dataFromCache,true));
                }

                static::populateFromArray($this, $dataFromCache);
                return true;
            }

            $pdo = $source->getPDOConnection();
            $sqlLoader = $source->getSqlLoader();

            if(ModelBase::isDebug()){
                error_log("Field names to escape:".print_r($filteredFieldsToLoad,true));
            }

            $escapedFieldNames = static::filterExtraFields($filteredFieldsToLoad);
            $escapedFieldNames = SQLLoader::escapeFieldNameArray($escapedFieldNames);
            if(ModelBase::isDebug()){
                error_log("Escaped field names:".print_r($escapedFieldNames,true));
            }

            $sqlPlaceholders = [
                "{table_name}" => $this->getTableName(),
                "{model_name}" => $this->getClassname(),
                "{model_fields}" => empty($filteredFieldsToLoad) ? "*" : implode(',', $escapedFieldNames),
                "{where_clause}" => SQLLoader::escapeFieldName($fieldName)."=?",
                "{order_by}" => "id"
            ];

            $sql = $sqlLoader->getSingleSqlFileStatement("load", $sqlPlaceholders);

            if(ModelBase::isDebug()){
                error_log("sql: ".$sql);
            }

            try {
                $prepared = $pdo->prepare($sql);
                $success = $prepared->execute([$this->$fieldName]);
                if($success) {
                    $result = $prepared->fetch(\PDO::FETCH_ASSOC);
                    static::populateFromArray($this, $result);

                    $this->afterLoad($source, $filteredFieldsToLoad, $includeSecureFields);
                    ModelCache::putInCache($keyForCache, $result);
                }
            } catch(\PDOException $e){
                $success = false;
                if(ModelBase::isDebug()){
                    error_log("Exception when executing SQL:".$e->getMessage());
                }
            }

            return $success;
        }

        //used to load multiple objects at once, based on a field/condition
        public static function loadAllBy(PDOHelper $source, bool $includeSecureFields = false, array $fieldsToLoad = [], int $pageNum = 1, int $pageSize = 32, string $orderBy = "id", FieldCondition ...$conditions):DBResult {
            if(ModelBase::isDebug()){
                error_log("----------------------------- loadAllBy:" . self::getStaticClassname() . " -----------------------------");
            }
            $dbResult = new DBResult();

            $results = [];
            if(empty($source)) {
                $dbResult->addMessage("The database source was invalid.");
                return $dbResult;
            }

            if($pageNum < 1 || $pageSize < 0) {
                $dbResult->addMessage("The paging parameters were invalid. PageNum: $pageNum, PageSize: $pageSize.");
                return $dbResult;
            }

            if(ModelBase::isDebug()){
                error_log("Fields to load:".print_r($fieldsToLoad,true));
            }

            //ensure any passed in field names ACTUALLY are fields of this model
            $filteredFieldsToLoad = self::filterInvalidFields($fieldsToLoad);
            if(empty($filteredFieldsToLoad)) {//if empty, load ALL fields
                $props = self::getPropertiesStatic(true);
                $filteredFieldsToLoad = $props;
            }

            if(!$includeSecureFields) {
                $filteredFieldsToLoad = self::filterSecureFields($filteredFieldsToLoad);
            }

            $pdo = $source->getPDOConnection();
            $sqlLoader = $source->getSqlLoader();

            if(ModelBase::isDebug()){
                error_log("Field names to escape:".print_r($filteredFieldsToLoad,true));
            }

            $escapedFieldNames = static::filterExtraFields($filteredFieldsToLoad);
            $escapedFieldNames = SQLLoader::escapeFieldNameArray($escapedFieldNames);
            if(ModelBase::isDebug()){
                error_log("Escaped field names:".print_r($escapedFieldNames,true));
            }

            if(!FieldCondition::validateAll($conditions, true)) {
                //one of the conditions failed to validate
                $dbResult->addMessage("The conditions provided to \"loadAllBy\" were invalid.");
                return $dbResult;//just return the current result (to avoid a db hit on already invalid parameters)
            }
            $whereClause = FieldCondition::combineWhereClauses($conditions);

            //calculate page indices for wanted elements
            $minWantedElementNumber = ($pageSize * ($pageNum-1)) + 1;
            $maxWantedElementNumber = $pageSize * $pageNum;

            if(ModelBase::isDebug()){
                error_log("Calculated element indices for given parameters (pageNum:$pageNum, pageSize:$pageSize) - minWantedElementNumber:$minWantedElementNumber, minWantedElementNumber:$maxWantedElementNumber");
            }

            $sqlPlaceholders = [
                "{table_name}" => self::getTableNameStatic(),
                "{model_fields}" => implode(',', $escapedFieldNames),
                "{model_name}" => self::getStaticClassname(),
                "{where_clause}" => (empty($conditions)) ? "" : " WHERE ".$whereClause,
                "{order_by}"=>$orderBy,
                "{min_result_index}" => $minWantedElementNumber-1,//is an element number, we need an index (0 based)
                "{max_result_index}" => $maxWantedElementNumber-1,//is an element number, we need an index (0 based)
                "{max_results}" => ($pageSize === 0) ? 1000000000 : $pageSize//use 0 to signal ALL of the records after the index (a number is require here, so 1billion was simply chosen to be an arbitrarily large amount)
            ];

            $sql = $sqlLoader->getSingleSqlFileStatement("load_all", $sqlPlaceholders);

            if(ModelBase::isDebug() ){
                error_log("Sql:".print_r($sql,true));
            }

            try {
                $prepared = $pdo->prepare($sql);
                //all values to put in for placeholders
                $allValues = [];
                foreach ($conditions as $condition) {
                    $fieldValue = $condition->getFieldValue();
                    if(is_array($fieldValue)) {
                        $allValues = array_merge($allValues, UtilityFunctions::flatten($fieldValue));
                    } else {
                        $allValues[] = $fieldValue;
                    }
                }

                if(ModelBase::isDebug()) {
                    error_log("Data values provided to SQL:".print_r($allValues,true));
                }

                //duplicate the values, because we have TWO where clause placeholders in our SQL
                $success = $prepared->execute(array_merge($allValues,$allValues));

                if($success) {
                    $totalResults = 0;
                    $numberFetched = 0;
                    $firstRow = true;//used to get data fetched in the rows that is the same in every row, such as aggregate data
                    while ($result = $prepared->fetch(\PDO::FETCH_ASSOC)) {
                        $numberFetched++;
                        if($firstRow) {
                            $totalResults = $result['total'];
                            $firstRow = false;
                        }

                        $obj = new static();
                        self::populateFromArray($obj, $result);
                        $obj->afterLoad($source, $filteredFieldsToLoad, $includeSecureFields);
                        $results[] = $obj;
                    }

                    $dbResult->success = true;
                    $dbResult->result = [
                        "total" => $totalResults,
                        "number_fetched" => $numberFetched,
                        "page_size" => $pageSize,
                        "page" => $pageNum,
                        "results"=>$results
                    ];
                } else {
                    $dbResult->addMessage("The sql execution failed, but didn't throw an exception.");
                }
            } catch(\PDOException $e){
                if(ModelBase::isDebug()){
                    $msg = 'loadAllBy - Exception:' . print_r($e, true);
                    error_log($msg);
                    $dbResult->addMessage($msg);
                }
            }

            return $dbResult;
        }

        //A function to execute (and can be overridden in a base class, which should call this in the base class) after loading
        //This commonly is used to load fields that are FK or collections of data / format data to be used in code
        protected function afterLoad(PDOHelper $source,  array $fieldsToLoad = [], bool $includeSecureFields = false):bool {
            $this->addProperty('langCode', 'en');

            return $this->loadExtraFields($source, $includeSecureFields);
        }
        //Used to load extra fields after loading the main model, such as ones in a property
        //This is intended to be overridden in the sub class, so that logic can be implemented that does the actual loading
        protected function loadExtraFields(PDOHelper $source, bool $includeSecureFields = false):bool {return true;}

        //Used to insert multiple rows into the database for the given model
        public static function insertMultipleValues(PDOHelper $source, $fieldNamesToSave = [], $fieldValueCollectionsToSave = [], bool $alreadyInTransaction = false):DBResult {
            if(ModelBase::isDebug()){
                error_log("----------------------------- insertMultiple:".self::getStaticClassname()." -----------------------------");
            }
            $result = new DBResult();
            if(empty($source)) {
                $result->messages[] = "Source PDOHelper is invalid.";
                return $result;
            }

            $pdo = $source->getPDOConnection();
            $sqlLoader = $source->getSqlLoader();
            $fieldNamesToSave = (empty($fieldNamesToSave) ? static::getPropertiesStatic() : $fieldNamesToSave);

            //don't save certain properties of the base class, as they have "defaults"
            $fieldsToDefault = self::geFieldNamesToDefault();

            //filter these based on props we want to save (passed in, or defaulted to all model properties)
            $fieldNamesToSave = array_filter($fieldNamesToSave, function($fieldName) use ($fieldsToDefault) {
                return !in_array($fieldName, $fieldsToDefault) && ($fieldName !== "id"); //we don't care about the id here, as we are inserting new records
            });

            $filteredFields = static::filterInvalidFields($fieldNamesToSave);
            $escapedFieldNames = SQLLoader::escapeFieldNameArray($filteredFields);
            if(ModelBase::isDebug()){
                error_log("Escaped field names:".print_r($escapedFieldNames,true));
            }

            //formatPlaceholders EG: (?,?), (?,?)
            $formattedPlaceholdersStr = [];
            $isArrayOfStr = false;
            $valuesToSaveCountMismatch = false;

            foreach($fieldValueCollectionsToSave as &$values) {
                if(is_array($values)) {
                    //reorder array based on key/field names
                    $values = array_replace(array_flip($filteredFields), $values);

                    $valuesToSaveCountMismatch = (count($values) !== count($escapedFieldNames));
                    $formattedPlaceholdersStr[] = "(now(), now(), ".implode(", ",array_fill(0,count($values),"?") ).")";
                } else {
                    //reorder array based on key/field names
                    $fieldValueCollectionsToSave = array_replace(array_flip($filteredFields), $fieldValueCollectionsToSave);

                    $isArrayOfStr = true;
                    $valuesToSaveCountMismatch = (count($fieldValueCollectionsToSave) !== count($escapedFieldNames));
                    $formattedPlaceholdersStr = "(now(), now(), ".implode(", ",array_fill(0,count($fieldValueCollectionsToSave),"?") ).")";
                    break;
                }

                if($valuesToSaveCountMismatch) {
                    break;
                }
            }

            if($valuesToSaveCountMismatch) {
                $result->addMessage("There is a different number of provided values compared to the given field names.");
                return $result;
            }

            if(!$isArrayOfStr) {//was an array of collections of values
                $formattedPlaceholdersStr = implode(",",$formattedPlaceholdersStr);
            }

            $sqlPlaceholders = [
                "{table_name}" => self::getTableNameStatic(),
                "{model_name}" => self::getStaticClassname(),
                "{model_properties}" => implode(',', $escapedFieldNames),
                "{placeholders}" => $formattedPlaceholdersStr
            ];

            //this SQL ignores duplicate entries constraints (it follows them, and doesn't duplicate records, just doesn't generate errors/warnings)
            $sql = $sqlLoader->getSingleSqlFileStatement("insert_multiple", $sqlPlaceholders);

            try {
                if(!$alreadyInTransaction) {
                    $pdo->beginTransaction();
                }

                if(ModelBase::isDebug()){
                    error_log("sql: ".$sql);
                }

                $prepared = $pdo->prepare($sql);
                $flattenedValues = UtilityFunctions::flatten($fieldValueCollectionsToSave);
                $result->success = $prepared->execute($flattenedValues);
                if($result->success) {

                } else {
                    if(ModelBase::isDebug()){
                        error_log("Not successful:".print_r($result,true));
                    }
                    $result->success = false;
                    $result->messages[] = "Error saving \"".self::getStaticClassname()."\":".print_r($result,true);
                }

                if(!$alreadyInTransaction) {
                    if ($result->success) {
                        $pdo->commit();
                    } else {
                        $pdo->rollback();
                    }
                }

                return $result;
            } catch(\PDOException $e){
                $result->success = false;
                $result->messages[] = "Error saving \"".self::getStaticClassname()."\" PDOException:(".$e->getCode()."): [".$e->getMessage()."]";
                if(ModelBase::isDebug()){
                    error_log("PDOException:(".$e->getCode()."): [".$e->getMessage()."]");
                }

                if(!$alreadyInTransaction) {
                    $pdo->rollback();
                }
            }

            return $result;
        }

        public function save(PDOHelper $source, $fieldNamesToSave = [], bool $alreadyInTransaction = false, bool $defaultEmptyValues = true):DBResult {
            if(ModelBase::isDebug()){
                error_log("----------------------------- save:{$this->getClassname()} -----------------------------");
            }

            $result = new DBResult();
            $modelBaseName = ModelBase::class;
            $referencableName = Referencable::class;

            if(empty($source)) {
                $result->messages[] = "Source PDOHelper is invalid.";
                return $result;
            }

            $pdo = $source->getPDOConnection();
            $sqlLoader = $source->getSqlLoader();

            //don't save properties of the base class, as they have "defaults"
            $fieldsToDefault = array_keys(get_class_vars(__CLASS__));

            $isUpdate = $this->idIsInteger() && (intval($this->id) > 0);
            if(ModelBase::isDebug()){
                error_log("save - isUpdate:" . $isUpdate);
            }

            $props = $this->getProperties();

            //remove any prop names included in the parameter array that are NOT valid for this object
            if(!empty($fieldNamesToSave) && $isUpdate) {
                $fieldNamesToSave = array_intersect($props, $fieldNamesToSave);
            } else {
                $fieldNamesToSave = $props;
            }

            $sqlPlaceholders = [
                "{table_name}" => $this->getTableName(),
                "{model_name}" => $this->getClassname(),
                "{where_clause}" => $isUpdate ? SQLLoader::escapeFieldName("id")."=?" : ""
            ];

            //use current fields and values to save
            $dataToSave = $this->getPropertiesAndValues();

            //filter these based on props we want to save (passed in, or defaulted to all model properties)
            $dataToSave = array_filter($dataToSave, function($key) use ($fieldNamesToSave, $fieldsToDefault) {
                //for each property in our model, only include it to be saved if it's in our "propNamesToSave" array AND not a "reserved" field we should default
                return in_array($key,$fieldNamesToSave) && !in_array($key, $fieldsToDefault);
            }, ARRAY_FILTER_USE_KEY);

            if(ModelBase::isDebug()) {
                error_log('$dataToSave before defaulting empty:'.print_r($dataToSave,true) );
            }

            //conditionally remove empty values to save (as they will be defaulted when saving)
            if($defaultEmptyValues){
                $that = $this;
                $dataToSave = array_filter($dataToSave, function($key) use ($that) {
                    $set = isset($that->$key);
                    $empty = empty($that->$key);
                    $hasValue = (empty($that->$key) || is_string($that->$key) || is_bool($that->$key) || is_numeric($that->$key)) && $that->$key !== NULL;

                    //for each property in our model, remove it from "dataToSave" if it's empty
                    return $set && (!$empty || $hasValue);
                }, ARRAY_FILTER_USE_KEY);
            }

            if(ModelBase::isDebug()) {
                error_log('$dataToSave after defaulting empty:'.print_r($dataToSave,true) );
            }

            //now ensure every data VALUE is formatted to be saved
            //EG: a field is an instance of a ModelBase subclass, then we want to fetch it's id to save instead (a foreign key from this model to that model)
            foreach ($dataToSave as $name => &$value) {
                $fieldSet = isset($value);
                $fieldEmpty = empty($value);
                $hasValue = is_string($value) || is_bool($value) || is_numeric($value) || $value === NULL;

                if((!$fieldSet || $fieldEmpty) && !$hasValue) {
                    if(ModelBase::isDebug()){
                        error_log($name . ' - set: "' . $fieldSet . '" - empty: "' . $fieldEmpty . '" - hasValue: "' . $hasValue . '" - value:"' . print_r($value, true) . '" - type: "' . gettype($value) . '"');
                    }

                    $result->messages[] = "The field \"" . $name . "\" is not present.";
                    return $result;//currently false
                } else if(($value instanceof $modelBaseName) && !($value instanceof $referencableName)) {
                    $value = $value->id;
                } else if($value instanceof $referencableName) {
                    $value = $value->getDataForReference();
                } else if(!$hasValue ) {
                    $result->messages[] = "The field \"".$name."\" value wasn't a \"basic\" data type that can be saved.";
                    return $result;//currently false
                }
            }

            if(ModelBase::isDebug()) {
                error_log('$dataToSave after formatting values to save: '.print_r($dataToSave,true));
            }

            if($isUpdate) {
                $sqlPlaceholders["{model_properties}"] = implode("=?, ",array_keys($dataToSave)).'=?';
            } else {
                $sqlPlaceholders["{model_properties}"] = implode(", ",array_keys($dataToSave));
                //get an array of "?" placeholders, including two for the "lastUserModified" and "langCode" properties
                $sqlPlaceholders["{placeholders}"] = '?, '.implode(", ",array_fill(0,count(array_keys($dataToSave)),"?") );
            }

            if(ModelBase::isDebug()) {
                error_log('Placeholders: '.print_r($sqlPlaceholders,true));
            }

            $sql = $sqlLoader->getSingleSqlFileStatement(($isUpdate ? "update" : "insert"), $sqlPlaceholders);

            try {
                if(!$alreadyInTransaction) {
                    $pdo->beginTransaction();
                }

                if(ModelBase::isDebug()){
                    error_log("sql: ".$sql);
                }

                $prepared = $pdo->prepare($sql);
                $dataValuesToSave = array_values($dataToSave);

                if(ModelBase::isDebug()){
                    error_log("dataToSave: ".print_r($dataToSave,true));
                }

                if($isUpdate) {
                    //add ID of this object at end for where clause for use in the "update.sql"
                    $dataValuesToSave[] = $this->id;
                }

                //prepare any extra fields we should save for this object (that are defined in ModelBase)
                $dataValuesToSave = array_merge($this->prepareBaseFieldsToSave(), $dataValuesToSave);

                if(ModelBase::isDebug()){
                    error_log("dataValuesToSave: ".print_r($dataValuesToSave,true));
                }

                $result->success = $prepared->execute($dataValuesToSave);
                if($result->success) {
                    if(!$isUpdate) {
                        if(ModelBase::isDebug()){
                            error_log("was an insert");
                        }

                        $newID = $pdo->lastInsertId();
                        $this->id = $newID;
                    } else {
                        if(ModelBase::isDebug()){
                            error_log("was an update");
                        }
                    }
                } else {
                    if(ModelBase::isDebug()){
                        error_log("Not successful:".print_r($result,true));
                    }
                    $result->success = false;
                    $result->messages[] = "Error saving \"".$this->getClassname()."\":".print_r($result,true);
                }

                if(!$alreadyInTransaction) {
                    if ($result->success) {
                        $pdo->commit();
                    } else {
                        $pdo->rollback();
                    }
                }

                if($result->success) {//after all logic, commits, etc
                    $this->afterSave($source, $alreadyInTransaction);
                }

                return $result;
            } catch(\PDOException $e){
                $result->success = false;
                $result->messages[] = "Error saving \"".$this->getClassname()."\" PDOException:(".$e->getCode()."): [".$e->getMessage()."]";
                if(ModelBase::isDebug()){
                    error_log("PDOException:(".$e->getCode()."): [".$e->getMessage()."]");
                }

                if(!$alreadyInTransaction) {
                    $pdo->rollback();
                }
            }

            return $result;
        }

        public static function saveMultiple(array $array = [], array $commonFieldValues = [], PDOHelper $source= null, array $propNamesToSave = [], bool $alreadyInTransaction = false) {
            if(ModelBase::isDebug()){
                error_log("----------------------------- saveMultiple:".static::getStaticClassname()." -----------------------------");
            }
            $result = new DBResult();

            $saved = [];
            $modelBaseName = ModelBase::class;

            foreach($array as $itemToSave) {
                if($itemToSave instanceof $modelBaseName) {
                    self::populateFromArray($itemToSave, $commonFieldValues);

                    $saveResult = $itemToSave->save($source, $propNamesToSave, $alreadyInTransaction);
                    if($saveResult->success) {
                        $saved[] = $itemToSave;
                    } else {
                        $result->messages = array_merge($result->messages, $saveResult->messages);
                    }
                } else if(is_array($itemToSave)){
                    //is an array of fields and values
                    //represents a field of the object to save
                    $newObj = new static();
                    self::populateFromArray($newObj, array_merge($itemToSave, $commonFieldValues));

                    $saveResult = $newObj->save($source, $propNamesToSave, $alreadyInTransaction);
                    if($saveResult->success) {
                        $saved[] = $newObj;
                    } else {
                        $result->messages = array_merge($result->messages, $saveResult->messages);
                    }
                } else {
                    $result->messages[] = "The element \"".print_r($itemToSave,true)."\" was not an ID or ModelBase object.";
                }
            }//foreach element in array to save

            $result->success = (count($array) === count($saved)) && (count($saved)>0);

            $result->result = $saved;
            return $result;
        }
        //A function to be called after saving a model, or overriden in a base class, to save extra fields, such as many-to-many models or other data not saved in the normal save method for the model
        protected function afterSave(PDOHelper $source, bool $alreadyInTransaction = false){$this->saveExtraFields($source,$alreadyInTransaction);}
        //A function that is to be overridden in a sub class, which has logic that saves the extra fields for a model object, that aren't part of the main properties persisted to the database.
        //Can be used for convenience to load complex objects, with extra fields, but NOT persist those to the database
        protected function saveExtraFields(PDOHelper $source, bool $alreadyInTransaction = false):bool {return true;}

        /** Saves a list of many-to-many references of this class type.
         *
         * **NOTE:** In the context of this method, a "many-to-many" model has a "from" and a "to" reference, connecting one model/record (from) to another (to).
         *
         * @param $source PDOHelper The data source
         * @param $itemsToSave array The items to save. This can either be the instance of the many-to-many model, OR instances (or an array of IDs) of the "other end" that this model links to
         * @param $commonFieldValues array An array of fieldnames and values to set for each "many-to-many" model saved. this generally includes the "from" model record ID
         * @param $alreadyInTransaction bool Whether this operation is already wrapped in a transaction or not (if not, one will be used for this save)
         *
         * @return DBResult The result of saving (with all relevant error messages and saved models in the "result" field)
         *
         * */
        public static function saveManyToManyModel(PDOHelper $source, array $itemsToSave = null, array $commonFieldValues = [], bool $alreadyInTransaction = false):DBResult {
            if(ModelBase::isDebug()){
                error_log("----------------------------- saveManyToManyModel:".self::getStaticClassname()." -----------------------------");
            }

            $result = new DBResult();
            $result->success = true;
            $result->result = [];

            $currentClassIsManyToMany = is_a(static::class, ManyToMany::class, true);

            if($currentClassIsManyToMany){
                if(!empty($itemsToSave)){
                    $saveResult = new DBResult();

                    //ensure all items to save are ints (if it contains integer strings)
                    $itemsToSave = array_map(function($n){return (is_string($n) && ctype_digit($n)) ? intval($n, 10) : $n; }, $itemsToSave);

                    $arrayOfModels = self::arrayOfClassType($itemsToSave, ModelBase::class);
                    $arrayOfManyToMany = self::arrayOfClassType($itemsToSave, ManyToMany::class);
                    $allInts = ModelBase::all($itemsToSave, 'is_int');

                    if($arrayOfManyToMany){
                        if(ModelBase::isDebug()){
                            error_log("Array of \"ManyToMany\"");
                        }

                        $saveResult = static::saveMultiple($itemsToSave, $commonFieldValues, $source, [], $alreadyInTransaction);
                    } else if($allInts || $arrayOfModels){//must be the "other" end of a many-to-many model (or IDs)
                        if(ModelBase::isDebug()){
                            error_log("Array of \"BaseModel\" or integers.");
                        }

                        //format array as new array
                        $arrayToSave = [];
                        foreach($itemsToSave as $item){
                            $valueForOtherEnd = $arrayOfModels ? $item->id : $item;
                            $arrayToSave[] = [static::getToFieldName() => $valueForOtherEnd];
                        }

                        $saveResult = static::saveMultiple($arrayToSave, $commonFieldValues, $source, [], $alreadyInTransaction);
                    } else {
                        if(ModelBase::isDebug()){
                            error_log("Unable to determine how to save Many-To-Many values for \"".self::getStaticClassname()."\". Many-to-many values to save:".print_r($itemsToSave,true));
                        }
                    }

                    if(!$saveResult->success){
                        if(ModelBase::isDebug()){
                            error_log("Many to many models did not all successfully save for \"".self::getStaticClassname()."\":".print_r($saveResult->messages, true));
                        }
                    }

                    $result->result = $saveResult->result;
                }
            } else {
                $result->success = false;
                $result->messages[] = 'The current class "'.self::getStaticClassname().'" does not implement the "ManyToMany" interface.';
            }

            return $result;
        }

        public function deleteByID(PDOHelper $source, $alreadyInTransaction = false):bool {
            if(ModelBase::isDebug()){
                error_log("----------------------------- deleteByID:{$this->getClassname()} -----------------------------");
            }

            return $this->deleteBy('id', $source, $alreadyInTransaction);
        }
        public function deleteBy(string $fieldName, PDOHelper $source, $alreadyInTransaction = false):bool {
            if(ModelBase::isDebug()){
                error_log("----------------------------- deleteBy{$fieldName}:{$this->getClassname()} -----------------------------");
            }

            $success = false;
            $props = $this->getProperties();

            if(empty($source) || empty($fieldName) || !in_array($fieldName,$props) || empty($this->$fieldName)) {
                return $success;
            }

            $pdo = $source->getPDOConnection();
            $sqlLoader = $source->getSqlLoader();

            $sqlPlaceholders = [
                "{table_name}" => $this->getTableName(),
                "{model_name}" => $this->getClassname(),
                "{where_clause}" => SQLLoader::escapeFieldName($fieldName)."=?"
            ];

            $sql = $sqlLoader->getSingleSqlFileStatement("delete", $sqlPlaceholders);

            $result = $source->executeSQL($sql,[$this->$fieldName],!$alreadyInTransaction);

            $success = $result->success;

            return $success;
        }

        public static function deleteByMultiple(PDOHelper $source, $alreadyInTransaction = false, FieldCondition ...$conditions):DBResult {
            if(ModelBase::isDebug()){
                error_log("----------------------------- deleteByMultiple:".static::getStaticClassname()." -----------------------------");
            }

            $dbResult = new DBResult();
            $fieldsValues = FieldCondition::getFieldsAndValuesOfConditions($conditions);
            $values = array_values($fieldsValues);

            //ensure any passed in field names ACTUALLY are fields of this model
            $filteredFieldsToDeleteBy = self::filterInvalidFields(array_keys($fieldsValues) );

            if(empty($source)) {
                $dbResult->addMessage("The database source was invalid.");
                return $dbResult;
            }

            if(empty($filteredFieldsToDeleteBy)) {
                $dbResult->addMessage("The filtered fields were invalid.");
                return $dbResult;
            }

            if(empty($values) || FieldCondition::anyFieldValuesEmpty($conditions)) {
                $dbResult->addMessage("The field values provided were invalid.");
                return $dbResult;
            }

            $sqlLoader = $source->getSqlLoader();

            if(!FieldCondition::validateAll($conditions, true)) {
                //one of the conditions failed to validate
                $dbResult->addMessage("The conditions provided to \"deleteByMultiple\" were invalid.");
                return $dbResult;//just return the current result (to avoid a db hit on already invalid parameters)
            }
            $whereClause = FieldCondition::combineWhereClauses($conditions);

            if(ModelBase::isDebug()) {
                error_log("where clause:".print_r($whereClause, true));
            }

            if(empty($whereClause)) {
                $dbResult->addMessage("The generated where clause was empty.");
                return $dbResult;
            }

            $sqlPlaceholders = [
                "{table_name}" => self::getTableNameStatic(),
                "{model_name}" => self::getStaticClassname(),
                "{where_clause}" => $whereClause
            ];

            $sql = $sqlLoader->getSingleSqlFileStatement("delete", $sqlPlaceholders);
            if(ModelBase::isDebug()) {
                error_log("sql:".$sql);
            }

            $executeResult = $source->executeSQL($sql,$values,!$alreadyInTransaction);
            if($executeResult->success) {
                $dbResult->success = true;
            } else {
                $dbResult->addMessage("There was an error executing the delete.");
                if(ModelBase::isDebug()) {
                    $dbResult->combine($executeResult);
                }
            }

            return $dbResult;
        }

        //used to prepare fields of ModelBase, that are to be saved, but aren't handled by subclasses
        //This is to convert fields of an object, to values that are fed to PDO's "execute" as parameters of a prepared statement
        protected function prepareBaseFieldsToSave():array {
            static $modelBaseName = ModelBase::class;
            static $referencableName = Referencable::class;

            $fieldsToPrepare = self::getBaseFieldNames();

            $preparedFields = [];
            foreach ($fieldsToPrepare as $field) {
                if(ModelBase::isDebug()) {
                    error_log('field:'.print_r($field,true) );
                }
                $fieldValue = null;

                if(!isset($this->$field)) {
                    //field not set, don't do anything right now
                    if(ModelBase::isDebug()) {
                        error_log('Field not set.' );
                    }
                } else if(empty($this->$field)){
                    //field empty, just copy it
                    $fieldValue = $this->$field;
                    if(ModelBase::isDebug()) {
                        error_log('Field empty.' );
                    }
                }else if(($this->$field instanceof $modelBaseName) && !($this->$field instanceof $referencableName)) {
                    $fieldValue = $this->$field->id;
                    if(ModelBase::isDebug()) {
                        error_log('Field instance of ModelBase (and does not have the interface Referencable)' );
                    }
                } else if($this->$field instanceof $referencableName) {
                    $fieldValue = $this->$field->getDataForReference();
                    if(ModelBase::isDebug()) {
                        error_log('Field has the interface Referencable' );
                    }
                } else if(!is_numeric($this->$field) && !is_bool($this->$field) && !is_string($this->$field)) {
                    //field isn't a "basic" type, don't do anything right now
                    if(ModelBase::isDebug()) {
                        error_log('Field is NOT numeric, a boolean, or a string.' );
                    }
                } else {
                    $fieldValue = $this->$field;
                    if(ModelBase::isDebug()) {
                        error_log('Field was not recognized, so nothing done with it. It\'s info is:'.var_export($field, true) );
                    }
                }
                $preparedFields[] = $fieldValue;
            }

            if(ModelBase::isDebug()) {
                error_log('preparedBaseFields:'.print_r($preparedFields,true));
            }
            return $preparedFields;
        }

        //Using an associative array, this object can be instantiated, and "filled in" from the array
        public static function populateFromArray(ModelBase $instance, array $arr = []) {
            if(!empty($instance) && !empty($arr)) {
                $props = $instance->getProperties();
                foreach ($arr as $key => $value) {
                    if(in_array($key, $props)) {
                        $instance->{$key} = $value;
                    }
                }
            }
        }

        /**
         * Checks if an array of data/objects is ALL one type, given by a string.
         * This uses PHP's instanceof function, so fully qualify the class name with the namespace
         *
         * @param array $array The array to check
         * @param string $class The class name
         * @return bool Whether the array contained ONLY objects of the given class name, as a string
         */
        public static function arrayOfClassType(array $array, string $class):bool {
            $classToCheck = empty($class) ? self::getStaticClassname() : $class;
            $arrayOnlyHasThisClass = false;

            foreach($array as $item) {
                $arrayOnlyHasThisClass = $item instanceof $classToCheck;
                if(!$arrayOnlyHasThisClass) {
                    break;
                }
            }

            return $arrayOnlyHasThisClass;
        }

        /**
         * Uses a PDOHelper database source object, to get the setup SQL for the models.
         *
         * <b>This will get ALL models, so if you have multiple databases, you might need to customize this method to accept extra parameters to filter/limit what models get returned</b>
         *
         * @param PDOHelper $source
         * @return array The resulting SQL for models, used to setup the database.
         */
        public static function getAllModelSetupSQL(PDOHelper $source):array {
            $sqlLoader = $source->getSqlLoader();
            $sql = [];
            $models = ModelBase::getAllModelClassNames();

            foreach ($models as $modelName) {
                $sql['table'][] = $sqlLoader->getSingleSqlFileStatement('table',[],'Models'.DIRECTORY_SEPARATOR.$modelName);

                if(is_a(__NAMESPACE__.'\\'.$modelName, __NAMESPACE__.'\Translation\Translatable', true)) {
                    $sql['table_translations'][] = $sqlLoader->getSingleSqlFileStatement('translation_table', [], 'Models' . DIRECTORY_SEPARATOR . $modelName);
                }
            }

            return $sql;
        }

        public static function getAllModelClassNames():array {
            //get all model class files
            $modelClassesDir = ModelBase::getModelClassesDir();

            $models = glob($modelClassesDir);
            //get JUST the names
            $models = array_map(function ($v) {
                return basename($v, '.php');
            }, $models);

            return $models;
        }

        public static function getAllModelTables(PDOHelper $source):array {
            $sqlLoader = $source->getSqlLoader();
            static $tables = [];

            if(empty($tables)) {
                $models = ModelBase::getAllModelClassNames();
                if(ModelBase::isDebug()) {
                    error_log('getAllModelTables-'.print_r($models,true));
                }

                foreach ($models as $modelName) {
                    $qualifiedModelName = __NAMESPACE__.'\\'.$modelName;

                    if (is_a($qualifiedModelName, static::getFullStaticClassname(), true)) {
                        //now, based on a model name, get it's static reference, and call "getTableNameStatic"
                        $modelTable = $sqlLoader->getTablePrefix() . call_user_func(array($qualifiedModelName, 'getTableNameStatic') );
                        $tables[] = $modelTable;

                        if (is_a(__NAMESPACE__.'\\'.$modelName, __NAMESPACE__.'\Translation\Translatable', true)) {
                            $tables[] = $modelTable . '_translations';

                            if(ModelBase::isDebug()) {
                                error_log('getAllModelTables - The model name of "'.$modelName.'" is Translatable.');
                            }
                        }
                    } else {
                        if(ModelBase::isDebug()) {
                            error_log('getAllModelTables - The model name of "'.$modelName.'" is not a ModelBase.');
                        }
                    }
                }
            }

            return $tables;
        }

        public static function dropAllModelTables(PDOHelper $source):DBResult {
            $tables = ModelBase::getAllModelTables($source);
            $dropSQL = $source->getSqlLoader()->getDropTableSQL($tables, false);

            if(ModelBase::isDebug()) {
                error_log('dropAllModelTables-sql:' . print_r($dropSQL, true));
            }

            $source->disableForeignKeyChecks();
            $dbResult =  $source->executeAllSqlInArray($dropSQL);
            $source->enableForeignKeyChecks();

            return $dbResult;
        }

        public static function count(PDOHelper $source = null, FieldCondition ...$conditions):DBResult {
            if(ModelBase::isDebug()){
                error_log("----------------------------- count:".self::getStaticClassname()." -----------------------------");
            }
            $dbResult = new DBResult();

            if(empty($source)) {
                $dbResult->addMessage("The data source is invalid.");
                return $dbResult;
            }

            $pdo = $source->getPDOConnection();
            $sqlLoader = $source->getSqlLoader();

            if(!FieldCondition::validateAll($conditions, true)) {
                //one of the conditions failed to validate
                $dbResult->addMessage("The conditions provided to \"count\" were invalid.");
                return $dbResult;//just return the current result (to avoid a db hit on already invalid parameters)
            }
            $whereClause = FieldCondition::combineWhereClauses($conditions);

            $sqlPlaceholders = [
                "{table_name}" => self::getTableNameStatic(),
                "{model_name}" => self::getStaticClassname(),
                "{where_clause}" => (empty($conditions)) ? "" : " WHERE ".$whereClause
            ];

            $sql = $sqlLoader->getSingleSqlFileStatement("count", $sqlPlaceholders);

            if(ModelBase::isDebug()){
                error_log("sql: ".$sql);
            }

            try {
                $prepared = $pdo->prepare($sql);
                $success = $prepared->execute(FieldCondition::getValuesOfConditions($conditions) );
                if($success) {
                    $IDs = [];
                    $count = 0;
                    $firstRow = true;
                    while ($result = $prepared->fetch(\PDO::FETCH_ASSOC)) {
                        if($firstRow) {
                            $count = $result['count'];
                            $firstRow = false;
                        }

                        $IDs[] = $result['id'];
                    }

                    $dbResult->result = [
                        "count" => $count,
                        "ids" => $IDs
                    ];
                    $dbResult->success = true;
                }
            } catch(\PDOException $e){
                $dbResult->addMessage("An error occurred while fetching the counts:".$e->getMessage());
            }

            return $dbResult;
        }

        /**
         * Tell whether all members of $array and validate with the $predicate.
         *
         * @param $array array The array to check
         * @param $predicate string The function to invoke (via array_filter)
         * @return bool Whether every element in the array passes the test function
         */
        public static function all(array $array, string $predicate):bool {
            return array_filter($array, $predicate) === $array;
        }

        /**
         * Tell whether any member of $array and validates with the $predicate.
         *
         * @param $array array The array to check
         * @param $predicate string The function to invoke (via array_filter)
         * @return bool Whether ANY element in the array passes the test function
         */
        public static function any(array $array, string $predicate):bool {
            return array_filter($array, $predicate) !== array();
        }

        public function jsonSerialize():array {
            if(ModelBase::isDebug()){
                error_log("----------------------------- jsonSerialize:".$this->getClassname()." -----------------------------");
                error_log('_serializeAllProperties:'.print_r($this->_serializeAllProperties,true));
                error_log('_fieldsToSerialize:'.print_r($this->_fieldsToSerialize,true));
            }

            return $this->getPropertiesAndValues($this->_serializeAllProperties, $this->_fieldsToSerialize);

        }

        public function toArray():array {
            $arrayResult = array();

            foreach ($this as $key => $value) {
                if(is_object($value))
                    $arrayResult[$key] = $value->toArray();
                else if(is_array($value)) {
                    //handle an array of objects, 1 level deep
                    $arrayMember = array();
                    foreach ($value as $k => $v) {
                        if(is_object($v))
                            $arrayMember[$k] = $v->toArray();
                        else
                            $arrayMember[$k] = $v;
                    }
                    $arrayResult[$key] = $arrayMember;
                } else
                    $arrayResult[$key] = $value;
            }

            return $arrayResult;
        }

    }
}