"use strict";

const Packet = require("./Packet");

class TextCommandPacket extends Packet {
    constructor(msg) {
        super();

        this.type = "text.command";

        let params = msg.cleanMessage.split(/\s+/);
        let command = (params.splice(0, 1))[0].substr(1);

        this.payload = {
            author: {
                id: msg.author.id,
                name: msg.member.displayName,
                roles: msg.member.roles.map(r => r.name),
            },
            message: {
                command,
                params,
                id: msg.id,
                text: msg.cleanMessage,
            }
        };
    }
}

module.exports = TextCommandPacket;
