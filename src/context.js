import { dedupeMixin } from "@open-wc/dedupe-mixin";

const connectEvent = "context.connectEvent";

export const ConsumerMixin = dedupeMixin((Base) => {
    return class extends Base {
        connectedCallback() {
            if (super.connectedCallback) {
                super.connectedCallback();
            }

            this._injectedContexts = new Map();

            for (const key of this.constructor.inject) {
                this._injectContext(key);
            }
        }

        /**
         * Create an event and propagate it through the tree up, to find provider,
         * usbubscribe callback we save to injected contexts, to call them on unmount
         */
        _injectContext(key) {
            const callback = (value, oldValue) => {
                this._contextValueChanged(key, value, oldValue);
            };

            // Composed event because lit-element can work without shadow root
            const event = new CustomEvent(connectEvent, {
                bubbles: true,
                cancelable: true,
                composed: true,
                detail: { key, connected: false, callback },
            });

            this.dispatchEvent(event);

            if (event.detail.connected) {
                this._injectedContexts.set(key, {
                    unsubscribe: event.detail.unsubscribe,
                });
            }
        }

        /**
         * Change value of property recieved from a context, then property changes
         */
        _contextValueChanged(key, value, oldValue) {
            if (value !== oldValue) {
                this[key] = value;
            }
        }

        disconnectedCallback() {
            for (const context of this._injectedContexts.values()) {
                context.unsubscribe();
            }

            if (super.disconnectedCallback) {
                super.disconnectedCallback();
            }
        }
    };
});

export const ProviderMixin = dedupeMixin((Base) => {
    return class extends Base {
        connectedCallback() {
            if (super.connectedCallback) {
                super.connectedCallback();
            }

            this._providedContexts = new Map();

            for (const key of this.constructor.provide) {
                this._provideContext(key);
            }
        }

        /**
         * Create a new instance of the event listener and save it in provided
         * contexts map to remove the listener on unmount.
         */
        _provideContext(key) {
            const listener = (event) => {
                const { detail } = event;

                if (detail.key === key) {
                    event.stopPropagation();

                    const context = this._providedContexts.get(key);

                    context.callbacks.add(detail.callback);

                    detail.connected = true;
                    detail.unsubscribe = () => {
                        context.callbacks.delete(detail.callback);
                    };

                    detail.callback(this[key]);
                }
            };

            this.addEventListener(connectEvent, listener);

            this._providedContexts.set(key, {
                listener,
                callbacks: new Set(),
            });
        }

        /**
         * Trigger subscriber callback to provide new context value
         */
        _updateContextValue(key, value, oldValue) {
            if (this._providedContexts.has(key)) {
                const context = this._providedContexts.get(key);

                for (const callback of context.callbacks) {
                    callback(value, oldValue);
                }
            }
        }

        /**
         * Notify listeners about property changes before render
         */
        shouldUpdate(changedProperties) {
            const shouldUpdate = super.shouldUpdate(changedProperties);

            for (const [key, oldValue] of changedProperties.entries()) {
                if (this.constructor.provide.includes(key)) {
                    this._updateContextValue(key, this[key], oldValue);
                }
            }

            return shouldUpdate;
        }

        disconnectedCallback() {
            for (const context of this._providedContexts.values()) {
                this.removeEventListener(connectEvent, context.listener);
            }

            if (super.disconnectedCallback) {
                super.disconnectedCallback();
            }
        }
    };
});
