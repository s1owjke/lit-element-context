# LitElement Context

[![Published on npm](https://img.shields.io/npm/v/lit-element-context?color=brightgreen)](https://www.npmjs.com/package/lit-element-context) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A set of [class mixin functions](https://alligator.io/js/class-composition/#composition-with-javascript-classes) to provide and inject multiple contexts for lit-element, doesn't require any extra components for that.

## Install

Using NPM:

```shell
npm install lit-element-context
```

Using YARN:

```shell
yarn add lit-element-context
```

## Usage

An example app also available on [codesandbox](https://codesandbox.io/s/lit-element-context-demo-i7f8u?file=/src/app.js)

```javascript
import { LitElement, html } from "lit";
import { ProviderMixin, ConsumerMixin } from "lit-element-context";

class App extends ProviderMixin(LitElement) {
  constructor() {
    super();

    this.name = "hello";
    this.setName = (value) => {
      this.name = value;
    };
  }

  // provided values must be specified as properties to keep them updated
  static get properties() {
    return {
      name: String,
      setName: Function,
    };
  }

  // specify which properties will be available in the context
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

  // inject properties that we need from context
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
