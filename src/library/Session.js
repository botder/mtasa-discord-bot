
const net           = require("net");
const util          = require("util");
const crypto        = require("crypto");
const assert        = require("assert");
const EventEmitter  = require("events").EventEmitter;
const Packets       = require(`${libdir}/Packets`);
const BasePacket    = require(`${libdir}/packets/BasePacket`);

class Session extends EventEmitter
{
  constructor(socket, timeout = 5)
  {
    super();

    assert.ok(socket instanceof net.Socket);
    assert.ok(util.isNumber(timeout));

    this.id             = crypto.randomBytes(3).toString("hex");
    this.socket         = socket;
    this.data           = new Map();
    this.timeouts       = 0;
    this.maxTimeouts    = timeout;

    this.socket.on("timeout", () => {
      this.timeouts += 1;
      // logger.verbose(`[Session ${this.id}] Timeout ${this.timeouts} hit`)

      if (this.timeouts == this.maxTimeouts) {
        // TODO: uncomment in production
        /*logger.debug(`[Session ${this.id}] Timeout`);
        this.close();*/
      }
      else {
        this.socket.setTimeout(1000);
      }
    });

    this.socket.on("error", (error) => {
      logger.error(`[Session ${this.id}] ${error.message}\n${error.stack}`);
      this.close();
    });

    this.socket.on("end", () => {
      this.close();
    });

    this.socket.on("close", () => {
      this.emit("close");
    });

    this.socket.on("data", (buffer) => {
      this.timeouts = 0;
      this.socket.setTimeout(1000);

      // Convert buffer to UTF8 string
      let text = buffer.toString();

      // Detect browser requests
      if (text.startsWith("GET") || text.startsWith("POST")) {
        return this.close();
      }

      // Separate messages by newline character and filter empty strings
      let lines = text.split("\r\n").filter(Boolean);

      if (!lines.length) {
        return;
      }

      // Emit data event for each single line in the buffer
      for (let line of lines) {
        // Convert base64 line to UTF8 data
        let data = (new Buffer(line, "base64")).toString("utf8");
        let json = false;

        try {
          json = JSON.parse(data);
        }
        catch (error) {
          // Line is invalid JSON
          logger.debug(`[Session ${this.id}] Error in JSON: ${error.message}`);
          continue;
        }

        if (util.isObject(json) && json != null && util.isString(json.type)) {
          if (json.type == "pong") {
            continue;
          }

          logger.verbose(`[Session ${this.id}] ->`, json);
          this.emit("data", json);
        }
      }
    });

    this.socket.setTimeout(1000);
  }

  get closed()
  {
    return this.socket.destroyed;
  }

  close()
  {
    if (!this.closed) {
      this.send(new Packets.Shutdown());
      this.socket.destroy();
    }
  }

  get(key)
  {
    return this.data.get(key);
  }

  set(key, value)
  {
    this.data.set(key, value);
  }

  delete(key)
  {
    this.data.delete(key);
  }

  send(object)
  {
    if (this.closed) {
      return this;
    }
    
    if (typeof(object) != "object" || object == null) {
      return this;
    }

    let json = false;

    if (object instanceof BasePacket) {
      json = object.toString();
    }
    else {
      json = JSON.stringify(object);
    }

    this.socket.write((new Buffer(json)).toString("base64") + "\r\n");
    logger.verbose(`Session ${this.id} <-`, object);

    return this;
  }
}

module.exports = Session;
