
// Perform initial version requirement check on the running environment
var semver = require("semver");

if (semver.lt(process.versions.node, "6.9.2")) {
    console.error("Please update node to v6.9.2 LTS or later!");
    process.exit();
}
else {
    console.log(`Node.js version: ${process.versions.node}`);
}

// Setup a honeypot for uncaught exceptions
process.on("uncaughtException", (error) => {
    console.error((new Date).toUTCString() + " uncaughtException:", err.message);
    console.error(err.stack);
    process.exit(1);
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

// Graceful shutdown
process.on("SIGINT", () => {
    process.exit();
});

// Boot the application
require(__dirname + "/app.js");
