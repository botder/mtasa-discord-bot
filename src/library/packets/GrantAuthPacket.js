"use strict";

const AuthPacket = require("./AuthPacket");

class GrantAuthPacket extends AuthPacket {
    constructor() {
        super();
        this.payload = { "authenticated": true };
    }
}

module.exports = GrantAuthPacket;
