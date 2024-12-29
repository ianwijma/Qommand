import {isClient} from "../utils/isClient";
import {EventType} from "@qommand/common/src/events.types";
import {Subscriptions} from "@qommand/common/src/eventSubscriptions";
import {logger} from "../utils/logger";

export const useEventSubscriptions = () => {
    const emitEvent = (event: EventType) => {
        if (isClient) {
            logger.debug('useEventSubscriptions- emitEvent', event)
            // @ts-ignore
            window.eventSubscriptionApi.emitEvent(event)
        }
    }
    const subscribe = (event: EventType, subscriptions: Subscriptions<EventType>) => {
        if (isClient) {
            logger.debug('useEventSubscriptions- subscribe', event, subscriptions);
            // @ts-ignore
            window.eventSubscriptionApi.subscribe(event, subscriptions)
        }
    }

    return {
        emitEvent,
        subscribe,
    }
}