<?php
namespace TestPlugin {
    use TestPlugin\BasicEnum;

    /**
     * Class IntervalType
     *
     * This was made to help specify a type of interval of time for use in the plugin
     *
     * @package TestPlugin
     */
    abstract class IntervalType extends BasicEnum {
        const SECONDS = 0;
        const MINUTES = 1;
        const HOURS = 1;
        const DAYS = 2;
    }
}