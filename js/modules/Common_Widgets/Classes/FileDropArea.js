var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./WidgetBase", "./Helper", "./TypeChecker", "jquery"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WidgetBase_1 = require("./WidgetBase");
    var Helper_1 = require("./Helper");
    var TypeChecker_1 = require("./TypeChecker");
    var jQueryModule = require("jquery");
    /**
     * @example
        <span class="fileDropArea"></span>
    
        <script>
            jQuery('.fileDropArea').FileDropArea();
        </script>
     */
    var FileDropArea = /** @class */ (function (_super) {
        __extends(FileDropArea, _super);
        function FileDropArea(target, options) {
            var _this = _super.call(this, target, options, FileDropArea.defaultOptions) || this;
            _this.fileInput = null;
            _this.uploadInstruction = null;
            _this.uploadedFileMessage = null;
            _this.removeFileButton = null;
            _this.elementHTML = "\n        <form class=\"fileDropArea\">\n            <input type=\"file\" />\n              \n            <span class=\"fileDropAreaMessage alignCenter\">\n                <svg version=\"1.1\" id=\"Capa_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n             width=\"49.999px\" height=\"49.999px\" viewBox=\"0 0 49.999 49.999\" style=\"enable-background:new 0 0 49.999 49.999;\"\n             xml:space=\"preserve\"><g>\n                    <path d=\"M46.12,26.928L20.133,0.939c-0.649-0.648-1.7-0.649-2.352,0c-0.648,0.65-0.648,1.704,0,2.353L43.77,29.28\n                                c3.871,3.869,3.871,10.167,0,14.036c-3.869,3.869-10.165,3.869-14.036-0.001L5.295,18.877c-2.624-2.624-2.624-6.897,0-9.52\n                                c2.622-2.624,6.896-2.623,9.52,0.001l21.121,21.121c1.31,1.312,1.312,3.443-0.002,4.756c-1.307,1.31-3.438,1.309-4.75-0.003\n                                L12.697,16.749c-0.65-0.648-1.701-0.649-2.352,0.001c-0.649,0.649-0.649,1.702,0,2.352L28.83,37.587\n                                c2.607,2.608,6.853,2.611,9.46,0.004c2.608-2.611,2.608-6.856,0-9.466L17.17,7.003c-3.923-3.923-10.307-3.922-14.229,0\n                                C-0.98,10.926-0.98,17.309,2.943,21.231l24.436,24.438c5.169,5.168,13.576,5.169,18.745,0.001\n                                C51.292,40.502,51.29,32.097,46.12,26.928z\"/></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g>\n                </svg>\n                Drag files here or click to <button type=\"button\" class=\"btn btn-link triggerFileDialog\">browse</button>.\n             </span>\n              \n             <span class=\"uploadedFile alignCenter\" title=\"Remove Selected File\"><span class=\"uploadedFileMessage\"></span> \n                <span class=\"removeFile\">\n                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path fill=\"none\" d=\"M0 0h24v24H0V0z\"/><path d=\"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z\"/></svg>\n                </span>\n             </span>\n            \n        </form>\n    ";
            jQueryModule.extend({}, _this.exposedMethods, {
                "getFiles": _this.getFiles
            });
            _this.OnCreate();
            return _this;
        }
        FileDropArea.prototype.OnCreate = function () {
            if (this.deleted) {
                return;
            }
            _super.prototype.OnCreate.call(this);
            //create widget DOM structure
            this.targetElement.empty().append(this.elementHTML);
            this.widgetRootContainer = this.targetElement;
            this.widgetRoot = this.widgetRootContainer.find('form.fileDropArea');
            this.fileInput = this.targetElement.find('input[type="file"]');
            this.uploadInstruction = this.targetElement.find(".fileDropAreaMessage");
            this.uploadedFileMessage = this.targetElement.find(".uploadedFileMessage");
            this.removeFileButton = this.targetElement.find(".removeFile");
            this.SaveElementState();
            this.AttachHandlers();
        };
        FileDropArea.prototype.AttachHandlers = function () {
            if (this.deleted) {
                return;
            }
            _super.prototype.AttachHandlers.call(this);
            //store reference to this class instance for binding to function closures
            var that = this;
            // Stop default browser actions
            that.widgetRootContainer.on('click', '.triggerFileDialog', function (event) {
                that.fileInput.trigger("click");
            });
            that.widgetRootContainer.on('change', 'input[type="file"]', function (event) {
                var files = that.fileInput.prop("files");
                that.uploadInstruction.hide();
                var selectedFileText = "";
                if (files.length > 0) {
                    selectedFileText = files[0].name + " - " + Helper_1.Helper.FormatBytes(files[0].size);
                }
                that.uploadedFileMessage.append(selectedFileText);
                that.uploadedFileMessage.show();
                that.removeFileButton.show();
                Helper_1.Helper.ExecuteIfDefined(that.settings.onSelectFile, [files, that]);
            });
            that.widgetRootContainer.on('dragover dragleave', function (event) {
                event.stopPropagation();
                event.preventDefault();
            });
            that.widgetRootContainer.on('dragover dragenter', function (event) {
                that.targetElement.addClass('highlight');
            });
            that.widgetRootContainer.on('dragleave drop', function (event) {
                that.targetElement.removeClass('highlight');
            });
            // Catch drop event
            that.widgetRootContainer.on('drop', function (event) {
                // Stop default browser actions
                event.stopPropagation();
                event.preventDefault();
                // Get all files that are dropped
                var files = event.originalEvent.target.files || event.originalEvent.dataTransfer.files;
                if (that.settings.addDroppedFilesToInputElement === true) {
                    that.fileInput.prop("files", files);
                    that.fileInput.trigger('change');
                }
                return false;
            });
            that.widgetRootContainer.on('click', '.removeFile', function (event) {
                that.uploadInstruction.show();
                that.uploadedFileMessage.hide();
                that.removeFileButton.hide();
                that.fileInput.val("");
            });
        };
        ;
        //removes handlers for this widget (eg: on buttons, etc)
        FileDropArea.prototype.RemoveHandlers = function () {
            if (this.deleted) {
                return;
            }
            _super.prototype.RemoveHandlers.call(this);
            this.targetElement.off();
        };
        //the function to call/called when this widget is to be destroyed
        FileDropArea.prototype.Destroy = function () {
            if (this.deleted) {
                return;
            }
            _super.prototype.Destroy.call(this);
            this.targetElement = null;
            this.settings = null;
        };
        FileDropArea.prototype.SaveElementState = function () {
            if (this.deleted) {
                return;
            }
            _super.prototype.SaveElementState.call(this);
            //store things we will modify about the element, as to restore it later
            //this.originalElementState["var"] = this.targetElement.prop
        };
        FileDropArea.prototype.RestoreElementState = function () {
            if (this.deleted) {
                return;
            }
            _super.prototype.RestoreElementState.call(this);
            //restore things we modified, from the old element state
        };
        FileDropArea.prototype.getFiles = function () {
            if (this.deleted) {
                return null;
            }
            var filesToReturn = null;
            if (TypeChecker_1.TypeChecker.isEmpty(this.fileInput)) {
                filesToReturn = this.fileInput.prop("files");
            }
            return filesToReturn;
        };
        FileDropArea.defaultOptions = {
            onSelectFile: function (files, fileDropArea) { console.log("Files selected:", files); },
            addDroppedFilesToInputElement: false
        };
        FileDropArea.widgetDataName = "FileDropArea_instance";
        FileDropArea.pluginName = "FileDropArea";
        return FileDropArea;
    }(WidgetBase_1.WidgetBase));
    exports.FileDropArea = FileDropArea;
});
//# sourceMappingURL=FileDropArea.js.map