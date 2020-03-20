/// <reference types="jquery" />
/// <reference path="./lib/@types/requirejs/index.d.ts" />
/// <reference path="./modules/TestPlugin/TestPlugin.ts" />
var testplugin_GlobalJSData; //provided by WordPress via "wp_localize_script"
requirejs.config({
    baseUrl: testplugin_GlobalJSData.pluginURL + "/js",
    /* Paths to JS files to be loaded via RequireJS */
    paths: {
        'jquery': ['https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min', 'lib/jquery/dist/jquery.min'],
        'moment': ['https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min', 'lib/moment/moment.min'],
        'numeral': 'lib/numeral/min/numeral.min',
        'bootstrap-multiselect': 'local/bootstrap-multiselect/bootstrap-multiselect',
        'jquery-confirm': 'lib/jquery-confirm/dist/jquery-confirm.min',
        'css-vars-ponyfill': ['https://unpkg.com/css-vars-ponyfill@1.17.2/dist/css-vars-ponyfill.min', 'lib/css-vars-ponyfill/dist/css-vars-ponyfill.min'],
        'knockout': 'lib/knockout/build/output/knockout-latest',
        'bootstrap-select': ['https://cdn.jsdelivr.net/npm/bootstrap-select@1.13.7/dist/js/bootstrap-select.min', 'lib/bootstrap-select/dist/js/bootstrap-select.min'],
        'tooltipster': ['https://cdn.jsdelivr.net/npm/tooltipster@4.2.6/dist/js/tooltipster.bundle.min', 'lib/tooltipster/dist/js/tooltipster.bundle.min'],
        'bootstrap4-tagsinput': 'fallbacks/tagsinput080.min',
        'typeahead': 'lib/typeahead.js/dist/typeahead.jquery.min',
        'bloodhound': 'lib/typeahead.js/dist/bloodhound.min',
        'twbs-pagination': 'local/twbs-pagination/jquery.twbsPagination.min',
        'simple-pagination': 'local/simple-pagination/jquery.simplePagination.min',
        'jquery-validate': 'lib/jquery-validation/dist/jquery.validate.min',
        'event-source-polyfill': 'local/remy_polyfills/EventSource.min',
        'custom-event-polyfill': 'lib/custom-event-polyfill/polyfill.min',
        'sse-with-post': 'local/SSE/lib/sse.min',
    },
    //when a module/node is created in requireJS
    onNodeCreated: function (node, config, module, path) {
        //for each module, if there is an SRI for it here, append that attribute
        var sri = {
            jquery: 'sha384-tsQFqpEReu7ZLhBV2VZlAu7zcOV+rXbYlF2cqB8txI/8aZajjp4Bqd+V6D5IgvKT',
            moment: 'sha384-fYxN7HsDOBRo1wT/NSZ0LkoNlcXvpDpFy6WzB42LxuKAX7sBwgo7vuins+E1HCaw',
            "css-vars-ponyfill": 'sha384-z73mUz/kFm5ymeA3iCNROmNUqMZUaL5A2o1UmiFiiCDB3WZ2wJoJcVAYgzmH5wSh',
            'bootstrap-select': 'sha384-zAuBzWA4T5uz+4ugsewM1saj+adgdICSplcIdQgyv2hjliSWMm5WkaOXQ6FoPmar',
            'tooltipster': 'sha256-glChvCaC6IJq49dkfulAWd7xlkPwA0FEydjhjPBintA='
        };
        if (sri[module]) {
            node.setAttribute('integrity', sri[module]);
            node.setAttribute('crossorigin', 'anonymous');
        }
    },
    /* Adds mappings for each JS module that can be loaded */
    map: {
        '*': {
            'Common_Widgets': 'modules/Common_Widgets/Common_Widgets',
            'Greenify': 'modules/Greenify/Greenify',
            'Tabs': 'modules/Tabs/Tabs',
            'TestPluginMain': 'modules/TestPlugin/TestPlugin',
            'jquery': 'jquery-private',
            'css': 'lib/require-css/css'
        },
        'jquery-private': { 'jquery': 'jquery' } //special mapping to ensure jquery is substituted with ACTUAL jquery and our above rule doesn't apply to THIS module
    },
    /* shims for modules that aren't compatible directly with require */
    shim: {
        'typeahead': {
            deps: ['jquery'],
            init: function (jquery) {
                return require.s.contexts._.registry['typeahead.js'].factory(jquery);
            }
        },
        'bloodhound': {
            deps: ['jquery'],
            exports: 'Bloodhound'
        },
        'bootstrap4-tagsinput': {
            deps: ['jquery'],
            exports: 'jQuery.fn.tagsinput'
        },
        'twbs-pagination': {
            deps: ['jquery'],
            exports: 'jQuery.fn.twbsPagination'
        },
        'simple-pagination': {
            deps: ['jquery'],
            exports: 'jQuery.fn.pagination'
        },
        'event-source-polyfill': {
            exports: 'EventSource'
        },
        'custom-event-polyfill': {
            exports: 'CustomEvent'
        },
        'sse-with-post': {
            deps: ['custom-event-polyfill'],
            exports: 'SSE'
        },
    }
});
/**
* The entrance function for this plugin for the JS side.
* Calls init, and then calls attachHandlers using jQuery.
*
* This function returns a reference to the plugin, so it is available as a module.
*
* */
define("TestPlugin", ["jquery", 'TestPluginMain'], function (jQuery, Plugin) {
    Plugin.TestPlugin.init(testplugin_GlobalJSData);
    //unset any globals
    testplugin_GlobalJSData = null;
    jQuery(function () {
        Plugin.TestPlugin.attachHandlers();
    });
    return Plugin.TestPlugin;
});
//# sourceMappingURL=testplugin_helper.js.map