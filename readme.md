# lit-element-context

[![Published on npm](https://img.shields.io/npm/v/lit-element-context.svg)](https://www.npmjs.com/package/lit-element-context)

A set of [class mixin functions](https://alligator.io/js/class-composition/#composition-with-javascript-classes) to provide and inject multiple contexts for lit-element. Doesnt require any extra components for that.

#### Install

`npm install lit-element-context`

#### Usage

An example app also available on [codesandbox](https://codesandbox.io/s/lit-element-context-demo-i7f8u?file=/src/app.js)

```javascript
import { LitElement, html } from "lit-element";
import { ProviderMixin, ConsumerMixin } from "lit-element-context";

class App extends ProviderMixin(LitElement) {
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

class Input extends ConsumerMixin(LitElement) {
    static get properties() {
        return {
            name: String,
            setName: Function,
        };
    }
    static get inject() {
        return ["name", "setName"];
    }
    render() {
        return html`
            <div>
                <label>Name:</label>
                <input .value=${this.name} @input=${(event) => this.setName(event.target.value)} />
            </div>
        `;
    }
}
```

### License

MIT
