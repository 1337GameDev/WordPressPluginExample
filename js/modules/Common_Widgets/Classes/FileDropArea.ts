import {WidgetBase} from "./WidgetBase";
import {DynamicObject} from "./DynamicObject";
import {Helper} from "./Helper";
import {TypeChecker} from "./TypeChecker";
import * as jQueryModule from 'jquery';
import {FileDropAreaOptions} from "./OptionsClasses";

/**
 * @example
    <span class="fileDropArea"></span>

    <script>
        jQuery('.fileDropArea').FileDropArea();
    </script>
 */
export class FileDropArea extends WidgetBase {
    private fileInput = null;
    private uploadInstruction = null;
    private uploadedFileMessage = null;
    private removeFileButton = null;

    private elementHTML = `
        <form class="fileDropArea">
            <input type="file" />
              
            <span class="fileDropAreaMessage alignCenter">
                <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
             width="49.999px" height="49.999px" viewBox="0 0 49.999 49.999" style="enable-background:new 0 0 49.999 49.999;"
             xml:space="preserve"><g>
                    <path d="M46.12,26.928L20.133,0.939c-0.649-0.648-1.7-0.649-2.352,0c-0.648,0.65-0.648,1.704,0,2.353L43.77,29.28
                                c3.871,3.869,3.871,10.167,0,14.036c-3.869,3.869-10.165,3.869-14.036-0.001L5.295,18.877c-2.624-2.624-2.624-6.897,0-9.52
                                c2.622-2.624,6.896-2.623,9.52,0.001l21.121,21.121c1.31,1.312,1.312,3.443-0.002,4.756c-1.307,1.31-3.438,1.309-4.75-0.003
                                L12.697,16.749c-0.65-0.648-1.701-0.649-2.352,0.001c-0.649,0.649-0.649,1.702,0,2.352L28.83,37.587
                                c2.607,2.608,6.853,2.611,9.46,0.004c2.608-2.611,2.608-6.856,0-9.466L17.17,7.003c-3.923-3.923-10.307-3.922-14.229,0
                                C-0.98,10.926-0.98,17.309,2.943,21.231l24.436,24.438c5.169,5.168,13.576,5.169,18.745,0.001
                                C51.292,40.502,51.29,32.097,46.12,26.928z"/></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g>
                </svg>
                Drag files here or click to <button type="button" class="btn btn-link triggerFileDialog">browse</button>.
             </span>
              
             <span class="uploadedFile alignCenter" title="Remove Selected File"><span class="uploadedFileMessage"></span> 
                <span class="removeFile">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
                </span>
             </span>
            
        </form>
    `;

    private static defaultOptions:FileDropAreaOptions = {
        onSelectFile: function (files:FileList, fileDropArea:FileDropArea) { console.log("Files selected:", files); },
        addDroppedFilesToInputElement: false
    };

    public static readonly widgetDataName:string = "FileDropArea_instance";
    public static readonly pluginName:string = "FileDropArea";

    constructor(target:JQuery, options:DynamicObject){
        super(target, options, FileDropArea.defaultOptions);

        jQueryModule.extend({}, this.exposedMethods, {
            "getFiles": this.getFiles
        });

        this.OnCreate();
    }

    protected OnCreate() {
        if(this.deleted) {
            return;
        }
        super.OnCreate();

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
    }

    public AttachHandlers() {
        if(this.deleted) {
            return;
        }
        super.AttachHandlers();

        //store reference to this class instance for binding to function closures
        let that = this;

        // Stop default browser actions
        that.widgetRootContainer.on('click','.triggerFileDialog', function (event) {
            that.fileInput.trigger("click");
        });

        that.widgetRootContainer.on('change', 'input[type="file"]', function (event) {
            let files = that.fileInput.prop("files");

            that.uploadInstruction.hide();

            let selectedFileText = "";
            if (files.length > 0) {
                selectedFileText = files[0].name + " - " + Helper.FormatBytes(files[0].size);
            }
            that.uploadedFileMessage.append(selectedFileText);

            that.uploadedFileMessage.show();
            that.removeFileButton.show();

            Helper.ExecuteIfDefined(that.settings.onSelectFile, [files, that]);
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
            let files = (<any>event.originalEvent.target).files || (<any>event.originalEvent).dataTransfer.files;

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

    //removes handlers for this widget (eg: on buttons, etc)
    public RemoveHandlers() {
        if(this.deleted) {
            return;
        }
        super.RemoveHandlers();

        this.targetElement.off();
    }

    //the function to call/called when this widget is to be destroyed
    public Destroy() {
        if(this.deleted) {
            return;
        }
        super.Destroy();

        this.targetElement = null;
        this.settings = null;
    }

    protected SaveElementState() {
        if(this.deleted) {
            return;
        }
        super.SaveElementState();

        //store things we will modify about the element, as to restore it later
        //this.originalElementState["var"] = this.targetElement.prop
    }

    protected RestoreElementState() {
        if(this.deleted) {
            return;
        }
        super.RestoreElementState();

        //restore things we modified, from the old element state
    }

    public getFiles():any {
        if(this.deleted) {
            return null;
        }

        let filesToReturn = null;

        if(TypeChecker.isEmpty(this.fileInput)) {
            filesToReturn = this.fileInput.prop("files");
        }

        return filesToReturn;
    }
}