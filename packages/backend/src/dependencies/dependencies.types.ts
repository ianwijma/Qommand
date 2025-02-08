export type Dependency<R> = {
    run: (...params: any[]) => R | Promise<R>;
}

export type InstallableDependency<R> = Dependency<R> & {
    isInstallable: () => boolean | Promise<boolean>;
    install: () => void | Promise<void>;
    isInstalled: () => boolean | Promise<boolean>;
}