<?php
    use TestPlugin\JSONHelper;

    $initialPageCache = $model["initialPageCache"];
?>
<div style="display: none;" id="initialPageCache" data-initial-page-cache="<?=JSONHelper::encode_as_json($initialPageCache, false, true);?>"></div>

<div class="row">
    <div class="col-xs-12">
        <button type="button" class="btn btn-secondary light-blue rounded pendingActionButton" id="testAjaxButton">
            Load Data <i class="fa fa-server" aria-hidden="true"></i>
            <div class="pendingActionButtonLayer">
                <div class="loader-container centered"><div class="loader"></div></div>
            </div>
        </button>
        <span id="settingsTable"></span>
        <div class="miniloaderContainer" id="settingsTableLoader">
            <div class="miniloader"></div>
        </div>
        <span id="languagesTable"></span>
        <span id="settingsTable"></span>
    </div>
</div>