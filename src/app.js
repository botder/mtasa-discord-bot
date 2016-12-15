
const RelayServer = require(__dirname + "/library/RelayServer");

// Load configuration
const config = require(__dirname + "/config.json");

// Create relay server
const server = new RelayServer(config["relay-port"], config["relay-password"]);

server.on("session.packet", (session, type, payload) => {
    console.log(`[${type}] >> ${JSON.stringify(payload)}`);
});

server.listen();
