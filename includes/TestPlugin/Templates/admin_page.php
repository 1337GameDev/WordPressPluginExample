<?php
    if(!isset($pluginVersion) ) {
        throw new \Exception("'pluginVersion' is not defined!");
    }

?>

<div class="container">
    <div class="row">
        <p>An example plugin used for creating new plugins. </p>
        <p>Plugin Version: <?php echo $pluginVersion ?></p>

        <button id="testAjaxButton"> Test Ajax</button>
        <div class="miniloaderContainer" id="testPluginLoader">
            <div class="miniloader"></div>
        </div>
    </div>

    <div class="row">
        <div class="col-xs-12">
            <p id="ajaxResponseMessage1"></p>
            <p id="ajaxResponseMessage2"></p>

        </div>
    </div>
    <hr/>
    <div class="row">
        <div class="col-xs-12">
            <div class="row">
                <div class="col-xs-12">
                    <p>Section 1</p>
                </div>
            </div>
            <div class="row">
                <div class="col-xs-6">
                    <test-component></test-component>
                </div>
            </div>
        </div>
    </div>


</div>
