// Element is the same as Polymer.Element in 2.x
// Modules give you the freedom to rename the members that you import
import {PolymerElement, html} from '../lib/@polymer/polymer/polymer-element.js';

// Added "export" to export the TestComponent symbol from the module
export class TestComponent extends PolymerElement {
    // Define a string template instead of a `<template>` element.

    static get template() {
        return html`
            <style include="test-component-styles"></style> 
            <div class="test-component">This is my [[name]] app.</div> 
        `;
    }


    constructor() {
        super();
        this.name = '3.0 preview - test';
    }

    // properties, observers, etc. are identical to 2.x
    static get properties() {
        name: {
            Type: String
        };
    }
}

customElements.define('test-component', TestComponent);