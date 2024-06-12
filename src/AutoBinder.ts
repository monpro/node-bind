type Callback<T> = (newValue: T) => void

export default class AutoBinder {
    private bindings: Map<string, Map<unknown, Callback<unknown>[]>> = new Map();

    bind<O, K extends keyof O>(object: O, property: K, callback: Callback<O[K]>) {
        const objectBindings = this.bindings.get(property as string) || new Map();

        if (!objectBindings.has(object)) {
            objectBindings.set(object, []);
            this.watchProperty(object, property);
        }

        objectBindings.get(object)!.push(callback as Callback<unknown>);
        this.bindings.set(property as string, objectBindings);
    }

    bindMultiple<O, K extends keyof O>(object: O, properties: K[], callback: Callback<O[K]>) {
        properties.forEach(property => this.bind(object,property, callback))
    }


    unbind<O, K extends keyof O>(object: O, property: K): void {
        const objectBindings = this.bindings.get(property as string);
        if (objectBindings && objectBindings.has(object)) {
            objectBindings.delete(object);
        }
    }

    unbindCallback<O, K extends keyof O>(object: O, property: K, callback: Callback<O[K]>): void {
        const objectBindings = this.bindings.get(property as string);
        if (objectBindings) {
            const callbacks = objectBindings.get(object);
            if (callbacks) {
                objectBindings.set(object, callbacks.filter(cb => cb !== callback));
            }
        }
    }

    private watchProperty<O, K extends keyof O>(object: O, property: K) {
        let currentValue: O[K] = object[property];
        Object.defineProperty(object, property, {
            get: () => currentValue,
            set: (newValue: O[K]) => {
                currentValue = newValue;
                this.notify(property, object, newValue);
            },
            configurable: true,
            enumerable: true,
        });
    }

    private notify<O, K extends keyof O>(property: K, object: O, newValue: O[K]) {
        const objectBindings = this.bindings.get(property as string);
        if (objectBindings) {
            const callbacks = objectBindings.get(object);
            if (callbacks) {
                callbacks.forEach(callback => callback(newValue));
            }
        }
    }
}
