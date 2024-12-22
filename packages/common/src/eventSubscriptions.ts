import {sortByKey} from "./object";
import {EventName, EventType} from "./types";
import * as events from "./events";

export type Subscriptions<T extends EventType> = {
    [key: number]: (event: T) => void;
}

type Registry = {
    [key: EventName]: Subscriptions<EventType>[]
}

const registry: Registry = {};

export const subscribe = <T extends EventType>(event: EventType, subscriptions: Subscriptions<T>) => {
    const {name} = event;

    if (!(name in registry)) {
        registry[name] = []
    }

    const sortedSubscriptions = sortByKey(subscriptions);

    registry[event.name].push(sortedSubscriptions);
}

export type EmitEventHandler = (event: EventType) => void

const defaultEventHandler: EmitEventHandler = (event: EventType) => {
    const {name} = event;

    const eventSubscriptions = registry[name] ?? [];

    eventSubscriptions.forEach((subscriptions) => {
        Object.values(subscriptions).forEach((subscription) => {
            subscription(event);
        })
    })
}

const emitEventHandlers: EmitEventHandler[] = [defaultEventHandler]

export const emitEvent = (event: EventType) => {
    emitEventHandlers.forEach((emitEventHandler) => emitEventHandler(event))
}

// This function can be useful for prevents an event loop, caused by additional emitEventHandlers.
export const emitEventWithDefaultHandler = (event: EventType) => {
    defaultEventHandler(event);
}

type EventByNameMap = { [name: EventName]: EventType }

const eventByNameMap: EventByNameMap = Object.values(events).reduce<EventByNameMap>((map, event) => {
    map[event.name] = event;

    return map;
}, {})

export const getEventByName = (name: EventName): EventType => {
    if (name in eventByNameMap) {
        return eventByNameMap[name];
    } else {
        throw new Error(`Event with ${name} does not exist, did not miss to add it to the events/index.ts file?`);
    }
}

export const addEmitEventHandler = (emitEventHandler: EmitEventHandler) => {
    emitEventHandlers.push(emitEventHandler);
}