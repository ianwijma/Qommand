import {SimpleEventBusData} from "../eventbus.types";

export const buttonClickedEventName = 'buttonClicked';

export type ButtonClickedEventData = {
    buttonId: string;
    buttonData: SimpleEventBusData;
};