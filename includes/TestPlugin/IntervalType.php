<?php
namespace TestPlugin {
    use TestPlugin\BasicEnum;

    abstract class IntervalType extends BasicEnum {
        const SECONDS = 0;
        const MINUTES = 1;
        const HOURS = 1;
        const DAYS = 2;
    }
}