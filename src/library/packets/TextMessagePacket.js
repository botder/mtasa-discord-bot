"use strict";

const Packet = require("./Packet");

class TextMessagePacket extends Packet {
    constructor(msg) {
        super();
        this.type = "text.message";
        this.payload = {
            author: {
                id: msg.author.id,
                name: msg.server.detailsOf(msg.author).nick || msg.author.name,
                roles: msg.server.rolesOf(msg.author).map(r => r.name),
            },
            message: {
                id: msg.id,
                text: msg.cleanContent,
            }
        };
    }
}

module.exports = TextMessagePacket;
