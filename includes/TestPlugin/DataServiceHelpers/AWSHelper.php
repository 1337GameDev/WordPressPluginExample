<?php
namespace TestPlugin\DataClasses {
    use TestPlugin\UtilityFunctions;
    use TestPlugin\DataClasses\ServiceHelpers;
    use ParagonIE\Certainty\RemoteFetch;

    /**
     * A convenience class that helps connect and use an Amazon Web Services. Currently this class has fields for S3 and RDS objects, but more could be added..
     * */
    class AWSHelper {
        private $certDir;
        private $latestCACertBundle;
        private $awsconfig = [];

        private $s3helper;
        private $awsBucketInfo = [];
        public function getS3Helper():ServiceHelpers\S3Helper {return $this->s3helper;}

        private $rdsHelper;
        private $awsRdsConfig;
        public function getRDSHelper() {return $this->rdsHelper;}

        public function __construct(array $awsConfig, $s3Config = null, $rdsConfig = null) {
            $fetcher = new RemoteFetch(\TestPlugin\CertaintyDataDir);
            $this->latestCACertBundle = $fetcher->getLatestBundle();

            $this->awsconfig = [
                "region" => $awsConfig["region"],
                "version" => $awsConfig["version"],
                'credentials' => [
                    'key' => $awsConfig["key"],
                    'secret' => $awsConfig["secret"]
                ],
                'http' => [
                    'verify' => $this->latestCACertBundle->getFilePath()
                ]
            ];

            $this->awsBucketInfo = $s3Config;
            $this->awsRdsConfig = $rdsConfig;

            if(!$this->verifyConfig() ) {
                throw new \Exception("The AWS Configuration is missing required fields.");
            }

            $this->certDir = dirname(__FILE__).DIRECTORY_SEPARATOR."..".DIRECTORY_SEPARATOR."Certs";

            $this->initConnection();
        }

        public function verifyConfig() : bool {
            return is_array($this->awsconfig)
                && array_key_exists("region",$this->awsconfig)
                && is_string($this->awsconfig["region"])
                && array_key_exists("version",$this->awsconfig)
                && is_string($this->awsconfig["version"])
                && array_key_exists("credentials",$this->awsconfig)
                && is_array($this->awsconfig["credentials"])
                && array_key_exists("key",$this->awsconfig["credentials"])
                && array_key_exists("secret",$this->awsconfig["credentials"])
                && array_key_exists("http",$this->awsconfig)
                && is_array($this->awsconfig["http"])
                && array_key_exists("verify",$this->awsconfig["http"])
                && is_string($this->awsconfig["http"]["verify"]);
        }

        private function initConnection() {
            try {
                if(!empty($this->awsBucketInfo)){
                    $this->s3helper = new ServiceHelpers\S3Helper($this->awsconfig, $this->awsBucketInfo);
                }
            } catch(\Exception $e){
                error_log("Unable to instantiate the S3Helper:".$e->getMessage());
            }

            $caPathParts = pathinfo($this->latestCACertBundle->getFilePath());
            //use the field: $this->awsRdsConfig     to initialize an RDS connection

            if(!empty($this->awsRdsConfig)){

            }
        }

        function __destruct() {
            $this->s3helper = NULL;
            $this->rdsHelper = NULL;
        }
    }
}