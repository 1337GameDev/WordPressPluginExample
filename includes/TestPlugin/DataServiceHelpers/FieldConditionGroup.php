<?php
namespace TestPlugin {
    use \TestPlugin\FieldCondition;

    /**
     * Class FieldConditionGroup A class designed to group FieldConditions, so that they cna be joined with a custom operator
     * @package TestPlugin
     */
    class FieldConditionGroup {
        public $join; //the "join" to use to specify how this group of conditions is combined with other groups
        public $fieldConditions;

        public static $supportedJoins = [
            "AND",
            "OR"
        ];

        public function __construct(string $join, FieldCondition ...$fieldConditions) {
            $this->join = trim(strtoupper($join));
            $this->fieldConditions = $fieldConditions;

            if(!in_array($this->join, FieldConditionGroup::$supportedJoins)) {
                $this->join = "OR";
            }
        }

        public function validate() {
            return in_array($this->join, FieldConditionGroup::$supportedJoins) && !empty($this->fieldConditions);
        }

        /**
         * Get an expression to be used in a SQL statement, combining FieldConditions (and possibly appending a JOIN string of this object)
         *
         * @param bool $includeJoin Whether to prefix the combined FieldConditions with the join field of this object
         *
         * @return string The resulting expression of the combined FieldConditions to be used in SQL, possibly prefixed with this object's "join" field
         */
        public function combineConditions($includeJoin = false):string {
            $combinedResult = ($includeJoin ? ' '.$this->join : "")." (".FieldCondition::combineWhereClauses($this->fieldConditions).")";
            return $combinedResult;
        }

        /**
         * Get an expression to be used in a SQL statement, combining FieldConditionGroups--this object (and possibly appending a JOIN string of this object)
         *
         * @param FieldConditionGroup ...$groups The FieldConditionGroups to join together
         *
         * @return string The resulting expression of the combined FieldConditionGroups to be used in SQL, possibly prefixed with each object's "join" field
         */
        public static function combineGroups(FieldConditionGroup ...$groups):string {
            $firstGroup = true;
            $result = "";
            foreach($groups as $group) {
                $combined = $group->combineConditions(!$firstGroup);
                if($firstGroup) {
                    $firstGroup = false;
                }

                $result .= $combined;
            }

            return $result;
        }

        /**
         * Gets every value from an array of FieldConditionGroups, and their respective
         * FieldCondition objects. Simply made for convenience.
         *
         * @param FieldConditionGroup ...$groups The FieldConditionGroup objects to get the values of their FieldConditions
         *
         * @return array The array of values from all FieldCondition objects of the FieldConditionGroups provided
         */
        public static function getValuesOfGroups(FieldConditionGroup ...$groups):array {
            $values = [];
            foreach($groups as $group) {
                $values = array_merge($values, FieldCondition::getValuesOfConditions($group->fieldConditions) );
            }

            return $values;
        }
    }
}