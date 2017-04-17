"use strict";

const Handler = require("./Handler");

class MapManagerHandler extends Handler {
    constructor() {
        super();
        this.types.add("mapmanager.mapstart");
    }

    execute(bot, session, type, payload) {
        if (type == "mapmanager.mapstart") {
            if (!payload.name)
                return;

            let name = this.escape(payload.name);
            bot.sendMessage(`:map: Map '${name}' started`).catch(() => console.error("bot.sendMessage error @ MapManagerHandler.js#17"));
        }
    }
}

module.exports = MapManagerHandler;
