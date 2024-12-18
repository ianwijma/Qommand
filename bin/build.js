import 'zx/globals'

echo`~~~ Cleaning up previous build files...`
await Promise.allSettled([
    $`rm -r packages/backend/.vite`,
    $`rm -r packages/backend/out`,
    $`rm -r packages/frontend/.next`,
    $`rm -r packages/frontend/out`,
])

echo`~~~ Build frontend and prepare backend...`
await Promise.all([
    $`npm run build --workspace=packages/frontend`,
    // TODO: Not needed
    $`npm run package --workspace=packages/backend`
])

echo`~~~ Clean backend renderer build folder...`
await $`rm -r packages/backend/.vite/renderer/the_window/*`;

echo`~~~ Copy compiled frontend packages into the backend renderer build folder...`
await $`cp -r packages/frontend/out/* packages/backend/.vite/renderer/the_window/`;

echo`~~~ Build backend...`
// TODO: This rebuilds the app & the previous copy is no where to be found.
await $`npm run make --workspace=packages/backend`
