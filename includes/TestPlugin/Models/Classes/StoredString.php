<?php
namespace TestPlugin\Models {
    use TestPlugin\DBResult;
    use TestPlugin\PDOHelper;
    use TestPlugin\SQLLoader;

    /**
     * Class StoredString
     * A class that represents text that can be stored in the database and referenced later. This is used to reduce redundant string storing
     * @package TestPlugin\Models
     */
    class StoredString extends ModelBase {
        public $storedtext;

        public function __construct() {
            parent::__construct();

        }

        /**
         * Delete the StoredStrings that don't have references to them, in order to keep the database cleaner
         *
         * @param PDOHelper $source The data source
         * @param bool $alreadyInTransaction Whether this operation is already in a transaction
         *
         * @return DBResult A result object that is the result of deleting
         */
        public static function deleteUnused(PDOHelper $source, $alreadyInTransaction = false):DBResult {
            if(ModelBase::isDebug()){
                error_log("----------------------------- deleteUnused:".self::getStaticClassname()." -----------------------------");
            }

            $dbResult = new DBResult();

            if(empty($source)) {
                $dbResult->addMessage("The database source was invalid.");
                return $dbResult;
            }

            $sqlLoader = $source->getSqlLoader();
            // The SQL specified here is incomplete, as it has commented out sub-queries, as no Models currently have foreign keys to a StoredString
            $sql = $sqlLoader->getSingleSqlFileStatement("delete_unused", [], 'Models'.DIRECTORY_SEPARATOR.'StoredString');
            $result = $source->executeSQL($sql,[],!$alreadyInTransaction);

            if($result->success) {
                $dbResult->success = true;
                $numberRemoved = $result->result;
                $dbResult->result = $numberRemoved;
            } else {
                $dbResult->addMessage("Deleting unused StoredStrings was not successful.");
                if(ModelBase::isDebug()) {
                    $msg = $result->getMessages(true);
                    $dbResult->addMessage($msg);
                    error_log("Deleting unused StoredStrings was not successful.");
                    error_log($msg);
                }
            }

            return $dbResult;
        }
    }
}