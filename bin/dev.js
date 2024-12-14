const concurrently = require('concurrently');
const path = require("path");

const QOMMAND_ROOT = path.resolve(__dirname, '..')

const {result} = concurrently(
    [
        {
            command: 'npm run dev',
            name: 'frontend',
            cwd: path.resolve(QOMMAND_ROOT, 'packages', 'frontend')
        },
        {
            command: 'npm run dev',
            name: 'backend',
            cwd: path.resolve(QOMMAND_ROOT, 'packages', 'backend')
        },
    ],
    {
        prefix: 'name',
        killOthers: [],
        // restartTries: 3,
    },
);
result.then(console.log, console.error);