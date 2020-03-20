<?php
namespace TestPlugin {
    /**
     * A class used for representing options used when validating an uploaded file
     */
    class FileValidationOptions {
        public $extensions;
        public $categories;
        public $size;
        public $custom;//callbacks

        public function __construct(array $allowexts = [], array $rejectedexts = [], array $allowedcats = [], array $rejectcategories = [], int $sizeLimitMegabytes = 200, $customCallback = null){
            //format extensions array
            $this->extensions = [
                "is" => $allowexts,
                "not" => $rejectedexts
            ];

            $this->categories = [
                "is" => $allowedcats,
                "not" => $rejectcategories
            ];
            $this->size = $sizeLimitMegabytes;
            $this->custom = $customCallback;
        }

        public function toArray():array {
            return [
                'extensions' => $this->extensions,
                'categories' => $this->categories,
                'size' => $this->size,
                'custom' => $this->custom
            ];
        }
    }
}