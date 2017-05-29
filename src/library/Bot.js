"use strict";

const Discord       = require("discord.js");
const EventEmitter  = require("events").EventEmitter;
const Emojione      = require("emojione");

class Bot extends EventEmitter {
    constructor(guild, channel, token) {
        super();

        this.info = {};
        this.guildId = guild;
        this.channelName = channel;
        this.token = token;
        this.guild = null;
        this.channel = null;
        this.connected = false;
        this.reconnectTimer = null;
        this.client = new Discord.Client();

        this.client.on("ready", this._ready.bind(this));
        this.client.on("error", this._error.bind(this));
        this.client.on("disconnect", this._disconnect.bind(this));
        this.client.on("message", this._message.bind(this));
        this.client.on("guildCreate", this._guildCreate.bind(this));
        this.client.on("guildDelete", this._guildDelete.bind(this));
        this.client.on("channelCreate", this._channelCreate.bind(this));
        this.client.on("channelDelete", this._channelDelete.bind(this));
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
        if (!this.connected || !this.channel) {
            return Promise.reject(new Error("Bot is offline or not in your guild or didn't find the specified channel"));
        }

        return this.channel.send(message);
    }

    login() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        return this.client.login(this.token);
    }

    _ready() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        
        // Update internal bot user information
        this.info.id = this.client.user.id;
        this.info.name = this.client.user.username;
        this.info.discriminator = this.client.user.discriminator;
        this.info.createdAt = this.client.user.createdAt;

        // Delete private channels
        for (let channel of this.client.channels.filterArray(ch => ch.type == "dm" || ch.type == "group")) {
            channel.delete();
        }

        // Leave ignored guilds
        for (let guild of this.client.guilds.filterArray(g => g.id !== this.guildId)) {
            console.log(`Guild ${guild.name} is not whitelisted for bot ${this.name}`);
            guild.leave();
        }

        // Search for selected guild by id
        let guild = this.client.guilds.get(this.guildId);

        if (guild) {
            this.guild = guild;
            let channel = guild.channels.find("name", this.channelName);

            if (channel) {
                this.channel = channel;
            } else {
                this.channel = null;
            }
        }

        this.connected = true;
        this.emit("ready");
    }

    _error(error) {
        console.log(`Bot ${this.name} error: ${error.toString()}\n${error.stack}`);
    }

    _disconnect() {
        if (!this.connected) {
            return;
        }

        let reconnectFunc = (() => {
            console.log(`Bot ${this.name} reached reconnect timeout. Forcing reconnect..`);
            this.reconnectTimer = null;
            this.login().catch((error) => {
                console.log(`Bot ${this.name} failed to reconnect after timeout. Trying again in 5 minutes.`);
                this.reconnectTimer = setTimeout(reconnectFunc, 5 * 60000);
            });
        }).bind(this);

        this.reconnectTimer = setTimeout(reconnectFunc, 10000);

        this.guild = null;
        this.channel = null;
        this.connected = false;
        this.emit("disconnect");
    }

    _message(msg) {
        // Ignore bot and private messages
        if (msg.system || !msg.member || msg.author.bot) {
            return;
        }

        // Ignore messages with attachments
        if (msg.attachments.size > 0) {
            return;
        }

        // Ignore messages from ignored guilds/channels
        if (msg.channel !== this.channel) {
            return;
        }

        msg.cleanMessage = Emojione.toShort(Bot.decodeEmojis(msg.cleanContent));
        this.emit("message", msg);
    }

    _guildCreate(guild) {
        // Leave ignored guilds
        if (guild.id !== this.guildId) {
            console.log(`Guild ${guild.name} is not whitelisted for bot ${this.name}`);
            guild.leave();
        } else {
            this.guild = guild;
            this.channel = guild.channels.find("name", this.channelName) || null;
        }
    }

    _guildDelete(guild) {
        // Our guild has been deleted (maybe bot was kicked)
        if (guild === this.guild) {
            this.guild = null;
            this.channel = null;
        }
    }

    _channelCreate(channel) {
        // Delete private channels
        if (channel.type != "text")
            return channel.delete();

        // Is it our channel?
        if (channel.name === this.channelName) {
            this.channel = channel;
        }
    }

    _channelDelete(channel) {
        // Our channel has been deleted
        if (channel === this.channel) {
            this.channel = null;
        }
    }

    static decodeEmojis(message) {
        return message.replace(/<(:\w+:)\d+>/g, "$1");
    }
}

module.exports = Bot;
