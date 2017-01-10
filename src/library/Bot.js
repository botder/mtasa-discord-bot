
const discordjs     = require("discord.js");
const EventEmitter  = require("events").EventEmitter;

class Bot extends EventEmitter
{
  constructor(token)
  {
    super();
    this.token  = token;
    this.client = new discordjs.Client();
  }

  login()
  {
    return this.client.login(this.token);
  }

  logout()
  {
    return this.client.destroy();
  }
}

module.exports = Bot;
