<div class="miniloaderContainer" id="testPluginLoader">
    <div class="miniloader"></div>
</div>
<div class="row">
    <div class="col-xs-12">
        <p id="ajaxResponseMessage1"></p>
        <p id="ajaxResponseMessage2"></p>

    </div>
</div>

<button class="btn btn-primary linkButton" data-open-target="new" data-link-to-open="<?=site_url('testpluginuser')?>" type="button">Open User Test Page</button>

<button id="testAjaxButton"> Test Ajax</button>

<test-component></test-component>

<span id="modelTablesContainer"></span>

<h1>Common Widgets</h1>
<hr/>

<div class="helpertooltip preventEvenBubble choiceButtonsContainer tooltipstered" id="choiceButton1">
    <label class="choiceTextLabel">
        Choice Text
    </label>

    <div class="choiceButtons btn-group">
        <label class="btn-primary btn">
            <input name="choiceField1" type="radio" value="true">
            Yes
        </label>
        <label class="active btn-primary btn">
            <input checked="checked" name="choiceField1" type="radio" value="false">
            No
        </label>
    </div>
</div>

<select id="testEditField" data-field-name="Test Field">
    <option value="0">Option 1</option>
    <option value="2">Option 2</option>
    <option value="4">Option 3</option>
</select>

<span id="fileDropTarget"></span>

<form id="testSetting1Form">
    <div class="form-group">
        <label for="testSetting1Input">Test Setting 1</label>
        <?php
            $testSetting1 = null;
            foreach ($model["initialPageCache"]['Settings'] as $setting) {
                if($setting->settingname == 'TestSetting1') {
                    $testSetting1 = $setting;
                    break;
                }
            }
        ?>
        <select multiple="multiple" class="tagsinputtarget tags" id="testSetting1Input" data-tag-max-length="64" data-setting-id="<?php echo (!empty($testSetting1)) ? $testSetting1->id : "-1" ;?>">
            <?php
                if(!empty($testSetting1)) {
                    $split = explode(',',$testSetting1->settingvalue);
                    foreach ($split as $val) {
                        echo "<option>{$val}</option>";
                    }
                }
            ?>
        </select>
        <small id="testSetting1InputHelp" class="form-text text-muted">TestSetting1 has a value that is a comma-separated list of values.</small>
    </div>
    <button type="button" class="btn btn-primary pendingActionButton">
        Save TestSetting1
        <div class="pendingActionButtonLayer">
            <div class="loader-container centered"><div class="loader"></div></div>
        </div>
    </button>
</form>