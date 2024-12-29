const hasWindow = typeof window !== 'undefined';

export const isFrontendBuild = typeof process !== 'undefined' && process.env.IS_NEXT_SERVER === 'true';
export const isFrontend = !isFrontendBuild && hasWindow;
// @ts-ignore
export const isPreload = hasWindow && window.IS_PRELOAD === true;
export const isBackend = !isFrontendBuild && !hasWindow;

let contextName: 'frontend-build' | 'frontend' | 'preload' | 'backend' | 'unknown';
switch (true) {
    case isFrontendBuild:
        contextName = 'frontend-build';
        break;
    case isFrontend:
        contextName = 'frontend';
        break;
    case isPreload:
        contextName = 'preload';
        break;
    case isBackend:
        contextName = 'backend';
        break;
    default:
        contextName = 'unknown';
}

export const environmentName = contextName;
