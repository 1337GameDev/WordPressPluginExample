<?php

namespace TestPlugin {
    /* Built from code fetched from: https://stackoverflow.com/questions/147821/loading-sql-files-from-within-php */
    /* Author username: Gromo */

    /**
     * Class SQLLoader
     * A class used to load SQL from a given location.
     *
     * @package TestPlugin
     */
    class SQLLoader {
        private $sqlFolder = "";
        private $sqlPlaceholders;
        private $tablePrefix = "";
        private $dbCollate = "";

        private static $isDebug = false;
        public static function enableDebug() {SQLLoader::$isDebug = true;}
        public static function disableDebug() {SQLLoader::$isDebug = false;}
        public static function isDebug():bool {return SQLLoader::$isDebug;}

        public function getTablePrefix():string {return $this->tablePrefix;}
        public function getDatabaseCollate():string {return $this->dbCollate;}

        function __construct($folder, $tblPrefix, $collate, array $extraPlaceholders = []) {
            $this->sqlFolder = $folder;
            $this->sqlPlaceholders = array_merge([
                "{table_prefix}" => $tblPrefix,
                "{db_collate}" => $collate
            ], $extraPlaceholders);

            $this->tablePrefix = $tblPrefix;
            $this->dbCollate = $collate;
        }

        /**
         * Remove comments from SQL statements
         *
         * @param string The SQL
         * @param boolean If the SQL has multi-comment lines
         * @return string The resulting SQL without comments
         */
        public static function removeComments($sql, &$isMultiComment) {
            if ($isMultiComment) {
                if (preg_match('#\*/#sUi', $sql)) {
                    $sql = preg_replace('#^.*\*/\s*#sUi', '', $sql);
                    $isMultiComment = false;
                } else {
                    $sql = '';
                }
                if(trim($sql) == ''){
                    return $sql;
                }
            }

            $offset = 0;
            while (preg_match('{--\s|#|/\*[^!]}sUi', $sql, $matched, PREG_OFFSET_CAPTURE, $offset)) {
                list($comment, $foundOn) = $matched[0];
                if (SQLLoader::isQuoted($foundOn, $sql)) {
                    $offset = $foundOn + strlen($comment);
                } else {
                    if (substr($comment, 0, 2) == '/*') {
                        $closedOn = strpos($sql, '*/', $foundOn);
                        if ($closedOn !== false) {
                            $sql = substr($sql, 0, $foundOn) . substr($sql, $closedOn + 2);
                        } else {
                            $sql = substr($sql, 0, $foundOn);
                            $isMultiComment = true;
                        }
                    } else {
                        $sql = substr($sql, 0, $foundOn);
                        break;
                    }
                }
            }
            return $sql;
        }

        /**
         * Gets the drop table SQL statements, given an array of table names
         *
         * @param array $tableNames The list of table names to get the drop table statements for
         * @param boolean $addPrefix Whether to add the table prefix provided by this loader
         * @return array The resulting table drop SQL statements
         */
        public function getDropTableSQL(array $tableNames, bool $addPrefix = true):array {
            $sql = [];
            foreach ($tableNames as $tableName) {
                $sql[] = "DROP TABLE IF EXISTS ".($addPrefix ? $this->tablePrefix : "").$tableName;
            }
            return $sql;
        }

        /**
         * Check if "offset" position is quoted
         *
         * @param int $offset
         * @param string $text
         * @return boolean
         */
        public static function isQuoted($offset, $text) {
            if ($offset > strlen($text)) {
                $offset = strlen($text);
            }

            $isQuoted = false;
            for ($i = 0; $i < $offset; $i++) {
                if ($text[$i] == "'") {
                    $isQuoted = !$isQuoted;
                }
                if ($text[$i] == "\\" && $isQuoted) {
                    $i++;
                }
            }
            return $isQuoted;
        }

        /**
         * Gets SQL statements from a file
         *
         * @param string $fileName The filename to load SQL from
         * @param array $extraPlaceholders Extra placeholders to substitute into the SQL when loaded
         * @param string $subDir The subdirectory the SQL file resides in, relative to the "sqlFolder" of this object
         * @return array The resulting SQL statements loaded from the file
         */
        public function getSqlFileStatements(string $fileName,  array $extraPlaceholders = [], string $subDir = ""):array {
            $resultStatements = [];

            if(!empty($fileName)) {
                if(is_array($fileName)) {
                    foreach ($fileName as $file) {
                        $resultStatements = array_merge($resultStatements, $this->fetchSql($file, $extraPlaceholders, $subDir));
                    }
                } else {
                    $resultStatements = $this->fetchSql($fileName, $extraPlaceholders, $subDir);
                }

                //ensure each ends with a ";"
                foreach ($resultStatements as &$stmt) {
                    if(!$this->endsWith($stmt,';')) {
                        $stmt .= ';';
                    }
                }
            }
            return $resultStatements;
        }

        /**
         * Gets a single SQL statement from a file
         *
         * @param string $fileName The filename to load SQL from
         * @param array $extraPlaceholders Extra placeholders to substitute into the SQL when loaded
         * @param string $subDir The subdirectory the SQL file resides in, relative to the "sqlFolder" of this object
         * @return string The resulting SQL statement loaded from the file
         */
        public function getSingleSqlFileStatement(string $fileName,  array $extraPlaceholders = [], string $subDir = ""):string {
            $result = "";
            $statements = $this->getSqlFileStatements($fileName, $extraPlaceholders, $subDir);
            if(!empty($statements)){
                $result = implode('', $statements);
            }

            return $result;
        }

        /**
         * Fetch SQL from file
         *
         * @param string $fileName path to a sql file (under the SQLFolder supplied for this object)
         * @param array $extraPlaceholders An array of placeholders to to substitute into the loaded SQL
         * @param string $subDir A subdirectory under the sql folder for this loader, in which to load a SQL file from
         * @return array an array of strings, the SQL statements of the file
         */
        private function fetchSql(string $fileName, array $extraPlaceholders = [], $subDir = "") {
            if(SQLLoader::isDebug()){
                error_log("----------------------------- fetchSql -----------------------------");
            }

            if(!UtilityFunctions::stringEndsWith($fileName,'.sql') ) {
                $fileName.='.sql';
            }

            $sqlStatements = [];

            $delimiter = ';';
            $isFirstRow = true;
            $isMultiLineComment = false;
            $sql = '';
            $row = '';

            $dir = $this->sqlFolder;
            if(!empty($subDir)) {
                $dir.=DIRECTORY_SEPARATOR.$subDir;
            }

            $filePath = implode(DIRECTORY_SEPARATOR,[$dir,$fileName]);
            if(SQLLoader::isDebug()) {
                error_log("filePath:".$filePath);
            }
            $file = NULL;

            if(file_exists($filePath) ) {
                try {
                    $file = fopen($filePath, 'r');
                    while (!feof($file)) {
                        $row = fgets($file);

                        if(SQLLoader::isDebug()) {
                            error_log('Row from file:'.print_r($row,true));
                        }

                        // remove BOM for utf-8 encoded file
                        if ($isFirstRow) {
                            $row = preg_replace('/^\x{EF}\x{BB}\x{BF}/', '', $row);
                            $isFirstRow = false;
                        }

                        // 1. ignore empty string and comment row
                        if (trim($row) == '' || preg_match('/^\s*(#|--\s)/sUi', $row)) {
                            continue;
                        }

                        // 2. clear comments
                        $row = trim(SQLLoader::removeComments($row, $isMultiLineComment));

                        // 3. parse delimiter row
                        if (preg_match('/^DELIMITER\s+[^ ]+/sUi', $row)) {
                            $delimiter = preg_replace('/^DELIMITER\s+([^ ]+)$/sUi', '$1', $row);
                            continue;
                        }

                        // 4. separate sql queries by delimiter
                        $offset = 0;
                        while (strpos($row, $delimiter, $offset) !== false) {
                            $delimiterOffset = strpos($row, $delimiter, $offset);
                            if (SQLLoader::isQuoted($delimiterOffset, $row)) {
                                $offset = $delimiterOffset + strlen($delimiter);
                            } else {
                                $sql = trim($sql . ' ' . trim(substr($row, 0, $delimiterOffset)));
                                $sqlStatements[] = $sql;

                                $row = substr($row, $delimiterOffset + strlen($delimiter));
                                $offset = 0;
                                $sql = '';
                            }
                        }
                        $sql = trim($sql . ' ' . $row);
                    }
                    if (strlen($sql) > 0) {
                        $sqlStatements[] = $sql;
                    }

                    fclose($file);

                    if(SQLLoader::isDebug()) {
                        error_log('Statements before placeholders:'.print_r($sqlStatements,true));
                    }

                    //5. Replace placeholders in SQL file
                    $sqlStatements = $this->applyPlaceholders($sqlStatements, $extraPlaceholders);

                    if(SQLLoader::isDebug()) {
                        error_log('Statements after placeholders:'.print_r($sqlStatements,true));
                    }
                } catch (\Exception $e) {
                    UtilityFunctions::log_message("Error with handling SQL file: ".$file);
                }
            } else {
                //file doesn't exist
                if(SQLLoader::isDebug()) {
                    error_log("The SQL file \"".$filePath."\" was not found.");
                }
            }

            return $sqlStatements;
        }

        /**
         * Loads data from a PDOHelper's database, using a given SQL file with PDO's "fetch_all" function
         *
         * @param PDOHelper $source The PDOHelper data source to execute the SQL on
         * @param string $filename The filename to load SQL from
         * @param string $subdir The subdirectory the SQL file resides in, relative to the "sqlFolder" of "source" parameter
         * @param array $placeholders Extra placeholders to substitute into the SQL when loaded
         * @param array $dataToPassToSQL Data to pass to the loaded SQL as parameters using PDO's "execute" function
         *
         * @return array The result set after loading and executing SQL using: fetchAll(\PDO::FETCH_ASSOC)
         */
        public function getDataFromSQL(PDOHelper $source, string $filename = "", string $subdir = "", $placeholders = [], $dataToPassToSQL = []):array {
            if(SQLLoader::isDebug()){
                error_log("----------------------------- getDataFromSQL:SQLLoader -----------------------------");
            }

            if(empty($filename)) {
                return [];
            }
            $pdo = $source->getPDOConnection();
            if($pdo === NULL) {
                error_log('The PDOConnection for the PDOHelper provided was invalid.');
                return [];
            }
            $sql = $this->getSingleSqlFileStatement($filename, $placeholders, $subdir);
            if(empty($sql)) {
                return [];
            }

            try {
                $success = false;
                if(SQLLoader::isDebug() ){
                    error_log("dataToPassToSQL:".print_r($dataToPassToSQL,true));
                }

                $prepared = $pdo->prepare($sql);
                $success = $prepared->execute($dataToPassToSQL);
                if($success === false) {
                    return [];
                }

                $result = $prepared->fetchAll(\PDO::FETCH_ASSOC);

                if(empty($result)) {
                    $result = [];
                }
                return $result;
            } catch(\PDOException $e){
                $msg = 'getDataFromSQL - Exception:' . print_r($e, true);
                error_log($msg);

                if(SQLLoader::isDebug()){
                    $msg = 'getDataFromSQL - Exception:' . print_r($e, true);
                    error_log($msg);
                }
            }

            return [];
        }

        /**
         * Applies placeholders to a given SQL string or SQL array
         *
         * @param string|array $sql The SQL statements / array of statements to apply placeholders to
         * @param array $extraPlaceholders Extra placeholders to substitute into the SQL when loaded
         *
         * @return array The resulting SQL with placeholders replaced with their values
         */
        public function applyPlaceholders($sql, $extraPlaceholders = []) {
            if(is_array($sql) ) {
                return array_map(function($val) use ($extraPlaceholders) { return $this->replacePlaceholders($val, $extraPlaceholders); }, $sql);
            } else {
                return $this->replacePlaceholders($sql, $extraPlaceholders);
            }
        }

        /**
         * Applies placeholders to a given SQL STRING
         *
         * @param string $sql The SQL statements STRING to apply placeholders to
         * @param array $extraPlaceholders Extra placeholders to substitute into the SQL when loaded
         *
         * @return array The resulting SQL with placeholders replaced with their values
         */
        private function replacePlaceholders($sql, $extraPlaceholders = []) {
            $placeholders = array_merge($this->sqlPlaceholders, $extraPlaceholders);
            return str_replace(array_keys($placeholders),array_values($placeholders),$sql);
        }

        /* Security Related Helpers */

        /**
         * Used to escape a given array of fields
         *
         * @param array $fields The array of field names as strings to escape
         *
         * @return array The resulting escaped field names
         */
        public static function escapeFieldNameArray(array $fields):array {
            $result = [];

            foreach($fields as $field){
                $result[] = SQLLoader::escapeFieldName($field);
            }

            return $result;
        }

        /**
         * Escapes a field name string
         *
         * @param string $fieldName The field name string to escape
         *
         * @return string The escaped field name string
         */
        public static function escapeFieldName(string $fieldName):string {
            return "`" . str_replace("`", "``", $fieldName)."`";
        }

        /* Private Helpers*/
        private function startsWith(string $haystack, string $needle):bool {
            $length = strlen($needle);
            return (substr($haystack, 0, $length) === $needle);
        }

        private function endsWith(string $haystack, string $needle):bool {
            $length = strlen($needle);
            if ($length == 0) {
                return true;
            }

            return (substr($haystack, -$length) === $needle);
        }
    }
}