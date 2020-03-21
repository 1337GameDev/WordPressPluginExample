## Project Structure
* TestPlugin (the root folder of the plugin)
  * composer.phar - A PHP archive of composer to use in this project
  * composer.json - A base composer config file
  * composer.lock - A file to "lock" dependency versions even if dependencies are added / new versions become available (use  ```composer update``` to ignore this file and update anyways)
  * css - A folder for the plugin's CSS files
    * components - A folder to hold CSS for any web-components
    * admin - All admin-related CSS resource reside in this folder
      * admin.css - CSS loaded for this plugin in admin menus / pages of this plugin
      * pages - A directory to organize CSS for admin pages
        * testplugin.css - The CSS for the "testplugin" admin page
    * user - All user-related CSS resource reside in this folder
      * user.css - CSS loaded on pages of this plugin accessible to users / anonymous guests
      * pages - A directory to organize CSS for user pages
        * testpluginuser - A directory to organize CSS for the "testpluginuser" user page
          * testpluginuser.css - The CSS for the "testpluginuser" user page
    * global - Any globally available CSS
      * global.css - CSS loaded in admin areas AND on user accessible pages
    * local - A folder for local copies of CSS for plugins, not fetched through a package manager
  * js - a folder for the plugin's JavaScript files
    * admin - A folder for all admin related JS
      * pages - All admin page specific JS is under this folder
        * testplugin - A folder for JS resources for the "testplugin" named admin page
          * testplugin.js - The JS file loaded for the "testplugin" page
      * admin.js - JavaScript for use in admin areas of this plugin
    * compoennts - JS for any web component defined
    * fallbacks - Fallback scripts manually loaded, and generally included via a CDN, but these are local copies as backups if the CDN fails
    * lib - The cache of NPM / yarn dependencies
    * local - Manually fetched scripts that aren't loaded from NPM / yarn
    * localization - Scripts and resources for localization via i18N
    * modules - TypeScript / EXCMAScript 6 JS modules
      * Common_Widgets - Basic jQuery oriented widgets, that are class based for ease of creation
      * Greenify - An example jQuery plugin that simply sets the "background-color" via CSS of a targeted element.
      * Tabs - A jQuery plugin for Tabs and handlers for it
      * testModule - A basic module that cna be loaded
      * TestPlugin - The module for the TestPlugin WordPress plguin that is meant as a good starting point for WordPress plugin development
    * user - A folder for all user related JS  
      * pages - All user specific JS is under this folder
        * testpluginuser - A folder for JS resources for the "testpluginuser" named page
      * user.js - JavaScript for use in user accessible areas of this plugin
    * testplugin_helper.js - JavaScript loaded in admin areas and user accessible areas of this plugin
  * images - A folder to organize this plugin's images
  * vendor - composer's folder for dependencies it has downloaded
  * includes - A folder used for source files used by this plugin, namespace mapped via **composer.json**
    *lodev09 - A copy of "lodev09/php-upload" that fixes a bug, and i didn't want to make a pull request at the time
    * TestPlugin - The root of the PHP files for the example WordPress plugin
      * AjaxFunctionClasses - A folder with the AJAX functions classes - which simplify the admin/user plugin ajax classes (where they only have to check parameters and authenticate the user)
      * Certs - A folder with copies of root certificates, for user with SSL and [Certainty](https://github.com/paragonie/certainty)
      * Config - A folder with any configuration file for the plugin - to help centralize them and make them easier to secure
      * ContentHelpers - Classes / Files to help with a variety of content
        * AjaxResponse.php - A class that is used to help type responses from AJAX calls
        * AjaxResponseWithHTML.php - A class that is used to help type responses from AJAX calls, BUT also includes HTML in the response
        * CSSLoader.php - Helps load and verify CSS files used by the plugin
        * CSSResource.php - A class used to represent a CSS file to be loaded / enqueued by the plugin
        * DependencyInfo.php - A class used to represent a plugin dependency - such as another WordPress plugin
        * FileUploadHelper.php - A class used to help with uploading files
        * FileValidationOptions.php - A class used to represent options to validate an uploaded file
        * FileValidationResult.php - A class used to represent a result when validating an uploaded file
        * INIHelper.php - A class used to read INI files
        * JSLoader.php - A class used to load and validate JS files to be loaded or enqueued by the plugin
        * JSONHelper.php - A class used to read JSON files, as well as format / encode JSON responses
        * JSResource.php - A class used to represent a JS file to be loaded / enqueued by the plugin 
        * JSResourceLocalizedData.php - A class used to represent data that will be passed to a JS file via the WordPress function "localize_script"
        * PageInfo.php  - A class used to represent a page this plugin will generate / manage
        * PageManager.php - A class used to manage pages for this plugin
        * UploadException.php - A class used to represent an exception that cna be thrown when validating an uploaded file
        * WPUploadHelper.php - A file used to handle WorDPress specific upload functions
      * DataServiceHelpers - A folder for resources that are related to dat services / databases
        * ServiceHelpers
          * RDSHelper.php - A class file used to help interact with AWS RDS
          * S3Bucket.php - A class file used to help interact with an AWS S3 Bucket
          * S3Helper.php - A class file used to help interact with AWS S3
        * AWSHelper.php - A class file used to keep a connection / config for AWS
        * DBResult.php - A class that represents a result from a database operation
        * FieldCondition.php - A class used to represent a condition on an object field, of a database -- to be used by ModelBase
        * FieldConditionGroup.php - A class used to represent Groups of FieldConditions, to help join them
        * PDOConnectionInfo.php - A class to represent information to connect to a database via PDO
        * PDOHelper.php - A class used to connect to a database via PDO
        * PDOHelperContainer.php - An interface used to specify that a type has a PDOHelper as its data source and provides a way to get it
        * SessionHelper.php - A convenience class to interact with a PHP session
        * SQLLoader.php - A class used to read SQL files, and hold information about a database to load SQL for
        * YouTubeHelper.php - A class used to assist with YouTube data operations
        * YouTubeSearchResult.php - A class used to represent a YouTube search result
      * Models - A folder to hold PHP files related to the rudimentary ORM
        * Classes - A folder with model classes - subclasses of ModelBase
        * ManyToMany.php - A class that signals to ModelBase that the model class represents a "many-to-many" relationship between 2 models
        * ModelBase.php - The base class for the rudimentary ORM
        * ModelCache.php - A class used by ModelBase to cache loaded models for a request, to reduce redundant database calls
        * ModelDataHelper.php - A class used to help get data about the models at runtime. Is subclassed by "TestPluginModelDataHelper" to provide TestPlugin specific model data
        * Referencable.php - A class used by ModelBase to know if an object can be referenced ina  field, and how to "convert" that reference when saving/loading
        * TestPluginModelDataHelper.php - A specific class for model information for this plugin
        * Translatable - An interface that denotes a model class is able to be translated, and what fields are translated
      * SQL - A folder that holds SQL files used by ModelBase as well as other places in this plugin
      * Templates - A folder to organize template files used by this plugin
        * Pages - A folder with templates for pages this plugin generates / manages
          * base-template.php - The base template file that loads templates for pages
          * admin - Holds admin-specific template files
          * user - Holds user-specific template files
      * BasicEnum.php - A basic implementation of an enum for PHP
      * DependencyType.php - A BasicEnum subclass, to denote a type of dependency for this plugin (such as another WordPress plugin)
      * IntervalType.php - A BasicEnum subclass, to denote a type of interval used for converting a span of time
      * LocalizationHelper.php - A class used to help with localization and outputting necessary script/HTML for i18n to work
      * NoticeType.php - A BasicEnum subclass, to denote a WP admin notice message
      * Template.php - A basic templating engine for PHP (I chose to NOT use [Smarty](https://www.smarty.net/) for simplicity as Smarty can get ugly)
      * TestPlugin_Admin.php - Handles hooking into WP_Admin, as well as outputting admin pages / styles
      * TestPlugin_AdminAjax.php - Registers AJAX endpoints for admin-side calls/responses. 
      * TestPlugin_Class.php - The **core** class of the plugin. Sets up activation, install, deactivation, and various other hooks for the lifecycle of the plugin. 
      * TestPlugin_Hooks.php - A class file that organizes and registers hooks/actions this plugin calls, and OTHER plugins can call from this plugin
      * TestPlugin_Options.php - Handles CRUD operations with WordPress options for this plugin. This class is meant to centralize option names, as well as scope them for this plugin to avoid clashing with other option names.
      * TestPlugin_UserAjax.php - Registers AJAX endpoints for **user** endpoints. These are to be used by non-authenticated users, such as for loading things on the front-end of the site. 
      * UtilityFunctions.php - A helper class for simplifying common operations performed for plugins / php.   
    * node_modules - A folder used for packages fetched via npm, depicted by **package-lock.json**
    * test_plugin.php - The "entrance file" for a plugin, designated with the plugin meta comment header
    * tsconfig.json - The TypeScript configuration file
    * yarn.lock - The lockfile used by yarn - a package manager based on NPM with extra utilities / versatility
    * package.json - The packages file used by NPM
    * package-lock.json - The lockfile for NPM
    