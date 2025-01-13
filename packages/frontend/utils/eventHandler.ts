import {SimpleEventBus} from "@qommand/common/src/eventbus.types";
import {createEventHandler} from '@qommand/common/src/createEventHandler'
import {isClient} from "./isClient";

let eventBus: SimpleEventBus = {} as SimpleEventBus;

if (isClient) {
    // @ts-ignore
    eventBus = window?.eventBusApi;
}

export const eventHandler = createEventHandler(eventBus);
