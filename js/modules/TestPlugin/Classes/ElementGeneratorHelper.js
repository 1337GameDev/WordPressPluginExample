(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "jquery", "./TypeChecker"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <reference types="jquery" />
    var jQueryModule = require("jquery");
    var TypeChecker_1 = require("./TypeChecker");
    /**
     * A class to hold functions to generate HTML elements
     */
    var ElementGeneratorHelper = /** @class */ (function () {
        function ElementGeneratorHelper() {
        }
        //use with the template file: search-result-element.php
        ElementGeneratorHelper.updateObjectTemplate = function ($template, templateData) {
            //modify the template here
            return $template;
        };
        /**
         * An example method to get object HTML.
         *
         * @param dataObj The object to get HTML for
         */
        ElementGeneratorHelper.getHTMLForObject = function (dataObj) {
            var html = "\n            <div class=\"myObjectClass\">\n                <div class=\"inner\">Inner Contents</div>\n            </div>\n        ";
            return jQueryModule(html);
        };
        /**
         * Generates Bootstrap v4 table HTML given an array of model objects (or any object), and a model name for display purposes.
         * This assumes a homogeneous array, where all objects are the same.
         *
         * @param arr The array of objects
         * @param modelName The name of the model
         */
        ElementGeneratorHelper.getObjectArrayBootstrap4Table = function (arr, modelName) {
            var tableStart = "<table class=\"table table-hover table-bordered table-striped table-sm deleteable-rows basic-model-table\" data-model-name=\"" + modelName + "\" ";
            var tableHtml = ">\n            <caption>" + modelName + "</caption>\n            <thead>\n        <tr>";
            var fields = [];
            var firstLoop = true;
            var counter = 1;
            arr.forEach(function (elem) {
                if (firstLoop) {
                    fields = Object.keys(elem);
                    tableHtml += "<th scope=\"col\">#</th>";
                    fields.forEach(function (field) {
                        tableHtml += "<th scope=\"col\">" + field + "</th>";
                    });
                    tableHtml += "</tr>\n                    </thead>\n                    <tbody>\n                ";
                    var fieldsStr = JSON.stringify(fields);
                    tableStart += 'data-model-fields="' + fieldsStr + '"';
                    firstLoop = false;
                }
                tableHtml += "<tr><th scope=\"row\" data-model-id=\"" + elem["id"] + "\">" + counter + "</th>";
                fields.forEach(function (field) {
                    var fieldStr = elem[field];
                    if (TypeChecker_1.TypeChecker.isObject(fieldStr)) {
                        fieldStr = JSON.stringify(fieldStr);
                    }
                    tableHtml += "<td>" + fieldStr + "</td>";
                });
                tableHtml += "</tr>";
                counter++;
            });
            tableHtml += "\n            </tbody>\n        </table>";
            return tableStart + tableHtml;
        };
        return ElementGeneratorHelper;
    }());
    exports.ElementGeneratorHelper = ElementGeneratorHelper;
});
//# sourceMappingURL=ElementGeneratorHelper.js.map