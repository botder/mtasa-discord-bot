
const Bot           = require(__dirname + "/library/Bot");
const RelayServer   = require(__dirname + "/library/RelayServer");

// Load configuration
const config = require(__dirname + "/config.json");

if (typeof(config.relay) !== "object" || config.relay === null) {
    console.error("Your relay configuration is corrupted or out of date, please update.");
    process.exit();
}

if (typeof(config.discord) !== "object" || config.discord === null) {
    console.error("Your discord configuration is corrupted or out of date, please update.");
    process.exit();
}

// Create bot
const bot = new Bot(config.discord.bot_token);

// Create relay server
const server = new RelayServer(config.relay);

server.on("session.packet", (session, type, payload) => {
    console.log(`[${type}] >> ${JSON.stringify(payload)}`);
});

server.listen();
