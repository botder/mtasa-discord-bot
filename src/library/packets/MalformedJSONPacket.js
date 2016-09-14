"use strict";

const Packet = require("./Packet");

class MalformedJSONPacket extends Packet {
    constructor() {
        super();
        this.type = "malformed-json";
    }
}

module.exports = MalformedJSONPacket;
