
const winston = require("winston");

/*
 * Create a global winston logger instance, which defaults to 'info'
 * output level for production usage
 */
global.logger = new winston.Logger({
  exitOnError: false,
  transports: [
    new winston.transports.Console({
      level: 'info',
      colorize: true
    })
  ]
});

/*
 * Enable command line enhancements for our winston logger
 */
logger.cli();

/*
 * Auto-detect command line arguments '--verbose' or '--debug' and
 * apply the respective console output level
 */
if (process.argv.includes("--verbose")) {
  logger.transports.console.level = "verbose";
  logger.verbose("Running application in verbose mode (--verbose)");
}
else if (process.argv.includes("--debug")) {
  logger.transports.console.level = "debug";
  logger.debug("Running application in debug mode (--debug)");
}
