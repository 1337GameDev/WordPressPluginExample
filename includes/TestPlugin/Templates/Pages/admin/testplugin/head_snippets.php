<?php
//css loader
$cssLoader = \TestPlugin\TestPlugin_Class::$cssLoader;

$pluginJSDir = TestPlugin\TestPlugin_URL."/js";

//polymer modules
$testModuleJS = $pluginJSDir."/components/test-component.js";

$cssLoader->makeDOMStyleModule("test-component");
?>

<script type="module" src="<?php echo $testModuleJS;?>"></script>
