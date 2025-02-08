export type Dependency = {
    run: (...params: any) => void | Promise<void>;
}

export type InstallableDependency = Dependency & {
    isInstallable: () => boolean | Promise<boolean>;
    install: () => void | Promise<void>;
    isInstalled: () => boolean | Promise<boolean>;
}