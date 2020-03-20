<?php
namespace TestPlugin {
    use TestPlugin\PDOConnectionInfo;
    use TestPlugin\SQLLoader;
    use TestPlugin\DBResult;
    use PDO;

    /**
     * Class PDOHelper A class to be used with PDO, to include comon functionality and make certain calls easy
     * @package TestPlugin
     */
    class PDOHelper {
        private $info;
        private $pdo = NULL;
        private $sqlLoader;

        /**
         * Get the SQLLoader object that is associated with the database. This is commonly done because a database could have common table prefixes or other settings.
         *
         * @return \TestPlugin\SQLLoader The SQLLoader associated with this database
         */
        public function getSqlLoader():SQLLoader {return $this->sqlLoader;}

        private static $isDebug = false;
        public static function enableDebug() {PDOHelper::$isDebug = true;}
        public static function disableDebug() {PDOHelper::$isDebug = false;}
        public static function isDebug():bool {return PDOHelper::$isDebug;}

        public function __construct(PDOConnectionInfo $info, SQLLoader $loader) {
            $this->info = $info;
            $this->sqlLoader = $loader;
        }

        /**
         * Get the database information
         *
         * @return string The database name and host
         */
        public function getDBEndpoint():string {
            return $this->info->database."@".$this->info->host;
        }

        public function connect() {
            if(isset($this->info) && !empty($this->info) && $this->info->verify()) {
                //default to these options
                $options = [
                    \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                    \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                    \PDO::ATTR_EMULATE_PREPARES => false,
                    \PDO::ATTR_AUTOCOMMIT => true
                ];
                $dsn = $this->info->makeMySQL_DSN();
                try {
                    $this->pdo = new \PDO($dsn, $this->info->user, $this->info->pass, $options);
                } catch (\PDOException $e) {
                    throw new \PDOException($e->getMessage(), (int)$e->getCode());
                }
            } else {
                throw new \PDOException("Unable to connect to database \"{$this->info->database}\" at \"{$this->info->host}\".", 500);
            }
        }

        public function isConnected():bool {
            try {
                if(is_null($this->pdo)) {
                    $this->connect();
                }

                return ((bool) $this->pdo->query('SELECT 1+1') );
            } catch (\PDOException $e) {
                return false;
            }
        }

        public function closeConnection(){
            $this->pdo = NULL;
        }

        public function getPDOConnection():?\PDO {
            if(isset($this->pdo) && !empty($this->pdo)) {
                return $this->pdo;
            } else {
                return NULL;
            }
        }

        public function disableForeignKeyChecks() {
            try {
                if(!is_null($this->pdo)){
                    $this->pdo->query('SET FOREIGN_KEY_CHECKS = 0;');
                    return true;
                } else {
                    return false;
                }
            } catch (\PDOException $e) {
                return false;
            }
        }

        public function enableForeignKeyChecks() {
            try {
                if(!is_null($this->pdo)){
                    $this->pdo->query('SET FOREIGN_KEY_CHECKS = 1;');
                    return true;
                } else {
                    return false;
                }
            } catch (\PDOException $e) {
                return false;
            }
        }

        public function setEmulatePrepares(bool $val) {
            $this->pdo->setAttribute(\PDO::ATTR_EMULATE_PREPARES, $val);
        }

        public function setAutoCommit(bool $val) {
            $this->pdo->setAttribute(\PDO::ATTR_AUTOCOMMIT, $val);
        }

        public function tableExists($tableName):bool {
            try {
                if(is_null($this->pdo)) {
                    return false;
                }
                $sql = 'SELECT 1 
                    FROM information_schema.tables
                    WHERE table_schema=? 
                    AND table_name=?
                    LIMIT 1;';
                $prepared = $this->pdo->prepare($sql);
                return $prepared->execute([$this->info->database, $tableName]);
            } catch (\PDOException $e) {
                return false;
            }
        }

        public function getAllTables():array {
            try {
                if(is_null($this->pdo)) {
                    return [];
                }
                $sql = 'SHOW TABLES LIKE \'%s\';';
                $prepared = $this->pdo->prepare($sql);
                return $prepared->execute();
            } catch (\PDOException $e) {
                return [];
            }
        }

        public function beginTransaction():bool{
            return $this->pdo->beginTransaction();
        }
        public function commitTransaction():bool{
            return $this->pdo->commit();
        }
        public function rollbackTransaction():bool{
            return $this->pdo->rollback();
        }

        /**
         * Executes a group of SQL statements against this PDO connected database
         *
         * @param array $sqlArray The array of SQL statements to execute
         * @param array $params The parameters for the SQL statements (will be passed to each)
         * @param bool $stopOnError Whether to stop when an exception occurs in one statement
         * @param bool $useTransaction Whether to use a transaction on these statements (could be false because this data is idempotent or you want to avoid table locks)
         * @param bool $allAtOnce Whether to execute the SQL in one prepare call or not (in case the statements are dependent on each other, such as with aliases or the like)
         *
         * @return DBResult The database result of the SQL executions, or error messages
         */
        public function executeAllSqlInArray(array $sqlArray, array $params = [], bool $stopOnError = false, $useTransaction = true, $allAtOnce=false): DBResult {
            if(PDOHelper::isDebug()){
                error_log("----------------------------- executeAllSqlInArray -----------------------------");
            }

            $result = new DBResult(true);

            if(empty($sqlArray)) {
                return $result;
            }

            if(!$this->isConnected()) {
                $this->connect();
            }

            $i = 0;

            if(!$allAtOnce) {
                if($useTransaction) {
                    $this->setAutoCommit(false);
                    $this->beginTransaction();
                }

                foreach ($sqlArray as $sql) {
                    if (empty($sql)) {
                        continue;
                    }
                    $sqlParams = (!empty($params)) ? $params[$i] : [];

                    $sqlResult = $this->executeSQL($sql, $sqlParams, !$useTransaction);
                    $result->combine($sqlResult);

                    if ($stopOnError && !empty($sqlErrors)) {
                        break;
                    }
                    $i++;
                }//end of foreach

                if($useTransaction) {
                    if(PDOHelper::isDebug()){
                        error_log("Using Transaction");
                    }

                    if (empty($errors)) {
                        $this->commitTransaction();
                        if(PDOHelper::isDebug()) {
                            error_log('Commit transaction');
                        }
                    } else {
                        $this->rollbackTransaction();
                        if(PDOHelper::isDebug()) {
                            error_log('Rollback transaction');
                        }
                    }

                    $this->setAutoCommit(true);
                }
            } else {
                //combine SQL, then execute all at once
                $sql = implode('', $sqlArray);

                if (empty($sql)) {
                    return $result;
                }

                $this->setEmulatePrepares(true);

                //combine all params into one array
                $sqlParams = (!empty($params)) ? array_merge(... $params) : [];
                $sqlResult = $this->executeSQL($sql, $sqlParams, $useTransaction);
                $result->combine($sqlResult);

                $this->setEmulatePrepares(false);
            }

            return $result;
        }

        /**
         * Executes a SQL statement against this PDO connected database
         *
         * @param string $sql The SQL statement to execute
         * @param array $params The parameters for this SQL statement
         * @param bool $useTransaction Whether to use a transaction on this statement (could be false because this data is idempotent or you want to avoid table locks)
         *
         * @return DBResult The database result of the SQL execution, or error messages
         */
        public function executeSQL(string $sql, array $params = [], $useTransaction = true): DBResult {
            if(PDOHelper::isDebug()){
                error_log("----------------------------- executeSQL -----------------------------");
            }

            $result = new DBResult(true);

            try {
                if($useTransaction) {
                    $this->setAutoCommit(false);
                    $this->beginTransaction();
                }

                $prepared = $this->pdo->prepare($sql);

                $success = false;
                if(empty($params)) {
                    $success = $prepared->execute();
                } else {
                    $success = $prepared->execute($params);
                }

                $result->result = $prepared->rowCount();
                $prepared->closeCursor();

                if(!$success) {
                    $result->success = false;
                    $result->messages[] = "The following SQL encountered an error: [".$sql."]: ".$prepared->errorInfo();
                }

                if($useTransaction) {
                    if ($success) {
                        $this->commitTransaction();
                    } else {
                        $this->rollbackTransaction();
                    }

                    $this->setAutoCommit(true);
                }
            } catch (\PDOException $e) {
                if($useTransaction) {
                    $this->rollbackTransaction();
                    $this->setAutoCommit(true);
                }
                $result->success = false;
                $result->messages[] = "The following SQL encountered an error: [".$sql."](".$e->getCode()."): ".$e->getMessage();
            }

            return $result;
        }

        /**
         * Resets a database -- dropping all tables and data or use an optional SQL to reset a given database (such as setting the DB to a "vanilla" state of tables/data)
         *
         * @param string $alternateResetSQL The alternate SQL statement to use when resetting the database (otherwise a default one which drops all tables will be used)
         *
         * @return DBResult The database result of the database reset, or error messages
         */
        public function ResetDB($alternateResetSQL = ""):DBResult {
            $sqlToUse = 'reset_db';

            if(!empty($alternateResetSQL) ) {
                $sqlToUse = $alternateResetSQL;
            }

            $resetSQL = $this->sqlLoader->getSqlFileStatements($sqlToUse);
            return $this->executeAllSqlInArray($resetSQL, [], false, true, true);
        }

        /**
         * Resets a database -- dropping all tables and data or use an optional SQL to reset a given database (such as setting the DB to a "vanilla" state of tables/data)
         *
         * @param array $setupSQL The SQL statements to use when setting up the database
         *
         * @return DBResult The database result of the database setup, or error messages
         */
        public function SetupDB(array $setupSQL):DBResult {
            $this->disableForeignKeyChecks();
            $result = $this->executeAllSqlInArray($setupSQL);
            $this->enableForeignKeyChecks();

            return $result;
        }
    }
}