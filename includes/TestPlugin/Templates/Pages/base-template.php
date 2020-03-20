<?php
    global $pagename;
    use TestPlugin\TestPlugin_Class;
    use TestPlugin\TestPlugin_Options;
    use TestPlugin\LocalizationHelper;
    use TestPlugin\TestPlugin_Hooks;

    get_header();
?>
    <script type="text/javascript">
<?php
        $localizationInfo = LocalizationHelper::getLocalizationInfo();
        $langCode = (!empty($localizationInfo) && !empty($localizationInfo["preferred_simplified_locale"])) ? $localizationInfo["preferred_simplified_locale"] : "en";
        echo 'serverPreferredLocale = "'.$langCode.'";';
?>
    </script>
<?php
    //do_action(TestPlugin_Hooks::$hookPrefix.'output_localization_for_pagename', $pagename);

    $templates = TestPlugin_Class::getTemplates();
    $pageManager = TestPlugin_Class::getPageManager();

    echo $templates->render('', array(
        'pluginVersion' => TestPlugin_Options::getPluginOption(TestPlugin_Options::PLUGIN_VERSION_OPTION)
    ),$pagename);

    get_footer();
?>