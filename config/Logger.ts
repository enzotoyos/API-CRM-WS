import { transports, createLogger, format } from 'winston';
import * as path from 'path';
import fs = require('fs');

/**
 * Output Info Logger
 */
const logFormat = format.combine(
    format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
    format.align(),
    format.printf(info => `${info.timestamp} ${info.level} ${info.component}: ${info.message}`)
);
/**
 * Output Error Logger
 */
const formatError = format.combine(
    format.errors({ stack: true }),
    format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
    format.align(),
    format.prettyPrint(),
);

const LoggerManager = (moduleName: string) => createLogger({
    defaultMeta: { component: path.basename(moduleName) },
    transports: [
        new transports.File({
            filename: './Log/default.log',
            level: 'log',
            format: logFormat
        }),
        new transports.File({
            filename: './Log/error.json',
            level: 'error',
            format: formatError
        })
    ]
});

export = LoggerManager;
