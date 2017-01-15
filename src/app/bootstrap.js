
// Setup a honeypot for uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error(`[${new Date().toUTCString()}] Uncaught exception: ${error.message}`);
  logger.debug(error.stack);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  logger.error(`[${new Date().toUTCString()}] Uncaught rejection: ${error.message}`);
  logger.debug(error.stack);
});

// Enhance shutdown on Windows
if (process.platform === "win32") {
  require("readline")
    .createInterface({
      input: process.stdin,
      output: process.stdout
    })
    .on("SIGINT", () => {
      process.emit("SIGINT");
    });
}

// Create the application
let Application = require(`${libdir}/App`);
let app = new Application(config);

// Graceful shutdown
function shutdown() {
  logger.verbose("Application is shutting down");

  let stopTick = new Date().getTime();

  function showStopTime() {
    let diff = new Date().getTime() - stopTick;
    logger.info(`Application has shut down (${diff} ms)`)
  }

  app.stop()
    .then(showStopTime, showStopTime)
    .then(process.exit, process.exit);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Launch it
logger.verbose("Application is starting");

let startTick = new Date().getTime();

app.start()
  .then(() => {
    let diff = new Date().getTime() - startTick;
    logger.info(`Application is up and running (${diff} ms)`);
  })
  .catch((error) => {
    if (error.code == "ENOTFOUND") {
      logger.error("Application failed to resolve a hostname. Check your internet connectivity.");
    }
    else if (error.code == "ETIMEDOUT") {
      logger.error("Application hit a connection timeout (e.g. to a Discord websocket endpoint)");
    }
    else {
      logger.error(`[${new Date().toUTCString()}] Application startup error: ${error.message}`);
    }

    logger.debug(error.stack);
    shutdown();
  });
