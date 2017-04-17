"use strict";

const Handler = require("./Handler");

class PlayerEventHandler extends Handler {
    constructor() {
        super();

        this.types.add("player.join");
        this.types.add("player.kick");
        this.types.add("player.ban");
        this.types.add("player.quit");
        this.types.add("player.nickchange");
        this.types.add("player.mute");
        this.types.add("player.unmute");
        this.types.add("player.finish");
        this.types.add("player.toptime");

        this.ranks = [];
        this.ranks[1] = { suffix: "st", emoji: ":checkered_flag:" };
        this.ranks[2] = { suffix: "nd", emoji: ":checkered_flag:" };
        this.ranks[3] = { suffix: "rd", emoji: ":checkered_flag:" };
    }

    execute(bot, session, type, payload) {
        if (!payload.player)
            return;

        let player = this.escape(payload.player);
        let reason = payload.reason ? this.escape(payload.reason) : false;

        if (type == "player.join")
            bot.sendMessage(`:inbox_tray: ${player} has joined`).catch(() => console.error("bot.sendMessage error @ PlayerEventHandler.js#33"));
        else if (type == "player.kick") {
            let responsible = this.escape(payload.responsible || "Console");

            if (reason)
                bot.sendMessage(`:boot: ${player} has been kicked by ${responsible} (reason: ${reason})`).catch(() => console.error("bot.sendMessage error @ PlayerEventHandler.js#38"));
            else
                bot.sendMessage(`:boot: ${player} has been kicked by ${responsible}`).catch(() => console.error("bot.sendMessage error @ PlayerEventHandler.js#40"));
        }
        else if (type == "player.ban") {
            let responsible = this.escape(payload.responsible || "Console");

            if (reason)
                bot.sendMessage(`:hammer_pick: ${player} has been banned by ${responsible} (reason: ${reason})`).catch(() => console.error("bot.sendMessage error @ PlayerEventHandler.js#46"));
            else
                bot.sendMessage(`:hammer_pick: ${player} has been banned by ${responsible}`).catch(() => console.error("bot.sendMessage error @ PlayerEventHandler.js#48"));
        }
        else if (type == "player.quit") {
            if (!payload.type)
                return;

            let quitType = this.escape(payload.type);

            if (reason)
                bot.sendMessage(`:door: ${player} has left [${quitType}] (reason: ${reason})`).catch(() => console.error("bot.sendMessage error @ PlayerEventHandler.js#57"));
            else
                bot.sendMessage(`:door: ${player} has left [${quitType}]`).catch(() => console.error("bot.sendMessage error @ PlayerEventHandler.js#59"));
        }
        else if (type == "player.nickchange") {
            if (!payload.previous)
                return;

            let previous = this.escape(payload.previous);

            bot.sendMessage(`:label: ${previous} is now known as ${player}`).catch(() => console.error("bot.sendMessage error @ PlayerEventHandler.js#67"));
        }
        else if (type == "player.mute")
            bot.sendMessage(`:mute: ${player} has been muted`).catch(() => console.error("bot.sendMessage error @ PlayerEventHandler.js#70"));
        else if (type == "player.unmute")
            bot.sendMessage(`:speaker: ${player} has been unmuted`).catch(() => console.error("bot.sendMessage error @ PlayerEventHandler.js#72"));
        else if (type == "player.finish") {
            if (!payload.rank || !this.ranks[payload.rank])
                return;

            let rank = this.ranks[payload.rank];
            bot.sendMessage(`${rank.emoji} ${player} finished as **${payload.rank}${rank.suffix}**`).catch(() => console.error("bot.sendMessage error @ PlayerEventHandler.js#78"));
        }
        else if (type == "player.toptime") {
            if (typeof payload.position !== "number" || !payload.time)
                return;

            let time = this.escape(payload.time);
            bot.sendMessage(`:trophy: ${player} has made a new #${payload.position} toptime **[${time}]**`).catch(() => console.error("bot.sendMessage error @ PlayerEventHandler.js#85"));
        }
    }
}

module.exports = PlayerEventHandler;
