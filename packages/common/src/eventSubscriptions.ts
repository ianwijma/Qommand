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

// This function can be useful for prevents an event loop, caused by additional emitEventHandlers.
export const emitEventWithDefaultHandler = (event: EventType, ...args: any[]) => {
    defaultEventHandler(event, ...args);
}

export const addEmitEventHandler = (emitEventHandler: EmitEventHandler) => {
    emitEventHandlers.push(emitEventHandler);
}

export const emitEvent = (event: EventType, ...args: any[]) => {
    // We need to use the eventSubscriptionApi if is available, this means it's running in react frontend.
    // Else it means we're either running in backend or preload context.
    // TODO: Improve common lib context awareness
    // @ts-ignore
    if (typeof window !== 'undefined' && window?.eventSubscriptionApi?.emitEvent) {
        // TODO: This code seems to fuck up the code.... IDK maybe
        // @ts-ignore
        window.eventSubscriptionApi.emitEvent(event, ...args);
    } else {
        triggerEmitEventHandlers(event, ...args);
    }
}

export const subscribe = <T extends EventType>(event: EventType, subscriptions: Subscriptions<T>) => {
    // We need to use the eventSubscriptionApi if is available, this means it's running in react frontend.
    // Else it means we're either running in backend or preload context.
    // TODO: Improve common lib context awareness
    // @ts-ignore
    if (typeof window !== 'undefined' && window?.eventSubscriptionApi?.subscribe) {
        // @ts-ignore
        window.eventSubscriptionApi.subscribe(event, subscriptions);
    } else {
        registerSubscription(event, subscriptions);
    }
}