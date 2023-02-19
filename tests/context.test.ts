import { LitElement, html } from "lit";
import { expect, fixture, elementUpdated } from "@open-wc/testing";

import { ConsumerMixin, ProviderMixin } from "../src";

class TestProvider extends ProviderMixin(LitElement) {
  value = 1;

  static get properties() {
    return {
      value: { type: Number },
    };
  }

  static get provide() {
    return ["value"];
  }

  render() {
    return html` <test-consumer></test-consumer> `;
  }
}

class TestConsumer extends ConsumerMixin(LitElement) {
  value: number | null = null;

  static get properties() {
    return {
      value: { type: Number },
    };
  }

  static get inject() {
    return ["value"];
  }

  render() {
    return html` <div>${JSON.stringify(this.value)}</div> `;
  }
}

customElements.define("test-provider", TestProvider);
customElements.define("test-consumer", TestConsumer);

describe("lit-element", () => {
  it("have default value if no provider exists", async () => {
    const consumerEl: TestConsumer = await fixture(html`<test-consumer></test-consumer>`);

    expect(consumerEl.value).to.equal(null);
  });

  it("inject initial prop values on connect", async () => {
    const providerEl: TestProvider = await fixture(html`<test-provider></test-provider>`);
    const consumerEl = providerEl.shadowRoot?.querySelector("test-consumer");

    expect(consumerEl).shadowDom.equal("<div>1</div>");
  });

  it("update injected props, then context value changes", async () => {
    const providerEl: TestProvider = await fixture(html`<test-provider></test-provider>`);
    const consumerEl = providerEl.shadowRoot?.querySelector("test-consumer");

    providerEl.value = 2;
    await elementUpdated(consumerEl as Element);

    expect(consumerEl).shadowDom.equal("<div>2</div>");
  });
});
