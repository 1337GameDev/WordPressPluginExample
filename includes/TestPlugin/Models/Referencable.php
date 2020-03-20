<?php
namespace TestPlugin\Models {
    /**
     * Interface Referencable
     * Represents a model that has info that should be used to save, instead of the direct reference
     * An example would be to use this for a ForeignKey relationship, where a model has an instance of a model ina  field it has a FK to
     *
     * @package TestPlugin\Models
     */
    interface Referencable {
        /**
         * Gets data to be used when a reference in another model points to this object.
         * Commonly used to help assist in saving an object that has a reference to another once loaded.
         * This commonly will return a primary key for the object being referenced.
         *
         * @return mixed
         */
        public function getDataForReference();
    }
}