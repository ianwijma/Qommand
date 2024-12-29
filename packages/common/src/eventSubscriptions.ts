import {sortByKey} from "./object";
import {EventName, EventType} from "./events.types";

export type Subscriptions<T extends EventType> = {
    [key: number]: (event: T, ...args: any[]) => void;
}

type Registry = {
    [key: EventName]: Subscriptions<EventType>[]
}

const registry: Registry = {};

const registerSubscription = <T extends EventType>(event: EventType, subscriptions: Subscriptions<T>) => {
    const {name} = event;

    if (!(name in registry)) {
        registry[name] = []
    }

    const sortedSubscriptions = sortByKey(subscriptions);

    registry[event.name].push(sortedSubscriptions);
}
export const subscribe = <T extends EventType>(event: EventType, subscriptions: Subscriptions<T>) => {
    registerSubscription(event, subscriptions);
}

export type EmitEventHandler = (event: EventType, ...args: any[]) => void

const defaultEventHandler: EmitEventHandler = (event: EventType, ...args: any[]) => {
    const {name} = event;

    const eventSubscriptions = registry[name] ?? [];

    eventSubscriptions.forEach((subscriptions) => {
        Object.values(subscriptions).forEach((subscription) => {
            subscription(event, ...args);
        })
    })
}

const emitEventHandlers: EmitEventHandler[] = [defaultEventHandler]

const triggerEmitEventHandlers = (event: EventType, ...args: any[]) => {
    emitEventHandlers.forEach((emitEventHandler) => emitEventHandler(event, ...args))
}

export const emitEvent = (event: EventType, ...args: any[]) => {
    triggerEmitEventHandlers(event, ...args);
}

// This function can be useful for prevents an event loop, caused by additional emitEventHandlers.
export const emitEventWithDefaultHandler = (event: EventType, ...args: any[]) => {
    defaultEventHandler(event, ...args);
}

export const addEmitEventHandler = (emitEventHandler: EmitEventHandler) => {
    emitEventHandlers.push(emitEventHandler);
}
