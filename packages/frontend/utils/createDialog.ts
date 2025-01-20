import {createOpenDialog} from '@qommand/common/src/dialog'
import {responseHandler} from "./responseHandler";

// @ts-expect-error - We expect some error here, IDK why but TS is unhappy. Will check it out later, maybe, probably not...
export const createDialog = createOpenDialog(responseHandler)