"use strict";

const Handler = require("./Handler");

class WebradioHandler extends Handler {
    constructor() {
        super();
        this.types.add("webradio.stream");
    }

    execute(bot, session, type, payload) {
        let author = this.escape(payload.author);
        let text = this.escape(payload.text);

        if (type == "webradio.stream") {
            if (!payload.title)
                return;

            let title = this.escape(payload.title);

            bot.sendMessage(`:musical_note: Playing now ♪♫ ${title} ♫♪`).catch(() => console.error("bot.sendMessage error @ WebradioHandler.js#21"));
        }
    }
}

module.exports = WebradioHandler;
