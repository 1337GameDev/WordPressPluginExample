<?php

namespace TestPlugin {
    use TestPlugin\UtilityFunctions;

    /* Built from code fetched from: https://stackoverflow.com/questions/147821/loading-sql-files-from-within-php */
    /* Author username: Gromo */

    class SQLLoader {
        private $sqlFolder = "";
        private $sqlPlaceholders;

        function __construct($folder = "", $tblPrefix, $collate) {
            $this->sqlFolder = $folder;
            $this->sqlPlaceholders = [
                "{table_prefix}" => $tblPrefix,
                "{db_collate}" => $collate
            ];

        }

        /**
         * Remove comments from sql
         *
         * @param string sql
         * @param boolean is multi-comment line
         * @return string
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
         * Check if "offset" position is quoted
         *
         * @param int $offset
         * @param string $text
         * @return boolean
         */
        public static function isQuoted($offset, $text) {
            if ($offset > strlen($text))
                $offset = strlen($text);

            $isQuoted = false;
            for ($i = 0; $i < $offset; $i++) {
                if ($text[$i] == "'")
                    $isQuoted = !$isQuoted;
                if ($text[$i] == "\\" && $isQuoted)
                    $i++;
            }
            return $isQuoted;
        }

        /**
         * Fetch SQL from file
         *
         * @param string path to a sql file (under the SQLFolder supplied for this object)
         * @return array an array of strings, the SQL statements of the file
         */
        public function fetchSql($fileName) {
            $sqlStatements = [];

            $delimiter = ';';
            $isFirstRow = true;
            $isMultiLineComment = false;
            $sql = '';
            $row = '';
            $file = NULL;

            try {
                $file = fopen($this->sqlFolder.DIRECTORY_SEPARATOR.$fileName, 'r');
                while (!feof($file)) {
                    $row = fgets($file);

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
                    $sqlStatements[] = $row;
                }

                fclose($file);
            } catch (\Exception $e) {
                UtilityFunctions::log_message("Error with handling SQL file: ".$file);
            }

            //5. Replace placeholders in SQL file
            $sqlStatements = $this->applyPlaceholders($sqlStatements);

            return $sqlStatements;
        }

        public function applyPlaceholders($sql) {
            if(is_array($sql) ) {
                return array_map(function($val) { return $this->replacePlaceholders($val); }, $sql);
            } else {
                return $this->replacePlaceholders($sql);
            }
        }

        private function replacePlaceholders($sql) {
            return str_replace(array_keys($this->sqlPlaceholders),array_values($this->sqlPlaceholders),$sql);
        }
    }
}