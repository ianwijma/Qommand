/**
 * TODO: Setup Node Red & create node that I can trigger from the backend.
 * - https://github.com/node-red/node-red/blob/master/packages/node_modules/node-red/red.js
 * - https://github.com/natcl/electron-node-red/blob/a673babea94209927f9feb45f7582afb0b9dd393/main.js
 * - https://nodered.org/docs/creating-nodes/first-node
 */

const createNodeRed = () => {


    return {
        initialize: async () => {
            console.log("Initializing Node Red");

        }
    }
}

export const nodeRed = createNodeRed()