"use strict";

const Bot                   = require("./library/Bot");
const Server                = require("./library/Server");
const PacketManager         = require("./library/PacketManager");
const SelectChannelPacket   = require("./library/packets/SelectChannelPacket");
const TextMessagePacket     = require("./library/packets/TextMessagePacket");
const TextCommandPacket     = require("./library/packets/TextCommandPacket");

/**
 * Application configuration
 */
let config = require("./config.json");

/**
 * Public socket endpoint server
 */
let server = new Server(config.port || 8095, config.passphrase);

/**
 * Generic packet manager
 */
let packetManager = new PacketManager();

/**
 * Channel => Bot
 */
let channelBots = new Map();

/**
 * Channel => Session
 */
let channelSessions = new Map();

// Create bots from configuration
for (let botconfig of config.bots) {
    let channel = botconfig.channel;

    // Disallow channel duplicates
    if (channelBots.has(channel)) {
        console.log(`Skipping duplicate bot for channel ${channel}`);
        continue;
    }

    // Create the Bot instance
    let bot = new Bot(config.guild, channel, botconfig.token);
    channelBots.set(channel, bot);

    bot.on("ready", () => {
        console.log(`Bot ${bot.name} connected`);
        channelBots.set(channel, bot);

        // Send confirmation to waiting session
        if (channelSessions.has(bot.channelName)) {
            let session = channelSessions.get(bot.channelName);
            session.send(SelectChannelPacket.success());
            bot.emit("session.bind", session);
        }
    });

    bot.on("disconnect", () => {
        console.log(`Bot ${bot.name} disconnected`);

        // Remove this bot
        channelBots.delete(bot.channelName);
    });

    bot.on("message", (msg) => {
        if (!channelSessions.has(bot.channelName))
            return;

        if (msg.cleanMessage.length > 200)
            return;

        let session = channelSessions.get(bot.channelName);

        // TODO: Ratelimit for spammers

        // Send message to MTA server
        if (msg.content.startsWith("."))
            session.send(new TextCommandPacket(msg));
        else
            session.send(new TextMessagePacket(msg));
    });

    bot.on("session.bind", (session) => {
        if (!session.get("bind-message")) {
            bot.sendMessage(`**Bot:** Hello :sparkles:`);
            session.set("bind-message", true)
        }
    });

    function login() {
        bot.login()
            .catch((error) => {
                console.error(`Bot failed to login: ${error.message}`);
                setTimeout(login, 5000);
            });
    }

    login();
}

server.on("session.ready", (session) => {
    session.set("channel", false);
});

server.on("session.close", (session) => {
    if (!session.get("channel"))
        return;

    let channel = session.get("channel");

    if (channelSessions.has(channel)) {
        channelSessions.delete(channel);
    }
});

server.on("data", (session, type, payload) => {
    if (!session.get("channel")) {
        if (type == "select-channel") {
            // Verify payload
            if (typeof payload.channel !== "string")
                return session.send(SelectChannelPacket.error("no channel name in payload")).close();

            // Check if any bot manages this channel
            if (!channelBots.has(payload.channel))
                return session.send(SelectChannelPacket.error("channel not available"));

            // Check if any session already reserved this channel
            if (channelSessions.has(payload.channel))
                return session.send(SelectChannelPacket.error("channel is reserved")).close();

            // Reserve channel for session
            channelSessions.set(payload.channel, session);
            session.set("channel", payload.channel);

            // Send welcome message to channel
            let bot = channelBots.get(payload.channel);

            if (!bot.online)
                return session.send(SelectChannelPacket.wait());
            else
                bot.emit("session.bind", session);

            return session.send(SelectChannelPacket.success());
        }
        else
            return session.send(SelectChannelPacket.error("no channel selected")).close();
    }
    else {
        let channel = session.get("channel");
        let bot = channelBots.get(channel);
        packetManager.process(bot, session, type, payload);
    }
});

server.listen();

process.on("unhandledRejection", (error, promise) => {
    console.error(`Unhandled promise rejection: ${error.message}`);
    console.error(error.stack);
});

process.on("uncaughtException", (error) => {
    console.error(`Uncaught exception: ${error.message}`);
    console.error(error.stack);
    process.exit();
});
