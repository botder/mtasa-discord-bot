"use strict";

const Packet = require("./Packet");

class SelectChannelPacket extends Packet {
    constructor(payload = {}) {
        super();
        this.type = "select-channel";
        this.payload = payload;
    }

    static success() {
        return new SelectChannelPacket({ "success": true });
    }

    static wait() {
        return new SelectChannelPacket({ "success": true, "wait": true })
    }

    /**
     * @param {string} [eror]
     */
    static error(error = "") {
        return new SelectChannelPacket({ "success": false, "error": error });
    }
}

module.exports = SelectChannelPacket;
