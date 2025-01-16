import {SimpleEventBusData, SimpleEventBus} from "@qommand/common/src/eventbus.types";
import EventEmitter from 'node:events'

const bus = new EventEmitter();

const EVENT_NAME = 'event-bus';

export const eventBus: SimpleEventBus = {
    emit: <T extends SimpleEventBusData>(data: T) => {
        bus.emit(EVENT_NAME, data);
    },
    listen: <T extends SimpleEventBusData>(callback: (data: T) => void) => {
        const handle = (data: T) => {
            callback(data)
        };

        bus.on(EVENT_NAME, handle)

        return () => bus.off(EVENT_NAME, handle);
    },
    listenOnce: <T extends SimpleEventBusData>(callback: (data: T) => void) => {
        const handle = (data: T) => {
            callback(data)
        };

        bus.once(EVENT_NAME, handle)
    },
}