import {SimpleEventBusData, SimpleEventBus} from "@qommand/common/src/eventbus.types";
import EventEmitter from 'node:events'

const bus = new EventEmitter();

const EVENT_NAME = 'event-bus';

export const eventBus: SimpleEventBus = {
    emit: <T extends SimpleEventBusData>(data: T) => {
        console.log('eventbus - emit', data);

        bus.emit(EVENT_NAME, data);
    },
    listen: <T extends SimpleEventBusData>(callback: (data: T) => void) => {
        console.log('eventbus - listen', callback);

        const handle = (data: T) => {
            console.log('eventbus - listen - handle', data, callback);

            callback(data)
        };

        bus.on(EVENT_NAME, handle)

        return () => bus.off('event-bus', handle);
    },
    listenOnce: <T extends SimpleEventBusData>(callback: (data: T) => void) => {
        console.log('eventbus - listenOnce', callback);

        const handle = (data: T) => {
            console.log('eventbus - listenOnce - handle', data, callback);

            callback(data)
        };

        bus.once(EVENT_NAME, handle)
    },
}