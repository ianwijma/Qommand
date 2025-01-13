import {createEventHandler} from '@qommand/common/src/createEventHandler';
import {eventBus} from "./eventBus";

export const eventHandler = createEventHandler(eventBus);

