const logger = require('winston');

const logConfiguration = {
    transports: [
        new logger.transports.Console(),
        new logger.transports.File({
            filename: 'logs/unipayconnect.log'
        })
    ],
    format: logger.format.combine(
        logger.format.timestamp({
            format: 'MMM-DD-YYYY HH:mm:ss'
        }),
        logger.format.printf(info => `${info.level}: ${info.timestamp}: ${info.message}`),
    )
};

const log = logger.createLogger(logConfiguration);

module.exports = {
    error: (message, error) => {
        log.error(`${message}: ${error.message}`);
    },
    info: (message) => {
        log.info(message);
    }
};
