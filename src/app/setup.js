/*
 * Create global path variables
 */
const path = require("path");

global.appdir   = __dirname;
global.rootdir  = path.normalize(`${__dirname}/../`);
global.libdir   = path.normalize(`${rootdir}/library/`);

/*
 * Create a global logger instance for the entire application. You
 * can use command line arguments to change the verbosity of the
 * console output with '--debug' or '--verbose'
 */
require(`${appdir}/logging`);

/*
 * Show a welcoming splash screen in the console as confirmation of a
 * successful application environment verification
 */
require(`${appdir}/splash`);

/*
 * Verify the entire content of your provided configuration in the next
 * step for a flawless start of the application
 */
require(`${appdir}/configuration`);

/*
 * Bootstrap the application
 */
require(`${appdir}/bootstrap`);
