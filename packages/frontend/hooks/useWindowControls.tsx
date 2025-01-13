import {eventHandler} from "../utils/eventHandler";
import {closeWindowName, type CloseWindowData} from '@qommand/common/src/events/closeWindow.event'
import {minimizeWindowName, type MinimizeWindowData} from '@qommand/common/src/events/minimizeWindow.event'
import {useSearchParams} from "next/navigation";

export const useWindowControls = () => {
    const searchParams = useSearchParams()

    return {
        minimize: () => {
            eventHandler.emit<MinimizeWindowData>(minimizeWindowName, {
                // windowId's are integers.
                windowId: parseInt(searchParams.get('__id'), 10)
            });
        },
        close: () => {
            eventHandler.emit<CloseWindowData>(closeWindowName, {
                // windowId's are integers.
                windowId: parseInt(searchParams.get('__id'), 10)
            });
        },
    };
}