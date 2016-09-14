"use strict";

const Packet = require("./Packet");

class ClosePacket extends Packet {
    constructor() {
        super();
        this.type = "disconnect";
    }
}

module.exports = ClosePacket;
