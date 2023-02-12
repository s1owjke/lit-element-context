import { Constructor, dedupeMixin } from "@open-wc/dedupe-mixin";
import { LitElement } from "lit";

import { CONNECT_EVENT } from "./consts";

type InjectedContext = {
    unsubscribe: () => void
};

type ConsumerConfig = {
    inject: PropertyKey[]
}

export const ConsumerMixin = dedupeMixin(<T extends Constructor<LitElement>>(Base: T): T => {
    return class extends Base {
        protected injectedContexts = new Map<PropertyKey, InjectedContext>();

        connectedCallback() {
            super.connectedCallback();

            for (const key of (this.constructor as unknown as ConsumerConfig).inject) {
                this.injectContext(key);
            }
        }

        /**
         * Create an event and propagate it through the tree up, to find provider,
         * unsubscribe callback we save to injected contexts, to call them on unmount
         */
        protected injectContext(key: PropertyKey) {
            const callback = (value: any, oldValue: any) => {
                this.contextValueChanged(key, value, oldValue);
            };

            // Composed event because lit-element can work without shadow root
            const event = new CustomEvent(CONNECT_EVENT, {
                bubbles: true,
                cancelable: true,
                composed: true,
                detail: { key, connected: false, callback, unsubscribe: () => {} },
            });

            this.dispatchEvent(event);

            if (event.detail.connected) {
                this.injectedContexts.set(key, {
                    unsubscribe: event.detail.unsubscribe,
                });
            }
        }

        /**
         * Change value of property received from a context, then property changes
         */
        protected contextValueChanged(key: PropertyKey, value: any, oldValue: any) {
            if (value !== oldValue) {
                this[key as keyof this] = value;
            }
        }

        disconnectedCallback() {
            for (const context of this.injectedContexts.values()) {
                context.unsubscribe();
            }

            super.disconnectedCallback();
        }

    }
});
