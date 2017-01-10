
const util                  = require("util");
const EventEmitter          = require("events").EventEmitter;
const Server                = require(`${libdir}/Server`);
const RelayUtil             = require(`${libdir}/RelayUtil`);
const DenyAuthPacket        = require(`${libdir}/packets/DenyAuthPacket`);
const GrantAuthPacket       = require(`${libdir}/packets/GrantAuthPacket`);
const MalformedJSONPacket   = require(`${libdir}/packets/MalformedJSONPacket`);

class RelayServer extends EventEmitter
{
  constructor(config)
  {
    super();

    this.password = RelayUtil.encryptPassword(config.password);
    this.server   = new Server(config.hostname, config.port);

    this.server.on("ready", () => {
      logger.info(`Relay listening on ${this.server.port}`);
    });

    this.server.on("close", () => {
      logger.info(`Relay on port ${this.server.port} closed`);
    });

    this.server.on("session.data", (session, data) => {
      if (session.get("authenticated")) {
        if (!util.isString(data.type) || !data.type) {
          logger.debug(`RelayServer: Session ${session.id}: Malformed packet:`, data);
          return session.send(new MalformedJSONPacket());
        }

        let payload = (typeof(data.payload) == "object" && data.payload != null) ? data.payload : {};

        return this.emit("session.packet", session, data.type, payload);
      }

      if (typeof(data.type) != "string" || !data.type || typeof(data.payload) != "object" || data.payload == null) {
        logger.debug(`RelayServer: Session ${session.id}: Malformed packet:`, data);
        return session.send(new MalformedJSONPacket()).close();
      }

      if (typeof(data.payload.salt) != "string" || typeof(data.payload.password) != "string") {
        logger.debug(`RelayServer: Session ${session.id}: Malformed authentication packet:`, data);
        return session.send(new DenyAuthPacket("invalid payload")).close();
      }

      if (data.type != "auth" || data.payload.salt.length != 32 || data.payload.password.length != 64) {
        logger.debug(`RelayServer: Session ${session.id}: Malformed authentication packet:`, data);
        return session.send(new DenyAuthPacket("invalid payload")).close();
      }

      let hash = RelayUtil.encryptWithSalt(this.password, data.payload.salt);

      if (hash !== data.payload.password) {
        logger.debug(`RelayServer: Session ${session.id}: Invalid password sent`);
        return session.send(new DenyAuthPacket("invalid authentication payload")).close();
      }

      session.set("authenticated", true);
      logger.debug(`RelayServer: Session ${session.id}: Authenticated`);

      return session.send(new GrantAuthPacket());
    });
  }

  start()
  {
    return this.server.listen();
  }

  stop()
  {
    return this.server.close();
  }
}

module.exports = RelayServer;
