<?php
namespace TestPlugin {
    /**
     * A class that is used to represent a condition on a field of a SQL database table. This helps construct SQL and abstracts some of the conditions/joins to add more validation.
     * */
    class FieldCondition {
        public $fieldName;
        public $fieldNameWherePrefix;

        public $fieldValue;
        public $operator;
        public $ignoreCase;
        public $join;
        public $negate;
        public $isHavingClause;

        public static $supportedOperators = [
            "=",
            "begins with",
            "ends with",
            "like",
            "in",
            "and",
            "or",
            "find in set"
        ];

        public static $supportedJoins = [
            "AND",
            "OR"
        ];

        public function __construct(string $field, $value, string $operator = '=', string $joinValuesWith = 'and', bool $negate = false, bool $ignoreCase = false, string $fieldNameWherePrefix = "", bool $isHavingClause = false) {
            //value can be a single value OR an array (eg: list of ids)
            $this->fieldName = trim(strtolower($field));
            $this->fieldValue = $value;
            $this->operator = trim(strtolower($operator));
            $this->join = trim(strtoupper($joinValuesWith));
            $this->negate = $negate;
            $this->ignoreCase = $ignoreCase;
            $this->fieldNameWherePrefix = $fieldNameWherePrefix;
            $this->isHavingClause = $isHavingClause;

            if(!empty($this->fieldValue)) {
                if(is_array($this->fieldValue)) {
                    $this->fieldValue = array_map(array($this,'formatValue'),$this->fieldValue);
                } else {
                    $this->fieldValue = $this->formatValue($this->fieldValue);
                }
            }
        }

        /**
         * Create multiple FieldCondition objects from an array of associative arrays of key/value pairs of data used to instantiate the objects
         *
         * @param array $arrays The array that contains associative arrays that will be used to construct new FieldCondition objects
         *
         * @return array Whether this AWS S3 Bucket exists
         */
        public static function createFromArrays(array $arrays):array {
            $result = [];
            foreach($arrays as $array) {
                $newObj = FieldCondition::createFromArray($array);
                if(empty($newObj)) {
                    return [];
                }
                //array returned in order to indicate failure to instantiate
                $result[] = $newObj[0];
            }
            return $result;
        }

        /**
         * Creates a FieldCondition object (returned in an array so it can easily be used when combining arrays and to allow this to be used in versions of PHP < 7.1 - as nullable types are new to 7.1)
         *
         * @param array $array The associative array that will be used to construct new FieldCondition objects. The array should be in the form of:
         *
         * [string $field, $value, string $operator, string $joinValuesWith, bool $negate, bool $ignoreCase, string $fieldNameWherePrefix, bool $isHavingClause]
         *
         * The provided array will be expanded, in order, into the constructor of the FieldCondition object
         *
         * @return array An array of one element, the constructed FieldCondition object (or an empty array if that failed)
         */
        public static function createFromArray(array $array):array {
            $result = null;
            static $requiredParams = ['field','value'];
            static $arrayOrder = ['field','value','operator','joinValuesWith','negate', 'fieldNameWherePrefix'];

            if(UtilityFunctions::array_keys_exists($requiredParams,$array)) {
                //contains necessary keys
                //now sort AND filter keys based on expected order
                $filteredParams = UtilityFunctions::order_and_filter_by_keys($array, $arrayOrder);
                try {
                    //remove keys from array, and pass to constructor using "splat" operator
                    $arrayOfParams = array_values($filteredParams);
                    $result = new FieldCondition(...$arrayOfParams);
                } catch (\TypeError $e) {
                    //invalid types given to constructor
                    return [];//return nothing, as invalid conditions given
                }
            } else {
                return [];
            }

            return [$result];
        }

        public function validate(): bool {
            return !empty($this->fieldName) &&
                !empty($this->fieldValue) &&
                !empty($this->operator) && in_array($this->operator,FieldCondition::$supportedOperators) &&
                !empty($this->join) && in_array($this->join,FieldCondition::$supportedJoins);
        }

        /**
         * Creates a where SQL clause, based on this FieldCondition object
         * @param bool $usePlaceholders Whether to include '?' placeholders in the generated where clause
         *
         * @return string The SQL where clause
         */
        public function getWhereClause($usePlaceholders = true): string {
            $whereClause = "";

            if (!$this->validate()) {
                return "";
            }

            $inClause = ($this->operator === 'in');
            $valsToUse = $this->fieldValue;
            if ($usePlaceholders) {
                $valsToUse = (is_array($valsToUse) ? array_fill(0, count($valsToUse), '?') : '?');
            }

            $val = $valsToUse;

            if ($inClause) {
                $val = implode(',', $valsToUse);
            }

            if (!is_array($this->fieldValue) || $inClause) {
                $whereClause = $this->makeWhere($this->fieldName, $val, $this->operator, $this->fieldNameWherePrefix);
            } else {
                $whereStmts = [];
                foreach ($this->fieldValue as $fieldVal) {
                    $whereStmts[] = $this->makeWhere($this->fieldName, $fieldVal, $this->operator, $this->fieldNameWherePrefix);
                }
                $whereClause = implode(' ' . strtoupper($this->join) . ' ', $whereStmts);
            }

            return $whereClause;
        }

        /**
         * Formats a provided value, in preperation with use with an operator in a SQL statement.
         *
         * @param string $val The value to format, based on the operator of this instance
         *
         * @return string The formatted value (as a string)
         */
        private function formatValue(string $val):string {
            $newValue = $val;
            switch ($this->operator) {
                case "begins with":
                    $newValue = $val.'%';
                    break;
                case "ends with":
                    $newValue = '%'.$val;
                    break;
                case "like":
                    $newValue = '%'.$val.'%';
                    break;
            }

            return $newValue;
        }

        /**
         * Formats a provided value, in preperation with use with an operator in a SQL statement.
         *
         * @param string $op The operator to form
         * @param bool $negate Whether to negate the operator
         *
         * @return string The formatted operator (or negated) to be used in SQL
         */
        private static function formatOperator(string $op, bool $negate = false): string {
            $formatted = $op;
            $allowPrependNot = false;

            switch ($op) {
                case "begins with":
                    $formatted = "LIKE";
                    $allowPrependNot = true;
                    break;
                case "ends with":
                    $formatted = "LIKE";
                    $allowPrependNot = true;
                    break;
                case "like":
                    $formatted = "LIKE";
                    $allowPrependNot = true;
                    break;
                case "in":
                    $formatted = "IN";
                    $allowPrependNot = true;
                    break;
                case "and":
                    $formatted = "AND";
                    break;
                case "or":
                    $formatted = "OR";
                    break;
                case "find in set":
                    $formatted = "FIND_IN_SET";
                    break;
                case "=":
                    if($negate) {
                        $formatted = '<>';
                    } else {
                        $formatted = '=';
                    }
                    break;
                default:
            }

            if($allowPrependNot && $negate) {
                $formatted = 'NOT '.$formatted;
            }

            return $formatted;
        }

        /**
         * Prepares the field value to be used in conjunction with an operator (of this class instance
         *
         * @return string|array The value prepared for use in SQL as a parameter to "prepare." An array could be returned, such as if multiple copies are needed, such as with LIKE (and wanting to ignore case)
         */
        public function getFieldValue():mixed {
            $formattedOp = FieldCondition::formatOperator($this->operator);
            if(($formattedOp === 'LIKE') && ($this->ignoreCase)) {
                //then we know we are "doubling up" the value to account for lower/upper casing
                $resultingValue = [];
                if(is_array($this->fieldValue)) {
                    foreach($this->fieldValue as $value) {
                        $resultingValue[] = strtolower($value);
                        $resultingValue[] = strtoupper($value);
                    }

                    return $resultingValue;
                } else {
                    return [strtolower($this->fieldValue), strtoupper($this->fieldValue)];
                }
            } else {
                //just return the fieldvalue
                return $this->fieldValue;
            }
        }

        /**
         * Makes a full WHERE statement to be added to raw SQL
         *
         * @param string $field The field name to use to make the where
         * @param string $operator The operator
         * @param string $fieldNamePrefix The prefix (if needed) to append to the field name to be used in the where. This is commonly ued if the SQL has aliases / subqueries with aliases
         *
         * @return string The resulting where clause
         */
        private function makeWhere(string $field, $value, string $operator, string $fieldNamePrefix): string {
            $resultingWhere = "";
            $formattedOp = FieldCondition::formatOperator($this->operator);

            if($operator === 'in') {
                if(is_array($value)) {
                    $value = implode(",", $value);
                }
                //this assumes value is NOT empty, otherwise a SQL exception is thrown (an empty IN clause list)
                $value = '('.$value.')';
            }


            if(($formattedOp === 'LIKE') && ($this->ignoreCase)){
                $resultingWhere = $fieldNamePrefix.SQLLoader::escapeFieldName($field).' '.$formattedOp.' '.strtolower($value);
                $resultingWhere .= ' OR '.$fieldNamePrefix.SQLLoader::escapeFieldName($field).' '.$formattedOp.' '.strtoupper($value);
            } else if(($formattedOp === 'FIND_IN_SET')){
                $resultingWhere = $fieldNamePrefix.$formattedOp.'('.$value.','.SQLLoader::escapeFieldName($field).')';
            } else {
                $resultingWhere = $fieldNamePrefix.SQLLoader::escapeFieldName($field).' '.$formattedOp.' '.$value;
            }

            return $resultingWhere;
        }

        /**
         * Makes a full WHERE statement to be added to raw SQL
         *
         * @param array $fieldConditions The FieldCondition objects to combine the where clauses of
         *
         * @return string The full where clause, with all provided where clauses combined
         */
        public static function combineWhereClauses(array $fieldConditions = []):string {
            $whereClause = "";
            if(empty($fieldConditions)) {
                return "TRUE=TRUE";
            }

            foreach ($fieldConditions as $condition) {
                if($condition->validate() && !$condition->isHavingClause) {
                    if(!empty($whereClause)) {
                        $whereClause .= ' '.$condition->join.' ';
                    }

                    $whereClause .= $condition->getWhereClause();
                } else {
                    return 'FALSE=TRUE';//force the result to return nothing -- because one of the conditions wasn't valid
                }
            }

            return $whereClause;
        }

        /**
         * Makes a full HAVING statement to be added to raw SQL
         *
         * @param array $fieldConditions The FieldCondition objects to combine the having clauses of
         *
         * @return string The full having clause, with all provided having clauses combined
         */
        public static function combineHavingClauses(array $fieldConditions = []):string {
            $whereClause = "";
            if(empty($fieldConditions)) {
                return "TRUE=TRUE";
            }

            foreach ($fieldConditions as $condition) {
                if($condition->validate() && $condition->isHavingClause) {
                    if(!empty($whereClause)) {
                        $whereClause .= ' '.$condition->join.' ';
                    }

                    $whereClause .= $condition->getWhereClause();
                } else {
                    return 'FALSE=TRUE';//force the result to return nothing -- because one of the conditions wasn't valid
                }
            }

            return $whereClause;
        }

        public static function validateAll(array $fieldConditions = [], bool $validIfEmpty = false) {
            $result = false;

            if($validIfEmpty && empty($fieldConditions)) {
                return true;
            }

            foreach ($fieldConditions as $condition) {
                $result = $condition->validate();
                if(!$result) {
                    break;
                }
            }

            return $result;
        }

        /**
         * Gets every field condition from an array of FieldCondition objects. Simply made for convenience.
         *
         * @param array $fieldConditions The FieldCondition objects to get the conditions of
         *
         * @return array The array of field names from all FieldCondition objects provided
         */
        public static function getFieldNamesOfConditions(array $fieldConditions = []):array {
            $result = [];
            foreach ($fieldConditions as $condition) {
                if($condition instanceof FieldCondition) {
                    $result[] = $condition->fieldName;
                }
            }

            return $result;
        }

        /**
         * Gets every value from an array of FieldCondition objects. Simply made for convenience.
         *
         * @param array $fieldConditions The FieldCondition objects to get the values of
         *
         * @return array The array of values from all FieldCondition objects provided
         */
        public static function getValuesOfConditions(array $fieldConditions = []):array {
            $result = [];
            foreach ($fieldConditions as $condition) {
                if($condition instanceof FieldCondition) {
                    $fieldValue = $condition->getFieldValue();
                    if(is_array($fieldValue)) {
                        $fieldValue = UtilityFunctions::flatten($fieldValue);
                        $result = array_merge($result, $fieldValue);
                    } else {
                        $result[] = $fieldValue;
                    }
                }
            }

            return $result;
        }

        /**
         * Gets every value from an array of FieldCondition objects, that don't have "isHavingClause" set to true. Simply made for convenience.
         *
         * @param FieldCondition ...$fieldConditions The varying number of FieldConditions (as an array)
         *
         * @return array The array of values from all FieldCondition objects provided, but ONLY if the FieldConditions are NOT intended for a HAVING SQL clause
         */
        public static function getValuesOfConditionsForWhere(FieldCondition ...$fieldConditions):array {
            $result = [];
            foreach ($fieldConditions as $condition) {
                if(!$condition->isHavingClause){
                    $fieldValue = $condition->getFieldValue();
                    if(is_array($fieldValue)){
                        $fieldValue = UtilityFunctions::flatten($fieldValue);
                        $result = array_merge($result, $fieldValue);
                    }
                    else {
                        $result[] = $fieldValue;
                    }
                }
            }

            return $result;
        }

        /**
         * Gets every value from an array of FieldCondition objects,that do have "isHavingClause" set to true. Simply made for convenience.
         *
         * @param FieldCondition ...$fieldConditions The varying number of FieldConditions (as an array)
         *
         * @return array The array of values from all FieldCondition objects provided, but ONLY if the FieldConditions ARE intended for a HAVING SQL clause
         */
        public static function getValuesOfConditionsForHavingClause(FieldCondition ...$fieldConditions):array {
            $result = [];
            foreach ($fieldConditions as $condition) {
                if($condition->isHavingClause){
                    $fieldValue = $condition->getFieldValue();
                    if(is_array($fieldValue)){
                        $fieldValue = UtilityFunctions::flatten($fieldValue);
                        $result = array_merge($result, $fieldValue);
                    }
                    else {
                        $result[] = $fieldValue;
                    }
                }
            }

            return $result;
        }

        /**
         * Gets every field name and value from an array of FieldCondition objects. Simply made for convenience.
         *
         * @param FieldCondition ...$fieldConditions The varying number of FieldConditions (as an array)
         *
         * @return array The array of field names and values from all FieldCondition objects provided.
         *
         * The returned array will have KEYS as the field names, and values from the FieldConditions.
         */
        public static function getFieldsAndValuesOfConditions(array $fieldConditions = []):array {
            $result = [];
            foreach ($fieldConditions as $condition) {
                if($condition instanceof FieldCondition) {
                    $fieldValue = $condition->getFieldValue();
                    if(is_array($fieldValue)) {
                        $fieldValue = UtilityFunctions::flatten($fieldValue);
                        $result[$condition->fieldName] = $fieldValue;
                    } else {
                        $result[$condition->fieldName] = $fieldValue;
                    }
                }
            }

            return $result;
        }

        /**
         * Checks an array of FieldConditions to see if any "fieldValues" are empty
         *
         * @param array $fieldConditions The array of FieldConditions
         *
         * @return bool Whether and of the FieldCondition objects provided have an empty field value
         */
        public static function anyFieldValuesEmpty(array $fieldConditions = []){
            $empty = false;
            foreach ($fieldConditions as $condition) {
                if($condition instanceof FieldCondition) {
                    $empty = empty($condition->fieldValue);
                    if($empty) {
                        break;
                    }
                }
            }

            return $empty;

        }

        /**
         * Sets the field name prefix field for an array of FieldCondition objects. Simply made for convenience.
         *
         * @param array $fieldConditions The array of FieldConditions
         * @param string $prefix The prefix to add to each FieldCondition
         */
        public static function setAllFieldNameWherePrefix(array $fieldConditions, string $prefix){
            foreach ($fieldConditions as $condition) {
                if($condition instanceof FieldCondition) {
                    $condition->fieldNameWherePrefix = $prefix;
                }
            }
        }

        /**
         * Sorts an array of FieldConditions, so that the ones with "isHavingClause" set to TRUE are last (the WHERE clauses are first)
         *
         * @param bool $reverse Whether to reverse the order or not (if true the HAVING clauses are first)
         * @param FieldCondition ...$fieldConditions The array of FieldConditions
         */
        public static function sortWhereClausesFirst($reverse = false, FieldCondition ...$fieldConditions){
            usort($fieldConditions, function($a, $b) use ($reverse) {
                if ($a->isHavingClause == $b->isHavingClause) {
                    return 0;
                } else if($a->isHavingClause){
                    return $reverse ? -1 : 1;
                } else {
                    return $reverse ? 1 : -1;
                }
            });
        }
    }
}