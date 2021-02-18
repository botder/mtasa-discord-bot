"use strict";

const Handler = require("./Handler");

class ServerStatusHandler extends Handler {
    constructor() {
        super();

        this.types.add("server.player_count");
    }

    execute(bot, session, type, payload) {
        if (type == "server.player_count") {
            bot.setActivity(`${payload.player_count}/${payload.max_players}`);
        }
    }
}

module.exports = ServerStatusHandler;
