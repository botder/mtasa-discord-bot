"use strict";

class Handler {
    constructor() {
        this.types = new Set();
    }

    execute(/* bot, session, type, payload */) {
        throw new Error("execute in abstract handler");
    }

    escape(str) {
        return String(str)
            .replace(/\\/g, "\\\\")
            .replace(/\*/g, "\u2217")
            .replace(/_/g, "\u02CD")
            .replace(/~/g, "\u223C")
            .replace(/`/g, "\u02CB");
            //.replace(/([\*\~_`])/g, "\\$1")
            //.replace(/:.*(\\_)+.*:/g, s => s.replace("\\_", "_"));
    }
}

module.exports = Handler;
