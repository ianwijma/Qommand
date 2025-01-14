import {createOpenDialog} from '@qommand/common/src/dialog'
import {responseHandler} from "./responseHandler";

export const createDialog = createOpenDialog(responseHandler)