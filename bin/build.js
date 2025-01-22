import 'zx/globals'

const {quick} = argv;

const {stdout} = await $`git rev-parse HEAD`;
const commitHash = stdout.trim();

const backendPackage = await fs.readJSON('packages/backend/package.json');
const currentVersion = backendPackage.version;

backendPackage.version = `${currentVersion}.${commitHash}`;

fs.writeJson('packages/backend/package.json', backendPackage, {spaces: 2});

try {

    echo`~~~ Cleaning up previous build files...`
    await Promise.allSettled([
        $`rm -r packages/backend/.vite`,
        $`rm -r packages/backend/out`,
        $`rm -r packages/frontend/.next`,
        $`rm -r packages/frontend/out`,
    ])

    if (quick) {
        echo`~~~ Build frontend quickly...`
        await $`npm run build-quick --workspace=packages/frontend`
    } else {
        echo`~~~ Build frontend...`
        await $`npm run build --workspace=packages/frontend`
    }


    echo`~~~ Build backend...`
    const buildPromise = $`npm run make --workspace=packages/backend`;

    // TODO: Replace with waiting logic for packages/backend/.vite/renderer/incorrect_window, replacing it with the_window when found.

// IMPORTANT:
//      LOL, wait for the build process to have created the .vite folder structure. so we can copy over the NextJS files...
    await sleep('2500ms');

    echo`~~~ Copy compiled frontend packages into the backend renderer build folder...`
    await $`mkdir -p packages/backend/.vite/renderer/the_window/`
    await $`cp -r packages/frontend/out/* packages/backend/.vite/renderer/the_window/`;

    await buildPromise;
} catch {
    // Don't really care
} finally {
    // Restore the package.json
    backendPackage.version = currentVersion;
    fs.writeJson('packages/backend/package.json', backendPackage, {spaces: 2});
}
