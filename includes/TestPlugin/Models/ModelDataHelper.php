<?php
namespace TestPlugin\Models {
    use TestPlugin\DBResult;
    use TestPlugin\PDOHelper;

    /**
     * Class ModelDataHelper
     * A class that will be used to handle collections of models to save/load. This is commonly used to init/drop a database for setup / tear-down.
     *
     * @package TestPlugin\Models
     */
    abstract class ModelDataHelper {
        private static $classNames = [];
        public abstract static function getAllModelClassNames(array $dataArray = []):array;
        public abstract static function instantiateByName(string $className):ModelBase;

        private static $isDebug = false;
        public static function enableDebug() {ModelDataHelper::$isDebug = true;}
        public static function disableDebug() {ModelDataHelper::$isDebug = false;}
        public static function isDebug():bool {return ModelDataHelper::$isDebug;}

        public abstract static function getBaseDataModels(array $dataArray):array;

        public static function saveDataModels(PDOHelper $source, array $models, bool $continueOnError = false):DBResult {
            if(ModelDataHelper::isDebug()){
                error_log("----------------------------- saveDataModels -----------------------------");
            }
            $source->connect();
            static $modelBaseName = ModelBase::class;
            $saveAllResult = new DBResult();
            $saveAllResult->success = true;

            foreach($models as $model) {
                if(!empty($model) && ($model instanceof $modelBaseName)) {
                    if(ModelDataHelper::isDebug()){
                        error_log('saving model:' . print_r($model->getClassname(), true));
                    }

                    $saveResult = $model->save($source);

                    if(!$saveResult->success){
                        if(ModelDataHelper::isDebug()){
                            error_log("saveDataModels - saveResult:" . print_r($saveResult, true));
                        }
                        //log error
                        $saveAllResult->success = false;
                        $saveAllResult->messages[] = "The model \"".get_class($model)."\" wasn't saved successfully. The data was: ".print_r($model,true)." and the error was:".print_r($saveResult->messages,true);
                        if(!$continueOnError) {
                            break;
                        }
                    }
                } else {
                    //log error
                    $saveAllResult->success = false;
                    $saveAllResult->messages[] = "The model wasn't a subclass of \"ModelBase\" and hence, wasn't saved successfully. The data was: ".print_r($model,true);
                    if(!$continueOnError) {
                        break;
                    }
                }
            }

            return $saveAllResult;
        }
    }
}