<?php
namespace TestPlugin {
    use TestPlugin\BasicEnum;

    abstract class NoticeType extends BasicEnum {
        const ERROR = 0;
        const WARNING = 1;
        const SUCCESS = 2;
        const INFO = 3;
    }
}