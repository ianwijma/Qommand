import * as winston from "winston";
import {environmentName} from './context';
import Transport from 'winston-transport';

const logger = winston.createLogger({
    level: 'silly',
    format: winston.format.json(),
    defaultMeta: {
        environmentName
    },
    transports: [
        new winston.transports.Console({
            format: winston.format.cli({all: true}) // TODO: Update to not be all log levels
        })
    ]
});

class FrontendToBackendLogger extends Transport {
    log(info, callback) {
        // @ts-ignore
        window.loggingApi.send(info);
    }
}

switch (environmentName) {
    case "frontend-build":
        break;
    case "frontend":
        logger.add(new FrontendToBackendLogger({
            format: winston.format.json(),
        }))
    case "preload":
        break;
    case "backend":
        break;
}

export {
    logger
}