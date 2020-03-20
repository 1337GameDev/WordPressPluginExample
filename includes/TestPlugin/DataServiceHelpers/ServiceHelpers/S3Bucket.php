<?php
namespace TestPlugin\DataClasses\ServiceHelpers {
    use TestPlugin\DBResult;
    use TestPlugin\UtilityFunctions;

    /**
     * A class that helps connect and use an Amazon Web Services S3 Bucket
     * */
    class S3Bucket {
        private $s3helper;
        private $bucketConfig;
        private $bucketVerified = false;

        private $bucketName = "";
        public function getBucketName():string {return $this->bucketName;}

        private $filePrefix = "";
        public function getBucketFilePrefix():string {return $this->filePrefix;}
        private $defaultDir = "";
        public function getBucketDefaultDirectory():string {return $this->defaultDir;}

        public function __construct(S3Helper $s3helper, array $bucketConfig) {
            $this->s3helper = $s3helper;
            $this->bucketConfig = $bucketConfig;

            if(empty($bucketConfig) || !array_key_exists("name",$this->bucketConfig)) {
                throw \Exception("The config for the bucket is not valid.");
            }

            $this->bucketName = $this->bucketConfig["name"];

            if(array_key_exists("default_dir",$this->bucketConfig)) {
                $this->defaultDir = $this->bucketConfig['default_dir'];
            }

            if(array_key_exists("file_prefix",$this->bucketConfig)) {
                $this->filePrefix = $this->bucketConfig['file_prefix'];
            }

            if(empty($s3helper)) {
                throw \Exception("The S3Helper for the bucket \"$this->bucketName\"is not valid.");
            }
        }

        /**
         * Checks if the AWS S3 Bucket represented by this class, actually exists
         *
         * @return bool Whether this AWS S3 Bucket exists
         */
        public function bucketExists():bool {
            $exists = false;
            try {
                $result = $this->s3helper->getS3Client()->headBucket([
                    'Bucket' => $this->bucketConfig["name"]
                ]);
                $exists = true;
                $this->bucketVerified = true;
            } catch (\Exception $e) {}

            return $exists;
        }

        /**
         * Uploads a file to the S3Bucket
         *
         * This function, using the $file path (or temp file path for uploaded files), the path wanted in the S3 bucket, and filename, will upload the file to the bucket.
         *
         * @param string $file The file path
         * @param string $bucketPath The path in the bucket to store the file (if it doesn't exist, it'll be created explicitly)
         * @param string $filename The file name wanted in the bucket (with the bucket file prefix prepended)
         * @param callable $progressCallback An optional callback to be used for tracking progress of the upload. The signature looks like the below:
         * function ($downloadTotalSize, $downloadSizeSoFar, $uploadTotalSize, $uploadSizeSoFar)
         *
         * @return DBResult The result of the operation.
         */
        public function uploadToBucket($file, $bucketPath, $filename, $progressCallback = null):DBResult {
            $uploadResult = new DBResult();
            $bucketPath = str_replace(['//', ' '], ['/', ''], trim($bucketPath) );

            if(empty($file) || empty($filename)) {
                return $uploadResult;
            }

            $fileKey = $this->defaultDir.'/'.$bucketPath.'/'.$this->filePrefix.$filename;

            $params = [
                'Bucket' => $this->bucketConfig["name"],
                'Key'    => $fileKey,
                'SourceFile' => $file
            ];

            if(!empty($progressCallback) && is_callable($progressCallback)) {
                $params['@http'] = ['progress' => $progressCallback];
            }

            try {
                $result = $this->s3helper->getS3Client()->putObject($params);
                if($result === false) {
                    throw new \Exception('Uploading the file "'.$fileKey.'" to AWS S3 failed.');
                } else {
                    $uploadResult->result = ["aws_result" => $result, "file_key" => $fileKey];
                    $uploadResult->success = true;
                }
            } catch (\Exception $e) {
                $uploadResult->addMessage('uploadToBucket-Exception:'.print_r($e->getMessage(),true));
            }

            return $uploadResult;
        }

        /**
         * Uploads a file to the S3Bucket
         *
         * This function, using the $file path (or temp file path for uploaded files), the path wanted in the S3 bucket, and filename, will upload the file to the bucket.
         *
         * @param string $file The file path
         * @param string $bucketPath The path in the bucket to store the file (if it doesn't exist, it'll be created explicitly)
         * @param string $filename The file name wanted in the bucket (with the bucket file prefix prepended)
         * @param callable $progressCallback An optional callback to be used for tracking progress of the upload. The signature looks like the below:
         * function ($downloadTotalSize, $downloadSizeSoFar, $uploadTotalSize, $uploadSizeSoFar)
         *
         * @return DBResult The result of the operation.
         */
        public function deleteFromBucket($fileKey):DBResult {
            $deleteResult = new DBResult();

            if(empty($fileKey)) {
                return $deleteResult;
            }

            $params = [
                'Bucket' => $this->bucketConfig["name"],
                'Key'    => $fileKey
            ];

            try {
                $result = $this->s3helper->getS3Client()->deleteObject($params);
                if($result === false) {
                    throw new \Exception('Deleting the file "'.$fileKey.'" from AWS S3 failed.');
                } else {
                    $deleteResult->success = true;
                }
            } catch (\Exception $e) {
                $deleteResult->addMessage('uploadToBucket-Exception:'.print_r($e->getMessage(),true));
            }

            return $deleteResult;
        }

        public function getBucketContents($showAll = false) {
            $listParams = [
                'Bucket' => $this->bucketConfig["name"],
                //'ContinuationToken' => '<string>',
                //'Delimiter' => '/',
                //'EncodingType' => 'url',
                //'FetchOwner' => true || false,
                //'MaxKeys' => <integer>,
                //'RequestPayer' => 'requester',
                //'StartAfter' => '<string>',
            ];

            if(!$showAll) {
                $listParams['Prefix'] = $this->bucketConfig["default_dir"]."/".$this->bucketConfig["file_prefix"];
            }

            // Use the high-level iterators (returns ALL of your objects).
            $results = [];
            try {
                $paginatedResults = $this->s3helper->getS3Client()->getPaginator('ListObjects', $listParams);
                foreach ($paginatedResults as $pageedResult) {//each page
                    foreach ($pageedResult['Contents'] as $object) {//each object in the page
                        $results[] = $object;
                    }
                }
            } catch (S3Exception $e) {
                echo $e->getMessage() . PHP_EOL;
            }
            return $results;
        }

        function __destruct() {
            $this->s3helper = NULL;
        }

        /**
         * Creates a presigned URL to access a file from a bucket, based on an object key and have it expire in a specified number of minutes.
         *
         * @param string $objectKey The object key of a file from this bucket
         * @param int $expireMins The number of minutes to use when creating a presigned URL, to have it expire
         *
         * @return string The presigned URL for the given object key, from this bucket.
         */
        public function getPresignedObjectURL($objectKey, $expireMins = 15):string{
            $commandObj = $this->s3helper->getS3Client()->getCommand('GetObject', [
                'Bucket' => $this->bucketName,
                'Key' => $objectKey
            ]);

            $request = $this->s3helper->getS3Client()->createPresignedRequest($commandObj, "+$expireMins minutes");
            $presignedUrl = (string) $request->getUri();

            return $presignedUrl;
        }
    }
}