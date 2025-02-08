import {InstallableDependency} from "./dependencies.types";
import {messageDialog} from "../windows/dialog.window";

export type Xdotool = InstallableDependency & {}

export const xdotool = (): Xdotool => {
    return {
        isInstallable: () => process.platform === 'linux',
        install: () => {
            messageDialog.open({message: 'Please install xdotool for your distro'})
        },
        isInstalled: async () => {

        },
        run: async (...args) => {

        }
    }
}
