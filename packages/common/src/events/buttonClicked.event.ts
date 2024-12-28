import {EventType} from "../events.types";
import {emitEvent, subscribe} from "../eventSubscriptions";
import {AnyObject} from "../object";

export const ButtonClickedEvent: EventType = {
    name: 'buttonClicked',
};

export const emitButtonClickedEvent = (buttonId: string, buttonData: AnyObject = {}) => {
    console.log("emitButtonClickedEvent", buttonId, buttonData);
    // TODO: emitEvent does not work on the frontend, as in the frontend the eventSubscriptions is non-existing really.
    // The frontend needs to use the exposed events from the preload. AK window.eventSubscriptionApi.emit
    emitEvent(ButtonClickedEvent, buttonId, buttonData);
}

export const onButtonClickedEvent = (callback: (buttonId: string, buttonData: AnyObject) => void) => {
    subscribe(ButtonClickedEvent, {
        0: (_, buttonId: string, buttonData: AnyObject = {}) => callback(buttonId, buttonData),
    })
}