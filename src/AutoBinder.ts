type Callback<T> = (newValue: T) => void


export default class AutoBinder<O> {
    private bindings: Map<keyof O, Callback<O[keyof O]>[]> = new Map()

    bind<K extends keyof O>(object: O, property: K, callback: Callback<O[K]>) {
        if (!this.bindings.has(property)) {
            this.bindings.set(property, [])
            this.watchProperty(object, property)
        }
        this.bindings.get(property)!.push(callback as Callback<O[keyof O]>);
    }

    unbind<K extends keyof O>(object: O, property: K): void {
        if (this.bindings.has(property)) {
            this.bindings.set(property, [])
        }
    }

    unbindCallback<K extends keyof O>(object: O, property: K, callback: Callback<O[K]>): void {
        const callbacks = this.bindings.get(property);
        if (callbacks) {
            this.bindings.set(property, callbacks.filter(cb => cb !== callback))
        }
    }


    private watchProperty<K extends keyof O>(object: O, property: K ) {
        let currentValue: O[K] = object[property]
        Object.defineProperty(object, property, {
            get: () => currentValue,
            set: (newValue: O[K]) => {
                currentValue = newValue
                this.notify(property, newValue)
            },
            configurable: true,
            enumerable: true,
        })
    }

    private notify<K extends keyof O>(property: K, newValue: O[K]) {
        const subscriptions = this.bindings.get(property)
        if (subscriptions) {
            subscriptions.forEach(callback => callback(newValue))
        }
    }
}