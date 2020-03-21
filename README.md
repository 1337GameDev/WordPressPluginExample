# TestPlugin - A WordPress Plugin Example
 > An example plugin for [WordPress](https://wordpress.com/), using good practices and [Composer](https://getcomposer.org/).

<p float="left">
  <img src="./images/wordpress-logo.jpg?raw=true" width="100" height="100" title="WordPress">
  <img src="./images/composer.png?raw=true" width="100" height="122" title="Composer">
  <img src="./images/icons8-typescript-150.png?raw=true" width="122" height="122" title="TypeScript">
  <img src="./images/require-js.png?raw=true" width="110" height="122" title="RequireJS">
</p>

![Screenshot of tiny-helpers.dev](./github_data/screenshot_folders.png)

# Features
 - A basic [WordPress plugin entrance file](./test_plugin.php), to keep things concise
 - An object oriented plugin design
 - Takes advantage of [PHP7](https://www.php.net/manual/en/migration70.new-features.php) hinting (some areas don't use it, but can easily be added)
 - [Helpers](./includes/TestPlugin/DataServiceHelpers/PDOHelper.php) for connecting to a PDO capable database. Currenly, it is assumed it is a MySQL database, so if you want other database engines, you might need to subclass / add custom support.
 - Helpers for loading [.ini](./includes/TestPlugin/ContentHelpers/INIHelper.php), [.json](./includes/TestPlugin/ContentHelpers/JSONHelper.php), [.js](./includes/TestPlugin/ContentHelpers/JSLoader.php), [.css](./includes/TestPlugin/ContentHelpers/CSSLoader.php), and various other file handling
 - [Hooks and actions](./includes/TestPlugin/TestPlugin_Hooks.php) that this plugin can hook to **AND** provide for **OTHER** plugins to hook 
 - [Custom plugin roles/capabilities](./includes/TestPlugin/TestPlugin_Class.php#L236) that are [added to WordPress](./includes/TestPlugin/TestPlugin_Class.php#L1162) to be used for plugin authorization.
 - A [rudimentary ORM](./includes/TestPlugin/Models/ModelBase.php) using a base class and common column/field naming in a class
 - Support for i18n localization with a PHP helper [class](./includes/TestPlugin/LocalizationHelper.php), and [output of localization data](./includes/TestPlugin/TestPlugin_Hooks.php#L35) (and loading of i18n with [helper functions](./js/localization/localizeSetup.js) for JavaScript)
 - A [basic enum class](./includes/TestPlugin/BasicEnum.php) to simulate Enums, as PHP doesn't natively support them.
 - A [SQL loading class](./includes/TestPlugin/DataServiceHelpers/SQLLoader.php), for handling SQL files. This currently ONLY supports MySQL syntax / escaping, but it can be subclassed / extended to add other languages.
 - A [rudimentary template system](./includes/TestPlugin/Template.php), with an implicit data loading PHP for each page via a [page template](./includes/TestPlugin/Templates/Pages/base-template.php)
 - [Management of plugin generated pages](./includes/TestPlugin/ContentHelpers/PageManager.php), [CSS](./includes/TestPlugin/ContentHelpers/CSSResource.php), [JS](./includes/TestPlugin/ContentHelpers/JSResource.php), [dependencies](./includes/TestPlugin/ContentHelpers/DependencyInfo.php) on other WordPress plugins, and [plugin integrity checks](./includes/TestPlugin/TestPlugin_Class.php#L1043)
 - **STRONGLY** uses the [WordPress lifecycle](https://codex.wordpress.org/Plugin_API/Action_Reference) for plugin operations
 - Adds support for [SRI](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) for [JS](./includes/TestPlugin/ContentHelpers/JSResource.php) / [CSS](./includes/TestPlugin/ContentHelpers/CSSResource.php) that WordPress doesn't support natively (as far as I can tell)
 - Has a [function](./includes/TestPlugin/TestPlugin_Class.php#L705) to easily hide assets uploaded to wp_content from the normal WordPress Media Gallery
 - Custom [CSS](./includes/TestPlugin/TestPlugin_Class.php#L1027) / [JS](./includes/TestPlugin/TestPlugin_Class.php#L1002) script tag output functions, to include SRI and other cross-origin attributes.
 - Includes Helpers for [AWS](./includes/TestPlugin/DataServiceHelpers/AWSHelper.php) [S3](./includes/TestPlugin/DataServiceHelpers/ServiceHelpers/S3Helper.php) and [RDS](./includes/TestPlugin/DataServiceHelpers/ServiceHelpers/RDSHelper.php) usage
 - A [class for managing WordPress options](./includes/TestPlugin/TestPlugin_Options.php) for this plugin
 - Organization for AJAX endpoints ([admin](./includes/TestPlugin/TestPlugin_AdminAjax.php) and [user](./includes/TestPlugin/TestPlugin_UserAjax.php)-side), data structures, and easy way to [generate](./includes/TestPlugin/ContentHelpers/JSONHelper.php#L129) [responses](./includes/TestPlugin/ContentHelpers/AjaxResponse.php) with/without a nonce
 - A [utility functions class](./includes/TestPlugin/UtilityFunctions.php) with various helpful functions
 - A [TypeScript](./https://www.typescriptlang.org/) JavaScript [module](./js/modules/TestPlugin) for the plugin
 - [Setup](./js/testplugin_helper.ts) for [RequireJS](./https://requirejs.org/) module loader
 - Includes an object-oriented [jQuery](https://jquery.com/) widget [module](./js/modules/Common_Widgets), for easy widget creation
 - Uses `yarn` Node package manager (improves upon NPM). More info about yarn [here](https://yarnpkg.com/).

# Project Structure
You can find a document with the project structure [here](./ProjectStructure.md).

# WordPress Plugin Dependencies
 - [User Role Editor](https://wordpress.org/plugins/user-role-editor/) by Vladimir Garagulya - For managing roles of users, and allowing multiple roles to be assigned. If you don't use these, this cna be removed, but then you will only be able to assign **ONE** user role to a WordPress user.

# Notes
## Composer
* WordPress will always load the [entrance file](./test_plugin.php) for this plugin whenever this plugin has a "context" (showing in the plugins menu, installing, activating, admin menus, pages, etc)
* Due to the above, the "require" directive for the composer autoloader will always be present for any file of the plugin (assuming normal WordPress lifecycle of course)
* When adding dependencies using composer, make sure to call ```composer dump-autoload``` to refresh the autoloader
* When adding your own files, ensure PHP files are named EXACTLY as the class name, or the autoloader won't find the class file
* Add namespaces in **composer.json** for directories / new files you want to include in the plugin
* You can optimize the autoloader and force it to build a classmap and only use a classmap for loading of class files
* Further usage tips / instruction for composer can be foudn on the official [site](https://getcomposer.org/doc/00-intro.md).

## TypeScript 
* You should test your compilation of TypeScript in your IDE when deploying / making changes. You might need to configure / reference the TypeScript library/compiler to enable support if the IDE doesn't support it out-of-the-box.

## Minifying
* I currently have used YUICompressor for CSS and UglifyJS for JS minifictaion. There are likely newer tools, as both of these are likely not as robust. 
* There **IS** a bug with YUICompressor and `calc` usage in CSS. If you have a statement like the following: `calc(50% + 15px)` it will **INCORRECTLY** minify it to `calc(50%+15px)` which will fail to execute in the browser (the + needs spaces). You can "fix" this by subtracting a negative, eg: `calc(50% - -15px)` and it'll honor the spacing. The bug is documented [here](https://github.com/yui/yuicompressor/issues/59).
* There **IS** a bug with YUICompressor that will incorrectly minify transform and animation states. I haven't found a good fix without much manual work, but the bug is documented [here](https://github.com/yui/yuicompressor/issues/99).
* These bugs are **VERY UNLIKELY** to be fixed, so other minifier tools are likely the best option, i just put up with these for this project to avoid too many distractions.

## RequireJS
* A common error with this is when you load a JS file AFTER requireJS, using a standard script tag. This can cause an exception because the module is loaded in a way that bypasses the module loader. This is documented [here](https://requirejs.org/docs/errors.html#mismatch) and usually has the message of `Error: Mismatched anonymous define() module:`.
* Ensure that no extra imports are done BEFORE the requirejs method call when loading modules (ONLY modules should use imports - not script tags). Sometimes the IDE can add these automatically if it's "trying" to be helpful, so check this first.
* Ensure WordPress or other plugins/etc aren't loading files AFTER your scripts. This can be done with a [special function](./includes/TestPlugin/UtilityFunctions.php#L590) to ensure your "enqueue scripts" function is called last in the chain in the footer. This is already used by the plugin [here](./includes/TestPlugin/TestPlugin_Class.php#L425).
