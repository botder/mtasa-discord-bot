
const util          = require("util");
const Bot           = require(`${libdir}/Bot`);
const RelayServer   = require(`${libdir}/RelayServer`);
const Packets       = require(`${libdir}/Packets`);

class App
{
  constructor(config)
  {
    // Create Discord interface
    this.bot = new Bot(config.discord);

    this.bot.on("message", (message) => {
      logger.debug(`[App] #${message.channel.name} ${message.member.displayName}: ${message.cleanContent}`);
    });

    // Create relay server
    this.relay = new RelayServer(config.relay);

    this.relay.on("session.packet", (session, type, payload) => {
      logger.debug(`<< ${type} >>`, payload);

      if (type == "channel.bind") {
        if (!util.isString(payload.channel) || !payload.channel) {
          logger.debug(`[App] Session ${session.id}: Malformed channel bind packet`);
          return session.send(new Packets.Bind(false, "invalid payload")).close();
        }

        // return this.discord.bindChannel(session, payload.channel);
      }
    });
  }

  start()
  {
    return Promise.all([
      this.relay.start(),
      this.bot.login()
    ]);
  }

  stop()
  {
    return Promise.all([
      this.relay.stop(),
      this.bot.logout()
    ]);
  }
}

module.exports = App;
