<?php
use TestPlugin\TestPlugin_Class;
use TestPlugin\JSONHelper;
use TestPlugin\UtilityFunctions;

$expectInModel('pluginVersion');
if(!isset($_GET['tab'])) {
    $_GET['tab'] = 'summary';
}

$initialPageCache = [
    "Languages" => $model["Languages"],
    "Roles" => $model["Roles"],
    "Settings" => $model["Settings"],
    "StoredStrings" => $model["StoredStrings"],
    "Users" => $model["Users"],
    "UserGroups" => $model["UserGroups"]
];

?>
<div style="display: none;" id="initialPageCache" data-initial-page-cache="<?=JSONHelper::encode_as_json($initialPageCache, false, true);?>"></div>

<div class="container">
    <div class="navtabs initTabs">
        <div class="nav-tab-wrapper">
            <a class="nav-tab <?php echo (($_GET['tab']=='summary') ? "default" : "");?>" href="#" data-tabname="summary"> Summary </a>
            <a class="nav-tab <?php echo (($_GET['tab']=='test') ? "default" : "");?>" href="#" data-tabname="test"> Test </a>
        </div>
        <div class="navtab-content-container">
            <div class="navtab-content" data-tabname="summary">
                <p>An example plugin used for creating new plugins. </p>
                <p>Plugin Version: <?php echo $model['pluginVersion']; ?></p>
                <div class="testColor">Test Color Greenify</div>
            </div>
            <div class ="navtab-content" data-tabname="test">
                <?php  echo $this->render("test-tab-content", array("initialPageCache" => $initialPageCache), 'testplugin');?>
            </div>

        </div>
    </div>
</div>