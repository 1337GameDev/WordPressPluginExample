<?php
namespace TestPlugin\DataClasses\ServiceHelpers {
    use Aws\S3\S3Client;
    use Aws\S3\Exception\S3Exception;
    use TestPlugin\UtilityFunctions;

    /**
     * A class that helps connect and use an Amazon Web Services S3 service
     * */
    class S3Helper {
        private $s3client;
        public function getS3Client():?S3Client { return $this->s3client; }

        private $awsConfig;
        private $s3config;
        private $buckets;
        private $primaryBucketName = "";

        /**
         * Gets the primary bucket to be used with this S3 instance
         *
         * @return S3Bucket|null
         */
        public function getPrimaryBucket():?S3Bucket {
            return (empty($this->primaryBucketName)) ? null : $this->buckets[$this->primaryBucketName];
        }

        public function __construct(array $awsconfig, array $s3config) {
            $this->awsConfig = $awsconfig;
            $this->s3config = $s3config;
            if(!$this->verifyConfig() ) {
                throw new \Exception("The AWS S3 Configuration is missing required fields.");
            }

            $this->buckets = [];

            $this->initClient();
            $this->verifyBuckets();
        }

        public function verifyConfig() : bool {
            $valid =  is_array($this->s3config)
                && array_key_exists("buckets",$this->s3config)
                && is_array($this->s3config["buckets"]);

            if($valid) {
                foreach($this->s3config["buckets"] as $bucket){
                    $valid = is_array($bucket)
                        && array_key_exists("name", $bucket)
                        && is_string($bucket["name"])
                        && array_key_exists("default_dir", $bucket)
                        && is_string($bucket["default_dir"])
                        && array_key_exists("file_prefix", $bucket)
                        && is_string($bucket["file_prefix"]);

                    if(!$valid) {
                        break;
                    }
                }
            }

            return $valid;
        }

        private function initClient() {
            $this->s3client = new S3Client($this->awsConfig);
        }

        /**
         * Ensures every bucket associated with this S3 instance actually exists
         **/
        public function verifyBuckets() {
            $invalidBuckets = [];

            foreach ($this->s3config["buckets"] as $bucketInfo) {
                $bucket = new S3Bucket($this, $bucketInfo);

                if($bucket->bucketExists() ) {
                    $this->buckets[$bucketInfo["name"]] = $bucket;
                    if(empty($this->primaryBucketName) && ($bucketInfo['primary'] === true)) {
                        $this->primaryBucketName = $bucketInfo["name"];
                    }
                } else {
                    $invalidBuckets[] = $bucketInfo["name"];
                }
            }

            if(count($this->buckets) && empty($this->primaryBucketName)) {
                $this->primaryBucketName = $this->buckets[0]->getBucketName();//set the first bucket as the primary
            }

            if(count($invalidBuckets)>0 ) {
                throw new \Exception("The following buckets were not found: ".implode(", ", $invalidBuckets) );
            }
        }

        /**
         * Gets a bucket from this S3 instance, by name
         *
         * @param string $bucketName The bucket name to fetch
         *
         * @return S3Bucket|null The found buckwt for the provided name, or null
         **/
        public function getBucket(string $bucketName):S3Bucket {
            if(!array_key_exists($bucketName, $this->buckets) ) {
                return NULL;
            } else {
                return $this->buckets[$bucketName];
            }
        }

        /**
         * Gets all the bucket contents info for this S3 instance
         *
         * @return array The S3 bucket contents as an array in the form:
         * ["html"=>$tableHtml, "data"=>$allBucketContents]
         *
         **/
        public function listAllBucketContents() {
            $allBucketContents = $this->getAllBucketContents();

            $tableHtml = "
                <table class=\"table table-bordered\">
                    <thead>
                    <tr>
                      <th>Bucket</th>
                      <th>Blob</th>
                    </tr>
                    </thead>
                    <tbody>
                ";

            foreach ($allBucketContents as $bucketName => $bucketContents) {
                if(count($bucketContents) > 0) {
                    foreach ($bucketContents as $object) {//this is paginated, hence a loop needed
                        $tableHtml .= "<tr>
                            <td>".$bucketName."</td>
                        <td><a href='https://".$bucketName.".s3.amazonaws.com/".$object['Key']."'>".$object['Key']."</a></td>
                        </tr>";

                    }
                } else {
                    $tableHtml .= "
                            <td> No files </td>
                            ";
                }
            }

            $tableHtml .= "
                </tbody>
            </table>
            ";

            return ["html"=>$tableHtml, "data"=>$allBucketContents];
        }

        /**
         * Gets all the bucket contents data for this S3 instance
         *
         * @return array The S3 bucket contents as an array in the form:
         * ["bucketName1" => contents array
         *
         **/
        public function getAllBucketContents():array {
            $allBucketContents = [];
            foreach ($this->buckets as $bucketname => $bucket) {
                $allBucketContents[$bucketname] = $bucket->getBucketContents(true);
            }
            return $allBucketContents;
        }

        function __destruct() {
            $this->s3client = NULL;
            $this->buckets = NULL;
        }
    }
}