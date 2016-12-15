
// Perform initial version requirement check on the running environment
var semver = require("semver");

if (semver.lt(process.versions.node, "6.9.2")) {
    console.error("Please update node to v6.9.2 LTS or later!");
    process.exit();
}
else {
    console.log(`Node.js version: ${process.versions.node}`);
}

// Boot the application
require(__dirname + "/app.js");
