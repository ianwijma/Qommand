import http from 'http';
import RED from 'node-red';
import express from 'express';
import {ensureDirExists, ensureJsonFileExists} from "./files";
import path from "path";
// @ts-ignore - complains it's incorrect, while it's correct...
import type {LocalSettings} from '@types/node-red__runtime'
import {responseHandler} from "./responseHandler";
import {nodeRedRequestName, NodeRedRequestReq, NodeRedRequestRes} from '@qommand/common/src/requests/node-red.request'

/**
 * TODO: Setup Node Red & create node that I can trigger from the backend.
 * - https://github.com/node-red/node-red/blob/master/packages/node_modules/node-red/red.js
 * - https://github.com/natcl/electron-node-red/blob/a673babea94209927f9feb45f7582afb0b9dd393/main.js
 * - https://nodered.org/docs/creating-nodes/first-node
 */

const createNodeRed = () => {
    const uiHost = '127.0.0.1';
    const uiPort = parseInt(String(Math.random() * 16383 + 49152), 10);
    const httpAdminRoot = '/admin'

    return {
        initialize: async () => {
            console.log("Initializing Node Red");

            // TODO: currently node red does not have any nodes, we need to fix this.

            const red_app = express();
            const server = http.createServer(red_app);

            const userDir = await ensureDirExists('node-red');
            const nodesDir = await ensureDirExists(path.join(userDir, 'nodes'));
            const flowFile = await ensureJsonFileExists(path.join(userDir, 'flow.json'), []);

            const settings: LocalSettings = {
                uiHost,
                uiPort,
                userDir,
                flowFile,
                nodesDir,
                httpAdminRoot,
                httpNodeRoot: "/api",
            }

            RED.init(server, settings);

            // Serve the editor UI from /red
            red_app.use(settings.httpAdminRoot as string, RED.httpAdmin);

            // Serve the http nodes UI from /api
            red_app.use(settings.httpNodeRoot as string, RED.httpNode);

            await RED.start();

            server.listen(uiPort, uiHost, function () {
                console.log(`Node-red running on: http://${uiHost}:${uiPort}`);
            });
        },
        getAdminUrlPieces: () => ({
            host: uiHost,
            port: uiPort,
            adminPath: httpAdminRoot
        })
    }
}

export const nodeRed = createNodeRed();

responseHandler.handleResponse<NodeRedRequestReq, NodeRedRequestRes>(nodeRedRequestName, () => true, () => nodeRed.getAdminUrlPieces());