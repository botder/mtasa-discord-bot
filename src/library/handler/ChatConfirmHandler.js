"use strict";

const Handler = require("./Handler");

class ChatConfirmHandler extends Handler {
    constructor() {
        super();
        this.types.add("chat.confirm.message");
        this.types.add("chat.confirm.command");
    }

    execute(bot, session, type, payload) {
        if (!payload.author || !payload.message || !payload.message.text)
            return;
        
        let author = this.escape(payload.author);
        let text = payload.message.text;

        if (type == "chat.confirm.message")
            bot.sendMessage(`[Đ] **${author}:** ${text}`);
        else if (type == "chat.confirm.command") {
            let prefix = payload.message.id ? "Đ: " : (payload.message.tag ? (payload.message.tag + ": ") : "");

            if (payload.message.prefix)
                bot.sendMessage(`${prefix}**${author}** ${text}`);
            else
                bot.sendMessage(`(${prefix}**${author}**) ${text}`);
        }

        /* Broken on Android
        if (payload.message.id && !bot.channel)
            return;
        
        let message = bot.channel.messages.get("id", payload.message.id);
        bot.client.deleteMessage(message);*/
    }
}

module.exports = ChatConfirmHandler;
