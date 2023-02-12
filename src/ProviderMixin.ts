import { Constructor, dedupeMixin } from "@open-wc/dedupe-mixin";
import { LitElement, PropertyValues } from "lit";

import { CONNECT_EVENT } from "./consts";
import { ConnectEventDetail, PropertyCallback } from "./types";

type ProvidedContext = {
    listener: (event: CustomEvent<ConnectEventDetail>) => void,
    callbacks: Set<PropertyCallback>
}

interface ProviderConfig {
    provide: PropertyKey[];
}

export const ProviderMixin = dedupeMixin(<T extends Constructor<LitElement>>(Base: T): T => {
    return class extends Base {
        protected providedContexts = new Map<PropertyKey, ProvidedContext>();

        connectedCallback(): void {
            super.connectedCallback();

            for (const key of (this.constructor as unknown as ProviderConfig).provide) {
                this.provideContext(key);
            }
        }

        /**
         * Create a new instance of the event listener and save it in provided
         * contexts map to remove the listener on unmount.
         */
        protected provideContext(key: PropertyKey) {
            const listener = (event: CustomEvent<ConnectEventDetail>) => {
                const { detail } = event;

                if (detail.key === key) {
                    event.stopPropagation();

                    const context = this.providedContexts.get(key);

                    if (context) {
                        context.callbacks.add(detail.callback);

                        detail.connected = true;
                        detail.unsubscribe = () => {
                            context.callbacks.delete(detail.callback);
                        };

                        detail.callback(this[key as keyof this], undefined);
                    }
                }
            };

            this.addEventListener(CONNECT_EVENT, listener as (event: Event) => void);

            this.providedContexts.set(key, {
                listener,
                callbacks: new Set(),
            });
        }

        /**
         * Trigger subscriber callback to provide new context value
         */
        protected updateContextValue(key: PropertyKey, value: any, oldValue: any): void {
            if (this.providedContexts.has(key)) {
                const context = this.providedContexts.get(key);

                if (context) {
                    for (const callback of context.callbacks.values()) {
                        callback(value, oldValue);
                    }
                }
            }
        }

        /**
         * Notify listeners about property changes before render
         */
        shouldUpdate(changedProperties: PropertyValues): boolean {
            const shouldUpdate = super.shouldUpdate(changedProperties);

            for (const [key, oldValue] of changedProperties.entries()) {
                if ((this.constructor as unknown as ProviderConfig).provide.includes(key)) {
                    this.updateContextValue(key, this[key as keyof this], oldValue);
                }
            }

            return shouldUpdate;
        }

        disconnectedCallback(): void {
            for (const context of this.providedContexts.values()) {
                this.removeEventListener(CONNECT_EVENT, context.listener as (event: Event) => void);
            }

            super.disconnectedCallback();
        }
    };
});
