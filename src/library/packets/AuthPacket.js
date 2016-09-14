"use strict";

const Packet = require("./Packet");

class AuthPacket extends Packet {
    constructor() {
        super();
        this.type = "auth";
    }
}

module.exports = AuthPacket;
