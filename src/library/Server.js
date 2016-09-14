"use strict";

const net                   = require("net");
const crypto                = require("crypto");
const EventEmitter          = require("events").EventEmitter;
const Session               = require("./Session");
const DenyAuthPacket        = require("./packets/DenyAuthPacket");
const GrantAuthPacket       = require("./packets/GrantAuthPacket");
const MalformedJSONPacket   = require("./packets/MalformedJSONPacket");

class Server extends EventEmitter {
    /**
     * @param {number} port
     * @param {string} passphrase
     */
    constructor(port, passphrase) {
        super();

        this.port = port;
        this.passphrase = Server.encryptPassphrase(passphrase);
        this.sessions = new Set();

        this.server = net.createServer();
        this.server.on("connection", this._connection.bind(this));
        this.server.on("listening", this._listening.bind(this));
        this.server.on("close", this._close.bind(this));
        this.server.on("error", this._error.bind(this));
    }

    listen() {
        if (!this.listening)
            this.server.listen(this.port);
    }

    close(callback = () => {}) {
        if (this.listening) {
            for (let session of this.sessions)
                session.close();
            
            this.server.close(callback);
        }
    }

    get listening() {
        return this.server.listening;
    }

    _connection(socket) {
        let session = new Session(socket);
        session.set("authenticated", false);
        this.sessions.add(session);
        this.emit("session.ready", session);

        session.on("close", () => {
            this.sessions.delete(session);
            this.emit("session.close", session);
        });

        session.on("data", (json) => {
            if (!session.get("authenticated")) {
                if (typeof json.type !== "string" || typeof json.payload !== "object" || !json.payload) {
                    return session.send(new MalformedJSONPacket()).close();
                }

                let payload = json.payload;

                if (json.type != "auth" || payload.salt.length != 32 || payload.passphrase.length != 64) {
                    return session.send(new DenyAuthPacket("invalid payload")).close();
                }

                let hash = Server.encryptWithSalt(this.passphrase, payload.salt);

                if (hash !== payload.passphrase) {
                    return session.send(new DenyAuthPacket("invalid authentication payload")).close();
                }

                session.set("authenticated", true);
                // console.log(`Session ${session.id} authenticated`);

                return session.send(new GrantAuthPacket());
            }
            else {
                if (typeof json.type !== "string") {
                    return session.send(new MalformedJSONPacket());
                }

                this.emit("data", session, json.type, (typeof json.payload === "object" && json.payload) ? json.payload : { });
            }
        });
    }

    _listening() {
        console.log(`Server listening on ${this.port}`);
        this.emit("ready");
    }

    _close() {
        console.log("Server closed");
        this.emit("close");
    }

    _error(error) {
        console.log(`Server error: ${error.toString()}\n${error.stack}`);
    }

    /**
     * @param {string} passphrase
     */
    static encryptPassphrase(passphrase) {
        return crypto
            .createHash("sha512")
            .update(passphrase)
            .digest("hex");
    }

    /**
     * @param {string} passphrase
     * @param {string} [salt]
     */
    static encryptWithSalt(passphrase, salt) {
        return crypto
            .createHash("sha256")
            .update(salt)
            .update(passphrase)
            .digest("hex");
    }
}

module.exports = Server;
