import {messageDialog} from "../windows/dialog.window";
import {runCli, runCliPromise} from "../utils/runCli";
import {InstallableDependency} from "./dependencies.types";

export const createInstallableLinuxCliDependency = (name: string): InstallableDependency<string> => {
    return {
        isInstallable: () => process.platform === 'linux',
        install: () => {
            messageDialog.open({message: `Please install ${name} for your distro`})
        },
        isInstalled: async () => {
            const {exitCode} = await runCli(name, '--version');

            return exitCode === 0;
        },
        run: async (...args: string[]) => await runCliPromise(name, args),
    }
}