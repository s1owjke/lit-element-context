import { LitElement, html } from "lit";

import { ProviderMixin } from "../../dist/src";

export default class App extends ProviderMixin(LitElement) {
    constructor() {
        super();

        this.name = "hello";
        this.setName = (value) => {
            this.name = value;
        };
    }

    static get properties() {
        return {
            name: String,
            setName: Function,
        };
    }

    static get provide() {
        return ["name", "setName"];
    }

    render() {
        return html`
            <div>
                <h1>Lit-element context</h1>
                <p>Current name: ${this.name}</p>
                <input-component></input-component>
            </div>
        `;
    }
}
