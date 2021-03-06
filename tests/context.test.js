import { LitElement, html } from "lit-element";
import { expect, fixture, elementUpdated } from "@open-wc/testing";
import { ProviderMixin, ConsumerMixin } from "../src/context.js";

class TestProvider extends ProviderMixin(LitElement) {
    constructor() {
        super();
        this.value = 1;
    }
    static get properties() {
        return {
            value: Number,
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
    constructor() {
        super();
        this.value = null;
    }
    static get properties() {
        return {
            value: Number,
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

describe("lit-elemt", () => {
    it("have default value if no provider exists", async () => {
        const consumerEl = await fixture(html`<test-consumer></test-consumer>`);

        expect(consumerEl.value).to.equal(null);
    });

    it("inject initial prop values on connect", async () => {
        const providerEl = await fixture(html`<test-provider></test-provider>`);
        const consumerEl = providerEl.shadowRoot.querySelector("test-consumer");

        expect(consumerEl).shadowDom.equal("<div>1</div>");
    });

    it("update injected props, then context value changes", async () => {
        const providerEl = await fixture(html`<test-provider></test-provider>`);
        const consumerEl = providerEl.shadowRoot.querySelector("test-consumer");

        providerEl.value = 2;
        await elementUpdated(consumerEl);

        expect(consumerEl).shadowDom.equal("<div>2</div>");
    });
});
