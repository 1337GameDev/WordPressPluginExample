<?php
namespace TestPlugin {
    /**
    * A class used to represent a page used/generated by this plugin
     * @package TestPlugin
    * */
    class PageInfo {
        public $pageTitle = "";
        public $pageName = "";
        public $pageTemplateFilename = "";
        public function __construct($pageName, $pageTitle, $pageTemplateFilename = "") {
            $this->pageName = $pageName;
            $this->pageTitle = $pageTitle;
            $this->pageTemplateFilename = $pageTemplateFilename;
        }

        /**
         * Determines if the current WordPress page being rendered IS this page (based on "pageName")
         *
         * @return bool Whether this page is currently being rendered
         */
        public function isCurrentPage() {
            return is_page($this->pageName);
        }

        /**
         * Gets a nicely formatted post name for this page, so WordPress can use that to save this page
         *
         * @return string The WordPress post name of this page (used when saving the page to the WordPress database as a post record)
         */
        public function getPostName(){
             return str_replace(" ","-",strtolower($this->pageName) );
        }
    }
}

