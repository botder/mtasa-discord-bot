"use strict";

const Bot                   = require("./Bot");
const Session               = require("./Session");
const Handler               = require("./handler/Handler");
const ChatMessageHandler    = require("./handler/ChatMessageHandler");
const ChatConfirmHandler    = require("./handler/ChatConfirmHandler");
const PlayerEventHandler    = require("./handler/PlayerEventHandler");
const MapManagerHandler     = require("./handler/MapManagerHandler");
const WebradioHandler       = require("./handler/WebradioHandler");

class PacketManager {
    constructor() {
        this.handlers = new Map();
        this._setup();
    }

    _setup() {
        this.register(new ChatMessageHandler());
        this.register(new ChatConfirmHandler());
        this.register(new PlayerEventHandler());
        this.register(new MapManagerHandler());
        this.register(new WebradioHandler());
    }

    /**
     * @param {Handler} handler
     */
    register(handler) {
        if (!handler || !(handler instanceof Handler))
            return;

        for (let type of handler.types)
            this.handlers.set(type, handler);
    }

    /**
     * @param {Bot} bot
     * @param {Session} session
     * @param {string} type
     * @param {object} payload
     */
    process(bot, session, type, payload) {
        if (!bot || !(bot instanceof Bot) || !session || !(session instanceof Session))
            return;

        if (typeof type !== "string" || typeof payload !== "object" || !payload)
            return;

        if (!this.handlers.has(type))
            return;

        (this.handlers.get(type)).execute(bot, session, type, payload);
    }
}

module.exports = PacketManager;
