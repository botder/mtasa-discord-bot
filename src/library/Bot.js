"use strict";

const Discord       = require("discord.js");
const EventEmitter  = require("events").EventEmitter;
const Emojione      = require("emojione");

class Bot extends EventEmitter {
    /**
     * @param {string} server
     * @param {string} channel
     */
    constructor(server, channel) {
        super();

        this.info = {};
        this.serverId = server;
        this.channelName = channel;
        this.server = null;
        this.channel = null;
        this.connected = false;

        this.client = new Discord.Client({
            "autoReconnect": true,
            "guildCreateTimeout": 1000, // default: 1000
            "largeThreshold": 250, // default: 250
            "maxCachedMessages": 50, // default: 1000
            "rateLimitAsError": false // default: false
        });

        this.client.on("ready", this._ready.bind(this));
        this.client.on("error", this._error.bind(this));
        this.client.on("disconnected", this._disconnected.bind(this));
        this.client.on("message", this._message.bind(this));
        this.client.on("serverCreated", this._serverCreated.bind(this));
        this.client.on("serverDeleted", this._serverDeleted.bind(this));
        this.client.on("channelCreated", this._channelCreated.bind(this));
        this.client.on("channelDeleted", this._channelDeleted.bind(this));
    }

    get id() {
        return this.info.id || false;
    }

    get name() {
        return this.info.name || false;
    }

    get discriminator() {
        return this.info.discriminator || false;
    }

    get created() {
        return this.info.createdAt || false;
    }

    get online() {
        return this.connected;
    }

    sendMessage(message) {
        if (!this.connected || !this.channel)
            return;

        this.client.sendMessage(this.channel, message).catch((error) => {
            if (error)
                console.log(`Bot ${this.name} error: ${error.toString()}\n${error.stack}`);
        });
    }

    /**
     * @param {string} token
     * @param {function} [callback]
     */
    loginWithToken(token, callback = () => {}) {
        return this.client.loginWithToken(token, callback);
    }

    /**
     * @param {function} [callback]
     */
    logout(callback = () => {}) {
        return this.client.logout(callback);
    }

    /**
     * @param {function} [callback]
     */
    destroy(callback = () => {}) {
        return this.client.destroy(callback);
    }

    _ready() {
        // Update internal bot user information
        this.info.id = this.client.user.id;
        this.info.name = this.client.user.name;
        this.info.discriminator = this.client.user.discriminator;
        this.info.createdAt = this.client.user.createdAt;

        // Delete private channels
        for (let channel of this.client.privateChannels)
            channel.delete();

        // Leave ignored servers
        for (let server of this.client.servers) {
            if (server.id !== this.serverId) {
                console.log(`Server ${server.name} is not whitelisted for bot ${this.name}`);
                server.leave();
            }
        }

        // Search for selected server by id
        let server = this.client.servers.get("id", this.serverId);

        if (server) {
            this.server = server;
            let channel = server.channels.get("name", this.channelName);

            if (channel)
                this.channel = channel;
        }

        this.connected = true;
        this.emit("ready");
    }

    _error(error) {
        console.log(`Bot ${this.name} error: ${error.toString()}\n${error.stack}`);
    }

    _disconnected() {
        if (!this.connected)
            return;
        
        this.server = null;
        this.channel = null;
        this.connected = false;
        this.emit("disconnected");
    }

    _message(msg) {
        // Ignore bot and private messages
        if (msg.channel.isPrivate || msg.author.bot)
            return;

        // Ignore messages with attachments
        if (msg.attachments.length > 0)
            return;

        // Ignore messages from ignored servers/channels
        if (!msg.channel.equals(this.channel))
            return;

        var nick = msg.server.detailsOf(msg.author).nick || msg.author.name;
        msg.cleanContent = Emojione.toShort(Bot.decodeEmojis(Bot.decodeMessage(msg)));
        this.emit("message", msg);
    }

    _serverCreated(server) {
        // Leave ignored servers
        if (this.server || server.id !== this.serverId) {
            console.log(`Server ${server.name} is not whitelisted for bot ${this.name}`);
            server.leave();
        }
        else if (!this.server && server.id === this.serverId) {
            this.server = server;
            let channel = server.channels.get("name", this.channelName);

            if (channel)
                this.channel = channel;
        }
    }

    _serverDeleted(server) {
        // Our server has been deleted (maybe bot was kicked)
        if (server.equals(this.server)) {
            this.server = null;
            this.channel = null;
        }
    }

    _channelCreated(channel) {
        // Delete private channels
        if (channel.isPrivate)
            return channel.delete();
        
        // Is it our channel?
        if (!this.channel && channel.name === this.channelName)
            this.channel = channel;
    }

    _channelDeleted(channel) {
        // Our channel has been deleted
        if (channel.equals(this.channel)) {
            this.channel = null;
        }
    }

    static decodeEmojis(message) {
        return message.replace(/<(:\w+:)\d+>/g, "$1");
    }

    static decodeMessage(msg) {
        if (msg.channel.isPrivate)
            return msg.content;

        let server = msg.server;

        return msg.content.replace(/<@&(\d+)>|<@!(\d+)>|<@(\d+)>|<#(\d+)>/g, (match, RID, NID, UID, CID) => {
            if (UID || NID) {
                var user = server.members.get("id", UID || NID);
                
                if (user) {
                    if (UID)
                        return "@" + user.name;
                    else if (NID)
                        return "@" + (server.detailsOf(user).nick || user.name);
                }
            }
            else if (CID) {
                var channel = server.channels.get("id", CID);

                if (channel)
                    return "#" + channel.name;
            }
            else if (RID) {
                var role = server.roles.get("id", RID);

                if (role)
                    return "@" + role.name;
            }

            return "";
        });
    }
}

module.exports = Bot;
