import {SimpleEventBus, SimpleEventBusData} from "./eventbus.types";

// EventHandlers are a wrapper around the eventbus, but allowing you to emit and listen to specific events.
type StopListening = () => void;

type EventHandler = {
    emit: <T extends SimpleEventBusData>(eventName: string, eventData?: T) => void,
    listen: <T extends SimpleEventBusData>(eventName: string, callback: (eventData?: T) => void) => StopListening,
    listenOnce: <T extends SimpleEventBusData>(eventName: string, callback: (eventData?: T) => void) => void,
};

type EventObject<T extends SimpleEventBusData = SimpleEventBusData> = {
    type: string,
    eventName: string,
    eventData: T
}

export const createEventHandler = (eventBus: SimpleEventBus): EventHandler => {
    return {
        emit: <T extends SimpleEventBusData>(eventName: string, eventData?: T) => {
            // console.log('createEventHandler - emit', eventName, eventData);

            eventBus.emit<EventObject<T>>({
                type: 'event-handler',
                eventName,
                eventData,
            })
        },
        listen: <T extends SimpleEventBusData>(eventName: string, callback: (eventData?: T) => void) => {
            // console.log('createEventHandler - listen', eventName, callback);

            return eventBus.listen<EventObject<T>>((data) => {
                const {type, eventName: currentEventName, eventData} = data;

                // console.log('createEventHandler - listen - handle', eventName, eventData);

                if (type !== 'event-handler') return;
                if (eventName !== currentEventName) return;

                callback(eventData);
            })
        },
        listenOnce: <T extends SimpleEventBusData>(eventName: string, callback: (eventData?: T) => void) => {
            // console.log('createEventHandler - listenOnce', eventName, callback);

            return eventBus.listenOnce<EventObject<T>>((data) => {
                const {type, eventName: currentEventName, eventData} = data;

                // console.log('createEventHandler - listenOnce - handle', eventName, eventData);

                if (type !== 'event-handler') return;
                if (eventName !== currentEventName) return;

                callback(eventData);
            })
        },
    }
}