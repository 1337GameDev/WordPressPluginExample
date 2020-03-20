/**
 * A simple file that can be included with any plugin to have a front-end cache of loaded plugins
 */

var LoadedPlugins = LoadedPlugins || {};
var GlobalJSData = GlobalJSData || {};

jQuery(document).ready(function() {
    let pluginKey = GlobalJSData.pluginName;

    if(typeof LoadedPlugins[pluginKey] === 'undefined') {
        LoadedPlugins[pluginKey] = true;
    }

    jQuery('body').trigger("wp-plugin-loaded", pluginKey);
});