# WordPressPluginExample
An example plugin for WordPress, using good practices and [Composer](https://getcomposer.org/).

<p float="left">
  <img src="https://github.com/1337GameDev/WordPressPluginExample/blob/master/images/wordpress-logo.jpg?raw=true" width="100" height="100" title="WordPress">
<img src="https://github.com/1337GameDev/WordPressPluginExample/blob/master/images/composer.png?raw=true" width="100" height="122" title="Composer">
</p>

## Structure
* TestPlugin
  * composer.phar - a PHP archive of composer to use in this project
  * composer.json - A base composer config file
  * composer.lock - a file to "lock" dependency versions even if dependencies are added / new versions become available (use  ```composer update``` to ignore this file and update anyways)
  * css - a folder for the plugin's CSS files
    * admin.css - CSS loaded for this plugin in admin menus / pages of this plugin
    * user.css - CSS loaded on pages of this plugin accessible to users / anonymous guests
    * global.css - CSS loaded in admin areas AND on user accessible pages
  * js - a folder for the plugin's JavaScript files
    * admin.js - JavaScript for use in admin areas of this plugin
    * user.js - JavaScript for use in user accessible areas of this plugin
    * helper.js - JavaScript loaded in admin areas and user accessible areas of this plugin
  * images - a folder to organize this plugin's images
  * vendor - composer's folder for dependencies it has downloaded
  * includes - a folder used for source files used by this plugin, namespace mapped via **composer.json**
    * BasicEnum.php - A basic implementation of an enum for PHP
    * NoticeType.php - A BasicEnum subclass, to denote a WP admin notice message
    * Template.php - A basic templating engine for PHP (I chose to NOT use [Smarty](https://www.smarty.net/) for simplicity as Smarty can get ugly)
    * TestPlugin_Admin.php - Handles hooking into WP_Admin, as well as outputting admin pages / styles
    * TestPlugin_AdminAjax.php - Registeres AJAX endpoints for admin-side calls/responses. 
    * TestPlugin_Class.php - The **core** class of the plugin. Sets up activation, install, deactivation, and various other hooks for the lifecycle of the plugin. 
    * TestPlugin_Options.php - Handles CRUD operations with WordPress options for this plugin. This class is meant to centralize option names, as well as scope them for this plugin to avoid clashing with other option names.
    * TestPlugin_UserAjax.php - Registers AJAX endpoints for **user** endpoints. These are to be used by non-authenticated users, such as for loading things on the front-end of the site. 
    * UtilityFunctions.php - A helper class for simplifying common operations performed for plugins / php.
    * DataServiceHelpers - Contains classes used for accessing/manipulating data
      * AzureBlobStorageHelper.php - Used to assist connecting to Azure Blob Storage, using the Azure PHP API.
      * AzureSQLDBHelper.php - Used for accessing an Azure MSSQL database.
      * DataSource.php - An interface to abstract a DB-like connection. Facilitates easy swapping of data sources, as well as testing (can swap in a mock data source). 
      * SQLLoader.php - A file used to load ``.sql`` files into PHP arrays for doing database operations. Helpers to keep SQL code **out** of PHP files. Also handles database prefixes, and using a dynamic collation based on the source DB collation.
      * WPDataSource.php - An abstraction of **wpdb** (or a custom wpdb object), to enforce strong transaction usage. **WARNING** The table being operated on needs to use the storage engine of **InnoDB** and **NOT** MyISAM (the default WordPress database engine). The default engine does NOT support transactions. Use the MyISAM engine if you plan to have mostly STATIC data.
  * node_packages - a folder used for packages fetched via npm, depicted by **package-lock.json**
  * uninstall.php - a standard php file WordPress looks for when uninstalling a plugin
  * test_plugin.php - the "entrance file" for a plugin, designated with the plugin meta comment header

## Notes
* WordPress will always load the entrance file for this plugin whenever this plugin has a "context" (showing in the plugins menu, installing, activating, admin menus, pages, etc)
* Due to the above, the "require" directive for the composer autoloader will always be present for any file of the plugin (assuming normal WordPress lifecycle of course)
* When adding dependencies using composer, make sure to call ```composer dump-autoload``` to refresh the autoloader
* When adding your own files, ensure PHP files are named EXACTLY as the class name, or the autoloader won't find the class file
* Add namespaces in **composer.json** for directories / new files you want to include in the plugin
* You can optimize the autoloader and force it to build a classmap and only use a classmap for loading of class files
