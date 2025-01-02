import {EventType} from "../events.types";
import {emitEvent, subscribe} from "../eventSubscriptions";
import {AnyObject} from "../object";

export const ButtonClickedEvent: EventType = {
    name: 'buttonClicked',
};

export const emitButtonClickedEvent = (buttonId: string, buttonData: AnyObject = {}) => {
    console.log("emitButtonClickedEvent", buttonId, buttonData);

    emitEvent(ButtonClickedEvent, buttonId, buttonData);
}

export const onButtonClickedEvent = (callback: (buttonId: string, buttonData: AnyObject) => void) => {
    return subscribe(ButtonClickedEvent, {
        0: (_, buttonId: string, buttonData: AnyObject = {}) => callback(buttonId, buttonData),
    })
}