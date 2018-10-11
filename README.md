# WordPressPluginExample
An example plugin for WordPress, using good practices and [Composer](https://getcomposer.org/).

## Structure
* TestPlugin
  * composer.json - A base composer config file
  * composer.lock - a file to "lock" dependency versions even if dependencies are added / new versions become available (use  ```composer update```)
  * css - a folder for the plugin's CSS files
    * admin.css - CSS loaded for this plugin in admin menus / pages of this plugin
    * user.css - CSS loaded on pages of this plugin accessible to users / anonymous guests
    * global.css - CSS loaded in admin areas AND on user accessible pages
  * js - a folder for the plugin's JavaScript files
    * admin.js - JavaScript for use in admin areas of this plugin
    * user.js - JavaScript for use in user accessible areas of this plugin
    * helper.js - JavaScript loaded in admin areas and user accessible areas of this plugin
  * vendor - composer's folder for dependencies it has downloaded
  * includes - a folder used for source files used by this plugin, namespace mapped via **composer.json**
  * uninstall.php - a standard php file WordPress looks for when uninstalling a plugin
  * test_plugin.php - the "entrance file" for a plugin, designated with the plugin meta comment header

## Notes
* WordPress will always load the entrance file for this plugin whenever this plugin has a "context" (showing in the plugins menu, installing, activating, admin menus, pages, etc)
* Due to the above, the "require" directive for the composer autoloader will always be present for any file of the plugin (assuming normal WordPress lifecycle of course)
* When adding dependencies using composer, make sure to call ```composer dump-autoload``` to refresh the autoloader
* When adding your own files, ensure PHP files are named EXACTLY as the class name, or the autoloader won't find the class file
* Add namespaces in **composer.json** for directories / new files you want to include in the plugin
* You can optimize the autoloader and force it to build a classmap and only use a classmap for loading of class files
