import {$, cd} from 'zx';

// Go To Root
cd('..');

// TODO: Cleanup
await Promise.all([
    $`rm -r packages/backend/.vite`,
    $`rm -r packages/backend/out`,
    $`rm -r packages/frontend/.next`,
    $`rm -r packages/frontend/out`,
])

// Build frontend and prepare backend
await Promise.all([
    $`npm run build --workspace=packages/frontend`,
    $`npm run package --workspace=packages/backend`
])

// Clean backend renderer build folder
await $`rm -r packages/backend/.vite/the_window/*`;

// copy compiled frontend packages into the backend renderer build folder
await $`cp packages/frontend/out/* packages/backend/.vite/the_window/`;

await $`npm run make --workspace=packages/backend`
