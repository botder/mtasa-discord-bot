
const net           = require("net");
const assert        = require("assert");
const EventEmitter  = require("events").EventEmitter;
const Session       = require(`${libdir}/Session`);

class Server extends EventEmitter
{
  constructor(hostname, port)
  {
    super();

    assert.ok(typeof(port) == "number" && port > 0);
    assert.ok(hostname && typeof(hostname) == "string");

    this.hostname   = hostname;
    this.port       = port;
    this.sessions   = new Set();
    this.internal   = net.createServer();
    
    this.internal.on("connection", (socket) => {
      let session = new Session(socket);
      this.sessions.add(session);
      logger.debug(`[Server] Session ${session.id}: Connected`);
      this.emit("session.ready", session);

      session.on("close", () => {
        logger.debug(`[Server] Session ${session.id}: Disconnected`);
        this.sessions.delete(session);
        this.emit("session.close", session);
      });

      session.on("data", (json) => {
        this.emit("session.data", session, json);
      });
    });

    this.internal.on("listening", () => {
      logger.verbose("[Server] Listening");
      this.emit("ready");
    });

    this.internal.on("close", () => {
      logger.verbose("[Server] Closed");
      this.emit("close");
    });

    this.internal.on("error", (error) => {
      logger.error(`[Server] ${error.message}\n${error.stack}`);
    });
  }

  listen()
  {
    return new Promise((resolve) => {
      if (this.internal.listening) {
        return resolve();
      }
      
      this.internal.listen(this.port, this.hostname, undefined, resolve);
    });
  }

  close()
  {
    return new Promise((resolve, reject) => {
      if (!this.internal.listening) {
        return resolve();
      }

      for (let session of this.sessions) {
        session.close();
      }

      this.internal.close((error) => {
        if (error) {
          reject(error);
        }
        else {
          resolve();
        }
      });
    });
  }
}

module.exports = Server;
