
const Discord       = require(__dirname + "/Discord");
const RelayServer   = require(__dirname + "/RelayServer");

class App
{
  constructor(config)
  {
    // Create discord interface
    this.discord = new Discord(config.discord);

    // Create relay server
    this.relay = new RelayServer(config.relay);

    this.relay.on("session.packet", (session, type, payload) => {
      logger.debug(`[${type}] >> ${JSON.stringify(payload)}`);
    });
  }

  start()
  {
    return Promise.all([
      this.relay.start(),
      this.discord.start()
    ]);
  }

  stop()
  {
    return Promise.all([
      this.relay.stop(),
      this.discord.stop()
    ]);
  }
}

module.exports = App;
