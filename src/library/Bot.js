
const discordjs     = require("discord.js");
const EventEmitter  = require("events").EventEmitter;

class Bot extends EventEmitter
{
  constructor(config)
  {
    super();

    this.token  = config.bot_token;
    this.client = new discordjs.Client();

    this.client.on("ready", () => {
      this.client.user.setGame(config.playing);
      logger.verbose("[Bot] Connected");
    });

    this.client.on("disconnect", () => {
      logger.verbose("[Bot] Disconnect");
    });
    
    this.client.on("error", (error) => {
      logger.verbose(`[Bot] Error: ${error.message}`);
    });

    this.client.on("warn", (info) => {
      logger.verbose(`[Bot] Warn: ${info}`);
    });

    this.client.on("reconnecting", () => {
      logger.verbose("[Bot] Reconnecting");
    });

    this.client.on("message", (message) => {
      // Ignore messages from the system, from non-guild text channels and from bots
      if (message.system || message.channel.type != "text" || message.author.bot) {
        logger.verbose(`[Bot] Ignore message from user ${message.author.username}`);
        return;
      }

      // Ignore messages with attachments
      if (message.attachments.size > 0) {
        return;
      }
      
      // Pass message further down the pipe
      // msg.rawContent = Emojione.toShort(Bot.decodeEmojis(Bot.decodeMessage(msg)));
      this.emit("message", message);
    });
  }

  login()
  {
    return this.client.login(this.token);
  }

  logout()
  {
    return this.client.destroy();
  }

  hasChannel(id)
  {
    return this.client.channels.has(id);
  }

  getChannelName(id)
  {
    if (this.hasChannel(id)) {
      return this.client.channels.get(id).name;
    }

    return null;
  }

  getChannelGuildName(id)
  {
    if (this.hasChannel(id)) {
      return this.client.channels.get(id).guild.name;
    }

    return null;
  }
}

module.exports = Bot;
