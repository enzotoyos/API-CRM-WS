import { transports, createLogger, format } from 'winston';
import * as path from 'path';
// import 'winston-daily-rotate-file';
//import fs = require('fs');

/**
 * Output Info Logger
 */
const defaultFormat = format.combine(
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
    format.printf(info => `${info.timestamp} ${info.level} ${info.component}: ${info.message} ${info.stack}`),
    format.align(),
);

// const infoTransport = new transports.DailyRotateFile({
//     filename: './Log/info-%DATE%.log',
//     datePattern: 'YYYY-MM-DD-HH',
//     zippedArchive: true,
//     maxSize: '20m',
//     maxFiles: '14d',
//     format: defaultFormat
// });
// const errorTransport = new transports.DailyRotateFile({
//     filename: './Log/error-%DATE%.log',
//     datePattern: 'YYYY-MM-DD-HH',
//     zippedArchive: true,
//     maxSize: '20m',
//     maxFiles: '14d',
//     level: "error",
//     format: formatError
// });

// const LoggerManager = (moduleName: string) => createLogger({
//     defaultMeta: { component: path.basename(moduleName) },
//     transports: [
//         infoTransport,
//         errorTransport
//     ]
// });

const LoggerManager = (moduleName: string) => createLogger({
    defaultMeta: { component: path.basename(moduleName) },
    transports: [
        new transports.File({
            filename: './Log/default.log',
            level: 'log',
            format: defaultFormat
        }),
        new transports.File({
            filename: './Log/error.log',
            level: 'error',
            format: formatError
        })
    ]
});

export = LoggerManager;
