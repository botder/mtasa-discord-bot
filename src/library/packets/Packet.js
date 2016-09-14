"use strict";

class Packet {
    /**
     * @param {string} [type]
     */
    constructor(type = "unknown") {
        this.type = type;
        this.payload = {};
    }

    toString() {
        if (!Object.getOwnPropertyNames(this.payload).length)
            return JSON.stringify({ "type": this.type });
        else
            return JSON.stringify({ "type": this.type, "payload": this.payload });
    }
}

module.exports = Packet;
