import 'zx/globals'

const {quick} = argv;

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

// IMPORTANT:
//      LOL, wait for the build process to have created the .vite folder structure. so we can copy over the NextJS files...
await sleep('2s');

echo`~~~ Copy compiled frontend packages into the backend renderer build folder...`
await $`mkdir -p packages/backend/.vite/renderer/the_window/`
await $`cp -r packages/frontend/out/* packages/backend/.vite/renderer/the_window/`;

await buildPromise;

