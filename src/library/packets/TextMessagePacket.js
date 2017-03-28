"use strict";

const Packet = require("./Packet");

class TextMessagePacket extends Packet {
    constructor(msg) {
        super();
        this.type = "text.message";
        this.payload = {
            author: {
                id: msg.author.id,
                name: msg.member.displayName,
                roles: msg.member.roles.map(r => r.name),
            },
            message: {
                id: msg.id,
                text: msg.cleanMessage,
            }
        };
    }
}

module.exports = TextMessagePacket;
