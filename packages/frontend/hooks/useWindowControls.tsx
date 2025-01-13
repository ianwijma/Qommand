import {eventHandler} from "../utils/eventHandler";
import {closeWindowEventName, type CloseWindowEventData} from '@qommand/common/src/events/closeWindow.event'
import {minimizeWindowEventName, type MinimizeWindowEventData} from '@qommand/common/src/events/minimizeWindow.event'
import {useSearchParams} from "next/navigation";

export const useWindowControls = () => {
    const searchParams = useSearchParams()

    return {
        minimize: () => {
            eventHandler.emit<MinimizeWindowEventData>(minimizeWindowEventName, {
                // windowId's are integers.
                windowId: parseInt(searchParams.get('__id'), 10)
            });
        },
        close: () => {
            eventHandler.emit<CloseWindowEventData>(closeWindowEventName, {
                // windowId's are integers.
                windowId: parseInt(searchParams.get('__id'), 10)
            });
        },
    };
}