"use strict";

const Handler = require("./Handler");

class ChatMessageHandler extends Handler {
    constructor() {
        super();
        this.types.add("chat.message.text");
        this.types.add("chat.message.block");
        this.types.add("chat.message.action");
        this.types.add("chat.message.team");
        this.types.add("chat.message.interchat");
    }

    execute(bot, session, type, payload) {
        if (!payload.author || !payload.text)
            return;
        
        let author = this.escape(payload.author);
        let text = this.escape(payload.text);

        if (type == "chat.message.text")
            bot.sendMessage(`**${author}:** ${text}`);
        else if (type == "chat.message.action") {
            // TODO: Review in the future
            // Discord has a nasty inconsistency in his markdown
            // There have to be two characters at the finishing asterisk for cursive
            if (text.length == 1)
                bot.sendMessage(`\\* _${author} ${text}_`);
            else {
                // Use a zero width space to pad the characters at the end 
                let fixed = text.replace(/(\s.)\$/m, "$1\u200b");
                bot.sendMessage(`\\* *${author} ${fixed}*`);
            }
        }
        else if (type == "chat.message.interchat") {
            let server = payload.server ? ` ${this.escape(payload.server)}` : "";
            bot.sendMessage(`[:globe_with_meridians:${server}] **${author}:** ${text}`);
        }
        else if (type == "chat.message.block") {
            let reason = this.escape(payload.reason || "no reason");
            bot.sendMessage(`[:x:] **${author}:** *${text}* (${reason})`);
        }
        else if (type == "chat.message.team") {
            if (payload.team)
                bot.sendMessage(`(${this.escape(payload.team)}) **${author}** ${text}`);
        }
    }
}

module.exports = ChatMessageHandler;
