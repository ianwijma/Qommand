import {EventName, EventType} from "../events.types";
import * as events from "./index";
import {arrayToObjectBy} from "../array";

const eventByName = arrayToObjectBy<EventType>(Object.values(events), 'name');

export const getEventByName = (name: EventName): EventType => {
    if (name in eventByName) {
        return eventByName[name];
    } else {
        throw new Error(`Event with ${name} does not exist, did not miss to add it to the events/index.ts file?`);
    }
}