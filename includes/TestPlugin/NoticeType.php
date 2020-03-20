<?php
namespace TestPlugin {
    use TestPlugin\BasicEnum;

    /**
     * Class NoticeType
     *
     * Represents an enum of the type of notice that can be displayed on the WordPress admin panel/area.
     *
     * @package TestPlugin
     */
    abstract class NoticeType extends BasicEnum {
        const ERROR = 0;
        const WARNING = 1;
        const SUCCESS = 2;
        const INFO = 3;
    }
}