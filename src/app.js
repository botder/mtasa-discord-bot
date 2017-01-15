/* eslint no-console: 0 */

/*
 * This application requires 6.9.2 LTS (or newer) release of NodeJS.
 * It has been not designed to work with older releases
 */
var semver = null;

try {
  semver = require("semver");
}
catch (error) {
  if (error.code == "MODULE_NOT_FOUND") {
    console.error("Please install the dependencies of the package (npm install)");
  }
  else {
    console.error("Error:", error.message);
  }
  
  process.exit();
}

if (semver.lt(process.versions.node, "6.9.2")) {
  console.error("Your environment doesn't fulfill the neccessary requirements to be");
  console.error("able to run this application in any functional and stable matter.");
  console.error("Please update your installation of NodeJS to v6.9.2 LTS or newer!");
  process.exit();
}

/*
 * After verifying the environment of the current process we can continue with
 * starting each component of the application
 */
require(__dirname + "/app/setup.js");
