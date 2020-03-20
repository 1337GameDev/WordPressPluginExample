<?php
namespace TestPlugin {
    /**
     * Interface PDOHelperContainer
     *
     * Represents a model that has info that should be used to save, instead of the direct reference
     * An example would be to use this for a ForeignKey relationship, where a model has an instance of a model in a field it has a FK to
     * @package TestPlugin
     */
    interface PDOHelperContainer {
        public function getPDOHelper():PDOHelper;
    }
}