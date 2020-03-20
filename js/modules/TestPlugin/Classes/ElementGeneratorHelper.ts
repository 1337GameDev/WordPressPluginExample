/// <reference types="jquery" />
import * as jQueryModule from 'jquery';
import {DynamicObject} from "./DynamicObject";
import {TypeChecker} from "./TypeChecker";
import {Helper} from "./Helper";

/**
 * A class to hold functions to generate HTML elements
 */
export class ElementGeneratorHelper {
    //use with the template file: search-result-element.php
    public static updateObjectTemplate($template:JQuery, templateData:DynamicObject):JQuery {
        //modify the template here
        return $template;
    }

    /**
     * An example method to get object HTML.
     *
     * @param dataObj The object to get HTML for
     */
    public static getHTMLForObject(dataObj:object):JQuery {
        let html = `
            <div class="myObjectClass">
                <div class="inner">Inner Contents</div>
            </div>
        `;

        return jQueryModule(html);
    }

    /**
     * Generates Bootstrap v4 table HTML given an array of model objects (or any object), and a model name for display purposes.
     * This assumes a homogeneous array, where all objects are the same.
     *
     * @param arr The array of objects
     * @param modelName The name of the model
     */
    public static getObjectArrayBootstrap4Table(arr:DynamicObject[], modelName):string {
        let tableStart = `<table class="table table-hover table-bordered table-striped table-sm deleteable-rows basic-model-table" data-model-name="`+modelName+`" `;

        let tableHtml = `>
            <caption>`+modelName+`</caption>
            <thead>
        <tr>`;
        let fields = [];

        let firstLoop = true;
        let counter = 1;

        arr.forEach(function(elem){
            if(firstLoop) {
                fields = Object.keys(elem);
                tableHtml += `<th scope="col">#</th>`;

                fields.forEach(function(field){
                    tableHtml += `<th scope="col">`+field+`</th>`;
                });

                tableHtml += `</tr>
                    </thead>
                    <tbody>
                `;

                let fieldsStr = JSON.stringify(fields);
                tableStart += 'data-model-fields="'+fieldsStr+'"';

                firstLoop = false;
            }

            tableHtml += `<tr><th scope="row" data-model-id="`+elem["id"]+`">`+counter+`</th>`;
            fields.forEach(function(field){
                let fieldStr = elem[field];
                if(TypeChecker.isObject(fieldStr)) {
                    fieldStr = JSON.stringify(fieldStr);
                }

                tableHtml += `<td>`+fieldStr+`</td>`;
            });
            tableHtml += `</tr>`;

            counter++;
        });

        tableHtml += `
            </tbody>
        </table>`;

        return tableStart+tableHtml;
    }
}