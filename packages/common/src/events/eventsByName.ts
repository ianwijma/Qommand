import {EventName, EventType} from "../events.types";
import * as events from "./index";

type EventByNameMap = { [name: EventName]: EventType }

export const eventByName: EventByNameMap = Object.values(events).reduce<EventByNameMap>((map, event) => {
    map[event.name] = event;

    return map;
}, {})