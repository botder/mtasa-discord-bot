"use strict";

const crypto        = require("crypto");
const EventEmitter  = require("events").EventEmitter;
const Packet        = require("./packets/Packet");
const PingPacket    = require("./packets/PingPacket");
const ClosePacket   = require("./packets/ClosePacket");

class Session extends EventEmitter {
    /**
     * @param {net.Socket} socket
     * @param {number} [timeout]
     */
    constructor(socket, timeout = 5000) {
        super();

        // this.id = crypto.randomBytes(4).toString("hex");
        this.socket = socket;
        this.data = new Map();
        this.responded = false;

        this.socket.on("timeout", this._timeout.bind(this));
        this.socket.on("error", this._error.bind(this));
        this.socket.on("end", this._end.bind(this));
        this.socket.on("close", this._close.bind(this));
        this.socket.on("data", this._data.bind(this));

        // Set an initial timeout for new connections
        this.socket.setTimeout(timeout);

        // console.log(`Session ${this.id} connected`);
    }

    _timeout() {
        // First half of timeout
        if (this.responded) {
            this.send(new PingPacket());
            this.responded = false;
        }
        else {
            // console.log(`Session ${this.id} reached the timeout`);
            this.close();
        }
    }

    _error(error) {
        // console.log(`Session ${this.id} error: ${error.toString()}\n${error.stack}`);
        console.log(`Session error: ${error.toString()}\n${error.stack}`);
    }

    _end() {
        this.close();
    }

    _close() {
        // console.log(`Session ${this.id} closed`);
        this.emit("close");
    }

    _data(buffer) {
        // Reset responded flag
        this.responded = true;

        // Convert buffer to UTF8 string
        let text = buffer.toString();

        // Detect browser requests
        if (text.startsWith("GET") || text.startsWith("POST"))
            return this.close();

        // Reset timeout for socket
        this.socket.setTimeout(15e3); // 15 seconds

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
                // console.log(`Session ${this.id}: Data isn't valid JSON`);
            }

            if (json && typeof json === "object") {
                if (json.type === "pong")
                    continue;

                // (debug)
                // console.log(`Session ${this.id} >> ${data}`);

                this.emit("data", json);
            }
        }
    }

    get closed() {
        return this.socket.destroyed;
    }

    close() {
        if (!this.closed) {
            this.send(new ClosePacket());
            this.socket.destroy();
        }
    }

    /**
     * @param {string} key
     */
    get(key) {
        return this.data.get(key);
    }

    /**
     * @param {string} key
     * @param {any} value
     */
    set(key, value) {
        this.data.set(key, value);
    }

    send(object) {
        if (this.closed)
            return;
        
        if (typeof object !== "object" || !object)
            return;

        let json = false;

        if (object instanceof Packet)
            json = object.toString();
        else 
            json = JSON.stringify(object);

        this.socket.write((new Buffer(json)).toString("base64") + "\r\n");

        // (debug) Hack
        // if (object.type !== "ping")
        //    console.log(`Session ${this.id} << ${json}`);

        return this;
    }
}

module.exports = Session;
