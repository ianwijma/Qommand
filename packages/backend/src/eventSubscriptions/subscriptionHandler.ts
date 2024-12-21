import {EventName, EventType} from "./event.type";
import {sortByKey} from "../utils/object";

type Subscriptions<T extends EventType> = {
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


export const emitEvent = (event: EventType) => {
    const {name} = event;

    const eventSubscriptions = registry[name] ?? [];

    eventSubscriptions.forEach((subscriptions) => {
        Object.values(subscriptions).forEach((subscription) => {
            subscription(event);
        })
    })
}