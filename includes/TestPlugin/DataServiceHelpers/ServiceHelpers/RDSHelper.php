<?php
namespace TestPlugin\DataClasses\ServiceHelpers {
    use TestPlugin\PDOHelper;
    use TestPlugin\SQLLoader;
    use TestPlugin\UtilityFunctions;
    use TestPlugin\PDOConnectionInfo;
    use TestPlugin\PDOHelperContainer;

    /**
     * A class that helps connect and use an Amazon Web Services RDS instance
     * */
    class RDSHelper implements PDOHelperContainer {
        private $rdsConnection;
        public function getPDOHelper():PDOHelper {return $this->rdsConnection;}

        private $rdsConfig;
        public function getPDOConnectionInfo():PDOConnectionInfo {return $this->rdsConfig;}

        public function __construct(array $rdsConfig, SQLLoader $loader) {
            $this->rdsConfig = PDOConnectionInfo::fromAssocArray($rdsConfig);

            if(!$this->verifyConfig() ) {
                throw new \Exception("The RDS Configuration is missing required fields.");
            } else {
                $this->initConnection($loader);
            }
        }

        public function verifyConfig() : bool {
            return ($this->rdsConfig === NULL) ? false : $this->rdsConfig->verify();
        }

        private function initConnection(SQLLoader $loader) {
            $this->rdsConnection = new PDOHelper($this->rdsConfig, $loader);
            $this->rdsConnection->connect();
        }

        /**
         * Lists all database rows, building a basic HTML table.
         * <b>This method is NOT complete, and simply returns a static table.</b>
         */
        public function listAllDBRows() {
            $allRowData = $this->selectAllFromDB();

            $tableHtml = "
                <table class=\"table table-bordered\">
                    <thead>
                    <tr>
                      <th>DB</th>
                      <th>Column1</th>
                    </tr>
                    </thead>
                    <tbody>
                ";

                //$this->rdsPDOConnection

            /*
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
            */
            $tableHtml .= "
                </tbody>
            </table>
            ";

            echo $tableHtml;
        }

        /**
         * Selects all rows from all tables in the database.
         * <b>This method is NOT complete, and simply returns an empty associative array</b>
         */
        public function selectAllFromDB() {
            $allRows = [];

            return $allRows;
        }

        function __destruct() {
            $this->rdsConnection = NULL;
            $this->rdsConfig = NULL;
        }
    }
}