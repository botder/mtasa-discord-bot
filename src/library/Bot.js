
const assert        = require("assert");
const Discord       = require("discord.js");
const EventEmitter  = require("events").EventEmitter;

class Bot extends EventEmitter
{
    constructor(token) {
        super();

        assert.equal(typeof(token), "string");

        this.client = new Discord.Client();
    }
}

module.exports = Bot;
