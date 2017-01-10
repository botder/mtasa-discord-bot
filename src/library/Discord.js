
const Bot           = require(__dirname + "/Bot");
const EventEmitter  = require("events").EventEmitter;

class Discord extends EventEmitter
{
  constructor(config)
  {
    super();

    this.bot    = new Bot(config.bot_token);
    this.guilds = new Map();

    for (let guild of config.guilds) {
      this.guilds.set(guild.id, guild.channels.filter(value => typeof(value) == "string" && !!value));
    }
  }

  start()
  {
    return this.bot.login();
  }

  stop()
  {
    return this.bot.logout();
  }

  isGuildAvailable(id)
  {
    if (typeof(id) != "string" || !id) {
      return false;
    }

    if (!this.guilds.has(id)) {
      return false;
    }

    // TODO: check if bot is in guild with <id>
    return true;
  }
}

module.exports = Discord;
