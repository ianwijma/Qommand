import {eventHandler} from "./eventHandler";
import {createResponseHandler} from '@qommand/common/src/createResponseHandler'

export const responseHandler = createResponseHandler(eventHandler)