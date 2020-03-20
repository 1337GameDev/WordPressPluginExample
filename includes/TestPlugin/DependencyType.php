<?php
namespace TestPlugin {
    use TestPlugin\BasicEnum;

    /**
     * Class DependencyType
     *
     * An enum for a type of dependency for this plugin.
     *
     * @package TestPlugin
     */
    abstract class DependencyType extends BasicEnum {
        const FUNCTION_TYPE = 0;
        const CLASS_TYPE = 1;
        const CONSTANT_TYPE = 2;
    }
}