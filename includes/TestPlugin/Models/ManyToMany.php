<?php
namespace TestPlugin\Models {

    /**
     * Interface ManyToMany
     * An interface to assist with necessary methods/data used to convery a many-to-many relationship between 2 models
     *
     * @package TestPlugin\Models
     */
    interface ManyToMany {
        public static function getFromClass():string;
        public static function getFromFieldName():string;
        public static function getToClass():string;
        public static function getToFieldName():string;


    }
}