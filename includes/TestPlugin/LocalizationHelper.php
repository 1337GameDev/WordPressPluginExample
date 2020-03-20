<?php
namespace TestPlugin {
    class LocalizationHelper {

        /**
         * Returns the list of locales (sorted based on priority) from HTTP_ACCEPT_LANGUAGE.
         *
         * @return  array Array of locales (sorted based on priority), where the locale is the key and the value is the priority
         */
        public static function getAllLocalesFromRequest() {
            $preferredLocales = [];
            if(array_key_exists('HTTP_ACCEPT_LANGUAGE', $_SERVER)) {
                $preferredLocales = array_reduce(
                    explode(',', $_SERVER['HTTP_ACCEPT_LANGUAGE']),//get array of all locales from this header
                    function ($res, $el) {
                        list($l, $q) = array_merge(explode(';q=', $el), [1]);//split on the "priority" number of each (the q= part of each local entry)
                        $res[$l] = (float)$q;//store priority with locale it belongs to
                        return $res;
                    },
                    []//start with empty array as output
                );
                arsort($preferredLocales);//sort the array by priority
            }
            return $preferredLocales;
        }

        /**
         * Removes "specialization" of a locale string
         * EG: en-US -> en, zh-hk -> zh
         *
         * @param string The locale string to simplify
         *
         * @return  string The locale, without the specialization
         */
        public static function removeLocaleSpecialization($locale) {
            return explode('-',$locale)[0];
        }

        /**
         * Retrieves "specialization" of a locale string
         * EG: en-US -> US, zh-hk -> hk
         *
         * @param string The locale string to get the specialization for
         *
         * @return  string The specialization of the locale (or "" if locale doesn't have a specialization)
         */
        public static function getLocaleSpecialization($locale) {
            $spec = "";
            if (strpos($locale,'-') !== false) {
                $specArray = explode('-',$locale);
                array_shift($specArray);
                $spec = implode('-',$specArray);
            }
            return $spec;
        }

        /**
         * Check if a locale is valid formatted.
         *
         * @param string $locale The locale to check.
         *
         * @return bool True if is a valid locale format, false if not.
         */
        public static function isValidLocale($locale) {
            return (bool) preg_match('#^[a-z]{2}_[A-Z]{2}(\\S+)?$#', $locale);
        }

        public static function getLocalizationInfo(){
            $localesWanted = LocalizationHelper::getAllLocalesFromRequest();
            $localeToUse = "en";//the default

            if(!empty($localesWanted)) {
                reset($localesWanted);//ensure "iterator" of array is set to the front
                $localeToUse = key($localesWanted);//get first locale from array (locales in this array are KEYS)
            }

            $spec = LocalizationHelper::getLocaleSpecialization($localeToUse);
            $simplifiedLocale = LocalizationHelper::removeLocaleSpecialization($localeToUse);

            return [
                "locales_preferred" => $localesWanted,
                "preferred_locale" => $localeToUse,
                "preferred_simplified_locale" => $simplifiedLocale,
                "preferred_locale_specialization" => $spec
            ];
        }

        /**
         * Outputs HTML for localization settings. The HTML has an id of "localize_settings"
         *
         * @param array $localizeInfo The localization information to use to output
         * @param string $pageName The name of the page this is for, used to load the right JSON for the page
         * @param string $rootDir The root directory of the JS folder
         */
        public static function outputLocalizationInfo($localizeInfo, $pageName, $rootDir) {
            $localizeInfo["page_name"] = $pageName;
            $langJSONPath = implode(DIRECTORY_SEPARATOR,[$rootDir,"js","localization","i18n"]);

            $langJSON = JSONHelper::load_json_file($pageName."-".$localizeInfo["preferred_simplified_locale"], $langJSONPath);
            if($langJSON === FALSE) {
                //error
            } else {
                $decodedJson = NULL;
                //ensure data is "flat" from the file
                if(is_array($langJSON)) {
                    foreach ($langJSON as $json) {
                        $decodedJson = array_merge($decodedJson, json_decode($json, true));
                    }
                } else {
                    $decodedJson = json_decode($langJSON, true);
                }

                //get available languages
                $localizeInfo["available_languages"] = LocalizationHelper::getAvailableLanguagesForPage($pageName, $rootDir);
                $localizeInfo["preferred_lang_messages"] = $decodedJson;
                unset($localizeInfo["preferred_lang_messages"]["@metadata"]);
                ?>

                <span class="hidden" id="localize_settings" data-localization-settings="<?php echo htmlspecialchars(json_encode($localizeInfo),ENT_QUOTES,'UTF-8'); ?>"></span>
                <?php
            }
        }

        public static function doLocalizationSetupForPagename($pageName, $rootDir) {
            $locale_info = LocalizationHelper::getLocalizationInfo();
            LocalizationHelper::outputLocalizationInfo($locale_info, $pageName, $rootDir);
        }

        public static function getAvailableLanguagesForPage($pageName, $rootDir) {
            $result = [];
            $languageJSONFilePath = implode(DIRECTORY_SEPARATOR,[$rootDir,"js","localization","i18n"]);
            $langFiles = glob($languageJSONFilePath.DIRECTORY_SEPARATOR."{".$pageName."}-*.json", GLOB_BRACE);

            foreach ($langFiles as $file) {
                $lang = str_replace($pageName."-","",basename($file,'.json'));
                array_push($result, $lang);
            }

            return $result;
        }

    }
}
