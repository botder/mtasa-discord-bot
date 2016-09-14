"use strict";

const Packet = require("./Packet");

class PingPacket extends Packet {
    constructor() {
        super();
        this.type = "ping";
    }
}

module.exports = PingPacket;
