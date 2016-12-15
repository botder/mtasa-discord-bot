
const EventEmitter  = require("events").EventEmitter;
const Packet        = require(__dirname + "/packets/Packet");
const PingPacket    = require(__dirname + "/packets/PingPacket");
const ClosePacket   = require(__dirname + "/packets/ClosePacket");

class Session extends EventEmitter
{
    constructor(socket, timeout = 5)
    {
        super();

        this.socket         = socket;
        this.data           = new Map();
        this.timeouts       = 0;
        this.maxTimeouts    = timeout;

        this.socket.on("timeout", () => {
            this.timeout += 1;

            if (this.timeout >= this.maxTimeouts) {
                this.close();
            }
        });

        this.socket.on("error", (error) => {
            console.log(`Session error: ${error.toString()}\n${error.stack}`);
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
            if (text.startsWith("GET") || text.startsWith("POST"))
                return this.close();

            // Separate messages by newline character and filter empty strings
            let lines = text.split("\r\n").filter(Boolean);

            if (!lines.length)
                return;

            // Emit data event for each single line in the buffer
            for (let line of lines) {
                // Convert base64 line to UTF8 data
                let data = (new Buffer(line, "base64")).toString("utf8");
                let json = false;

                try {
                    json = JSON.parse(data);
                }
                catch (e) {
                    // Line is invalid JSON
                }

                if (typeof(json) === "object" && json !== null && typeof(json.type) === "string") {
                    if (json.type === "pong")
                        continue;

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
            this.send(new ClosePacket());
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

    send(object)
    {
        if (this.closed) {
            return this;
        }
        
        if (typeof object !== "object" || object === null) {
            return this;
        }

        let json = false;

        if (object instanceof Packet) {
            json = object.toString();
        }
        else {
            json = JSON.stringify(object);
        }

        this.socket.write((new Buffer(json)).toString("base64") + "\r\n");

        return this;
    }
}

module.exports = Session;
