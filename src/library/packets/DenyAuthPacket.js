"use strict";

const AuthPacket = require("./AuthPacket");

class DenyAuthPacket extends AuthPacket {
    constructor(error) {
        super();
        this.payload = { "authenticated": false, "error": error || false };
    }
}

module.exports = DenyAuthPacket;
