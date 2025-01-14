import {SimpleEventBus} from "@qommand/common/src/eventbus.types";
import {createEventHandler} from '@qommand/common/src/createEventHandler'
import {isClient} from "./isClient";

let eventBus: SimpleEventBus = {} as SimpleEventBus;

if (isClient) {
    // @ts-expect-error - The eventBusApi is created in the preload.ts file & is not typed yet..
    eventBus = window?.eventBusApi;
}

export const eventHandler = createEventHandler(eventBus);
