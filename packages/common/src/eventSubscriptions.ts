import {sortByKey} from "./object";
import {EventName, EventType} from "./events.types";
import {nanoid} from "nanoid";
import {isFrontend} from "./context";

export type Subscriptions<T extends EventType> = {
    [key: number]: (event: T, ...args: any[]) => void;
}

type SubscriptionEntry = {
    [key: string]: Subscriptions<EventType>
}

type Registry = {
    [key: EventName]: SubscriptionEntry
}

const registry: Registry = {};

const registerSubscription = <T extends EventType>(event: EventType, subscriptions: Subscriptions<T>): string => {
    const {name} = event;

    if (!(name in registry)) {
        registry[name] = {}
    }

    const subscriptionId = nanoid();
    registry[name][subscriptionId] = [];

    const sortedSubscriptions = sortByKey(subscriptions);
    registry[event.name][subscriptionId] = sortedSubscriptions;

    return subscriptionId;
}

const unsubscribe = (event: EventType, subscriptionId: string) => {
    delete registry?.[event.name]?.[subscriptionId]
}

export type subscribeUnsubscribeFn = () => void;

export const subscribeFn = <T extends EventType>(event: EventType, subscriptions: Subscriptions<T>): subscribeUnsubscribeFn => {
    const subscribeId = registerSubscription(event, subscriptions);

    return () => unsubscribe(event, subscribeId)
}

export const subscribe: typeof subscribeFn = (...args) => {
    if (isFrontend) {
        // @ts-ignore
        return window?.eventSubscriptionApi?.subscribe(...args);
    } else {
        return subscribeFn(...args);
    }
}

const trackedEvents: { [key: string]: boolean } = {};

const trackEvent = (event: EventType) => {
    trackedEvents[event.trackId] = true;
}

const isTrackedEvent = (event: EventType) => {
    return event.trackId in trackedEvents
}

export type EmitEventHandler = (event: EventType, ...args: any[]) => void

const defaultEventHandler: EmitEventHandler = (event: EventType, ...args: any[]) => {
    const {name} = event;

    const nestedEventSubscriptions = Object.values(registry[name])
    const eventSubscriptions = nestedEventSubscriptions.flat();

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

const emitEventFn = (event: EventType, ...args: any[]) => {
    console.log("emitEvent", event, ...args);
    event.trackId ??= nanoid();
    if (!isTrackedEvent(event)) {
        trackEvent(event);
        triggerEmitEventHandlers(event, ...args);
    }
}

export const emitEvent: typeof emitEventFn = (...args) => {
    if (isFrontend) {
        // @ts-ignore
        window?.eventSubscriptionApi?.emitEvent(...args);
    } else {
        emitEventFn(...args);
    }
}


export const addEmitEventHandler = (emitEventHandler: EmitEventHandler) => {
    emitEventHandlers.push(emitEventHandler);
}