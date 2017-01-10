/*
 * Gather version information from the package configuration file
 */
let packageJSON = require(`${__dirname}/../package.json`);

let dependencies = packageJSON.dependencies;
let dependencyNames = Object.keys(dependencies);

// Join dependencies as "name (version)"
let strDependencies = dependencyNames.map(name => `${name} (${dependencies[name]})`).join(", ");

/*
 * Show the splash screen information
 */
logger.info("********************************************************************************");
logger.info("* Discord Relay Server for Multi Theft Auto: San Andreas");
logger.info(`* Version: ${packageJSON.version}`);
logger.info(`* Dependencies (${dependencyNames.length}): ${strDependencies}`);
logger.info("********************************************************************************");
