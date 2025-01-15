import {
    buttonClickedEventName,
    type ButtonClickedEventData
} from '@qommand/common/src/events/buttonClicked.event'
import {eventHandler} from "./eventHandler";
import {SimpleEventBusData} from "@qommand/common/src/eventbus.types";
import {useListen} from "../hooks/useEventHandler";

export const emitButtonClick = (buttonId: string, buttonData?: SimpleEventBusData) => {
    eventHandler.emit<ButtonClickedEventData>(buttonClickedEventName, {
        buttonId,
        buttonData,
    })
}

export const useOnButtonClicked = (buttonId: string, callback: (buttonData: SimpleEventBusData) => void) => {
    useListen<ButtonClickedEventData>(buttonClickedEventName, (data) => {
        const {buttonId: currentButtonId, buttonData} = data;
        if (currentButtonId === buttonId) {
            callback(buttonData);
        }
    })
}

export const onButtonClicked = (buttonId: string, callback: (buttonData: SimpleEventBusData) => void) => eventHandler.listen<ButtonClickedEventData>(buttonClickedEventName, (data) => {
    const {buttonId: currentButtonId, buttonData} = data;
    if (currentButtonId === buttonId) {
        callback(buttonData);
    }
})