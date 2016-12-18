
const assert                = require("assert");
const EventEmitter          = require("events").EventEmitter;
const Server                = require(__dirname + "/Server");
const RelayUtil             = require(__dirname + "/RelayUtil");
const DenyAuthPacket        = require(__dirname + "/packets/DenyAuthPacket");
const GrantAuthPacket       = require(__dirname + "/packets/GrantAuthPacket");
const MalformedJSONPacket   = require(__dirname + "/packets/MalformedJSONPacket");

class RelayServer extends EventEmitter
{
    constructor(config)
    {
        super();

        if (typeof(config) !== "object" || config === null) {
            throw new TypeError("argument 'config' is not an object or null");
        }

        assert.equal(typeof(config.port), "number");
        assert.equal(typeof(config.hostname), "string");
        assert.equal(typeof(config.password), "string");

        this.password   = RelayUtil.encryptPassword(config.password);
        this.server     = new Server(config.hostname, config.port);

        this.server.on("ready", () => {
            console.log(`Server listening on ${this.server.port}`);
        });

        this.server.on("close", () => {
            console.log(`Server on port ${this.server.port} has been closed`);
        });

        this.server.on("session.data", (session, data) => {
            if (session.get("authenticated")) {
                if (typeof(data.type) !== "string") {
                    return session.send(new MalformedJSONPacket());
                }

                let payload = {};

                if (typeof(data.payload) === "object" && data.payload !== null) {
                    payload = data.payload;
                }

                return this.emit("session.packet", session, data.type, payload);
            }

            if (typeof(data.type) !== "string" || typeof(data.payload) !== "object" || data.payload === null) {
                return session.send(new MalformedJSONPacket()).close();
            }

            if (typeof(data.payload.salt) !== "string" || typeof(data.payload.password) !== "string") {
                return session.send(new DenyAuthPacket("invalid payload")).close();
            }

            if (data.type != "auth" || data.payload.salt.length != 32 || data.payload.password.length != 64) {
                return session.send(new DenyAuthPacket("invalid payload")).close();
            }

            let hash = RelayUtil.encryptWithSalt(this.password, data.payload.salt);

            if (hash !== data.payload.password) {
                return session.send(new DenyAuthPacket("invalid authentication payload")).close();
            }

            session.set("authenticated", true);

            return session.send(new GrantAuthPacket());
        });
    }

    listen()
    {
        this.server.listen();
    }

    close()
    {
        return this.server.close();
    }
}

module.exports = RelayServer;
