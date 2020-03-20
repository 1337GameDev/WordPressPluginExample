<?php
namespace TestPlugin {
    use Mimey\MimeTypes;
    use Upload\Upload;

    /**
     *  A class used to assist in uploading to WordPress
     * @package TestPlugin
     */
    class WPUploadHelper {
        private static $isDebug = false;
        public static function enableDebug() {WPUploadHelper::$isDebug = true;}
        public static function disableDebug() {WPUploadHelper::$isDebug = false;}
        public static function isDebug():bool {return WPUploadHelper::$isDebug;}

        public function __construct(){

        }

        /**
         *  Get the full path to the WordPress uploads directory
         *
         * @return string The full path to the WordPress uploads directory
         */
        public static function getUploadsDir():string {
            return implode(DIRECTORY_SEPARATOR.DIRECTORY_SEPARATOR,array($_SERVER['DOCUMENT_ROOT'], 'wp-content','uploads'));
        }

        /**
         *  Move a file (provided via $_FILES) that is currently in a temp directory, to a directory relative to the WordPress uploads directory. The destination filename must also be supplied.
         *
         * @param array $uploadedFile The uploaded file associative array (generally provided from $_FILES when uploading)
         * @param string $newFileName The new filename for the uploaded file
         * @param string $subdir The subdirectory to move the file to (relative to the WordPress uploads directory)
         *
         * @return bool Whether the file was moved to the new directory
         */
        public static function moveToUploadsDir(array $uploadedFile, string $newFileName, string $subdir):bool {
            global $wp_filesystem;
            WP_Filesystem();//ensure filesystem has been initialized

            if(WPUploadHelper::isDebug()){
                error_log("----------------------------- moveToUploadsDir -----------------------------");
            }
            $success = false;
            if(!empty($uploadedFile) && !empty($dir)) {
                $rootAndPath = implode(DIRECTORY_SEPARATOR.DIRECTORY_SEPARATOR,array(WPUploadHelper::getUploadsDir(),$subdir));

                if (!file_exists($rootAndPath)) {
                    if(WPUploadHelper::isDebug()){
                        error_log("rootAndPath:".print_r($rootAndPath,true));
                    }

                    mkdir($rootAndPath, 0755, true);
                }

                if(move_uploaded_file($uploadedFile["tmp_name"], $rootAndPath.DIRECTORY_SEPARATOR.DIRECTORY_SEPARATOR.$newFileName )) {
                    $success = true;
                }
            }

            return $success;
        }

        /**
         * Gets the attachment post, and metadata for a given filename/subdirectory
         *
         * @param  string $fileName The filename used in the attachment
         * @param  string $uploadsSubDir The subdirectory (under the WordPress uploads folder) that the filename was specified to be under in the attachment post
         *
         * @return array The array of data for this attachment post (empty if nothing found). The array structure is as follows: ["post"=>post data from get_post(),"meta"=>post meta data from get_post_meta()]
         */
        public static function getAttachmentPostInfoFromFilename(string $fileName = "", $uploadsSubDir = ""):array {
            $result = [];
            $postID = WPUploadHelper::getAttachmentIDFromFilename($fileName, $uploadsSubDir);
            if(!empty($postID)) {
                $postInfo = get_post([
                    "include"=>[$postID],
                    "post_type"=>"attachment"
                ]);

                $metaInfo = get_post_meta($postID);
                $result = [
                    "post"=>$postInfo,
                    "meta"=>$metaInfo
                ];
            }

            return $result;
        }

        /**
         *  Looks up an attachment post record from the WordPress database, and looks for the given filename
         *
         * @param string $fileName The filename to use when looking at attachment posts to find an ID
         * @param string $uploadsSubDir The uploads subdirectory to help look up the file (usually just left blank) <b> Currently unused in SQL logic </b>
         * @param string $postTitlePrefix The prefix to also require to be matched against the post tile
         *
         * @return int The found attachment post record ID from the WordPress database
         */
        public static function getAttachmentIDFromFilename(string $fileName = "", string $uploadsSubDir = "", $postTitlePrefix=""):int {
            global $wpdb;
            $result = 0;
            if(empty($fileName)) {
                return $result;
            }

            //this query looks at the post_title and determines if the filename is present at the end
            $postsTable = $wpdb->prefix.'posts';
            $qry = "SELECT `ID` FROM {$postsTable} WHERE `post_type`='attachment' AND LEFT (`post_title`, LENGTH(`post_title`) - LENGTH(SUBSTRING_INDEX(`post_title`,'_',-1))-1)='%s'";
            $qryParams = [basename($fileName)];

            if(!empty($postTitlePrefix)){
                $qry .= " AND `post_title` LIKE %s";
                $qryParams[] = $postTitlePrefix.'%';
            }
            $qry .= ';';

            $attachmentIdResult = $wpdb->get_col($wpdb->prepare($qry, $qryParams));
            if(!empty($attachmentIdResult)){
                $result = intval($attachmentIdResult[0]);
            }

            return $result;
        }

        /**
         *  Looks up an attachment post record from the WordPress database, based on post_meta parameters
         *
         * @param string $metaTypeKey The key to use when looking at the post_meta WordPress table
         * @param string $type The value (which represents a meta type) when looking at the post_meta WordPress table
         *
         * @return array The resulting attachment info, based on the post_meta key/value (type key and type parameters)
         */
        public static function getAttachmentsOfMetaType(string $metaTypeKey, string $type):array {
            global $wpdb;
            $result = [];
            if(empty($metaTypeKey) || empty($type)) {
                return $result;
            }

            $qryArgs = array(
                'post_status' => 'any',
                'posts_per_page'   => -1,
                'post_type'        => 'attachment',
                'ignore_sticky_posts' => 1,
                'meta_key'         => $metaTypeKey,
                'meta_value'       => $type
            );
            $postInfo = new \WP_Query($qryArgs);
            $postInfo = $postInfo->posts;

            //now get the meta post data
            if(!empty($postInfo)){
                foreach($postInfo as $postToFetch){
                    $baseFilename = basename($postToFetch->guid);
                    $metaInfo = get_post_meta($postToFetch->ID);
                    $result[] = [
                        "post" => $postToFetch,
                        "meta" => $metaInfo
                    ];
                }
            }

            return $result;
        }

        /**
         *  Looks up an attachment post records based on post IDs provided
         *
         * @param array $ids The key to use when looking at the post_meta WordPress table
         *
         * @return array The resulting attachment info, based on the provided post IDs
         */
        public static function getAttachmentInfoFromPostIDs(array $ids):array {
            $result = [];
            if(!empty($ids)){
                $postInfo = get_posts([
                    'post_status' => 'any',
                    "include" => $ids,
                    "post_type" => "attachment",
                    'posts_per_page' => -1,
                    'ignore_sticky_posts' => 1
                ]);

                if(!empty($postInfo)){
                    foreach($postInfo as $postToFetch){
                        $metaInfo = get_post_meta($postToFetch->ID);
                        $result = [
                            "post" => $postToFetch,
                            "meta" => $metaInfo
                        ];
                    }
                }
            }

            return $result;
        }

        /**
         *  Deletes an attachment given an attachment ID
         *
         * @param int $attachmentID The attachment ID to delete
         *
         * @return bool Whether the attachment was deleted
         */
        public static function deleteAttachment(int $attachmentID):bool{
            $deleted = false;

            $attachmentInfo = WPUploadHelper::getAttachmentInfoFromPostIDs([$attachmentID]);
            if(!empty($attachmentInfo)){//attachment exists
                $result = wp_delete_attachment($attachmentID, true);
                if($result !== false){
                    //now delete physical file
                    if(array_key_exists('meta', $attachmentInfo) && array_key_exists('path_under_uploads', $attachmentInfo['meta']) && array_key_exists('base_filename', $attachmentInfo['meta'])) {
                        $fullFilePath = implode(DIRECTORY_SEPARATOR, [WPUploadHelper::getUploadsDir(), $attachmentInfo['meta']['path_under_uploads'][0], $attachmentInfo['meta']['base_filename'][0]]);
                        if(is_file($fullFilePath)) {
                            $deleted = unlink($fullFilePath);
                        }
                    } else {
                        error_log("Unable to delete attachment file for attachment id of \"$attachmentID.\" The post_meta entries for this operation to work, were missing.");
                    }
                }
            }

            return $deleted;
        }

        /**
         *  Creates a post_meta attachment, given file information
         *
         * @param string $filename The filename of the attachment
         * @param string $originalFilename The original (full filename) of the attachment when uploaded (including extension)
         * @param string $pathUnderUploads The path (relative to the WordPress uploads directory) that the physical file is stored for this attachment
         * @param array $otherMeta Any other meta data to associate with the attachment when it is is saved (this is an associative array of key/value pairs to be inserted into the post_meta WordPress table)
         *
         * @return array The associative array with the attachment info
         */
        public static function addAttachment(string $filename, string $originalFilename, string $pathUnderUploads="", array $otherMeta = []):array {
            $attachmentAdded = [];
            if(!empty($filename)){
                //convert any backslashes to forward slashes
                $URLpathUnderUploads = UtilityFunctions::convertPathToURL($pathUnderUploads);
                //add a filter to stop thumbnail creation
                add_filter('intermediate_image_sizes_advanced',array(static::class,'remove_default_image_sizes'),99999);
                $filetype = wp_check_filetype(basename($filename), null);
                $attachment = array(
                    'guid' => site_url().'/wp-content/uploads/'.$URLpathUnderUploads.'/'.$filename,
                    'post_mime_type' => $filetype['type'],
                    'post_title' => preg_replace('/\.[^.]+$/', '', basename($filename)),
                    'post_content' => '',
                    'post_status' => 'inherit'
                );

                // Insert attachment to the database
                $attachmentID = wp_insert_attachment($attachment, $filename);
                if($attachmentID !== 0){//if the attachment saved successfully
                    if(!function_exists('wp_crop_image')){
                        include(ABSPATH . 'wp-admin/includes/image.php');
                    }

                    // Generate meta data
                    $attach_data = wp_generate_attachment_metadata($attachmentID, $filename);
                    wp_update_attachment_metadata($attachmentID, $attach_data);
                    //remove our filter that stops thumbnail creation
                    remove_filter('intermediate_image_sizes_advanced', array(static::class, 'remove_default_image_sizes'), 99999);

                    //add the attachment post id
                    $attachment["ID"] = $attachmentID;

                    //add any custom data to include with this image
                    $metaInfo = [];
                    $otherMeta["base_filename"] = $filename;
                    $otherMeta["original_filename"] = $originalFilename;
                    $otherMeta["path_under_uploads"] = $pathUnderUploads;

                    foreach($otherMeta as $key => $value){
                        add_post_meta($attachmentID, $key, $value, true);
                        $metaInfo[$key] = $value;
                    }

                    $attachmentAdded = [
                        "post"=>$attachment,
                        "meta"=>$metaInfo
                    ];
                }
            }

            return $attachmentAdded;
        }

        /**
         *  A filter to remove all WordPress actions that generate alternative image sizes (useful if storing plugin images/uploads as attachments, but don't want a bunch of extra resources created)
         *  This is invoked using the filter:
         *  add_filter('intermediate_image_sizes_advanced',array(static::class,'remove_default_image_sizes'),99999);
         */
        public static function remove_default_image_sizes($sizes) {
            unset($sizes['thumbnail']);
            unset($sizes['small']);
            unset($sizes['medium']);
            unset($sizes['medium_large']);
            unset($sizes['large']);
            return $sizes;
        }
    }
}