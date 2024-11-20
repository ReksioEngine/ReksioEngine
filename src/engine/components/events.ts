export type EventCallback = (...args: any[]) => any

export class EventsComponent {
    private listeners: Map<string, EventCallback[]> = new Map()

    public register(eventName: string, callback: EventCallback) {
        let callbacks = this.listeners.get(eventName)
        if (callbacks === undefined) {
            callbacks = []
        }

        callbacks.push(callback)
        this.listeners.set(eventName, callbacks)
    }

    public unregister(eventName: string, callback: EventCallback) {
        let callbacks = this.listeners.get(eventName)
        if (callbacks === undefined) {
            return
        }

        callbacks = callbacks.filter((cb) => cb !== callback)
        this.listeners.set(eventName, callbacks)
    }

    public trigger(eventName: string, ...args: any[]) {
        const callbacks = this.listeners.get(eventName) ?? []
        for (const listener of callbacks) {
            listener(...args)
        }
    }
}
