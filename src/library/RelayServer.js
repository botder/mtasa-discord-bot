
const EventEmitter          = require("events").EventEmitter;
const Server                = require(__dirname + "/Server");
const RelayUtil             = require(__dirname + "/RelayUtil");
const DenyAuthPacket        = require(__dirname + "/packets/DenyAuthPacket");
const GrantAuthPacket       = require(__dirname + "/packets/GrantAuthPacket");
const MalformedJSONPacket   = require(__dirname + "/packets/MalformedJSONPacket");

class RelayServer extends EventEmitter
{
    constructor(port, plainPassword)
    {
        super();

        this.password = RelayUtil.encryptPassword(plainPassword);
        this.internal = new Server(port);

        this.internal.on("ready", () => {
            console.log(`Server listening on ${this.internal.port}`);
        });

        this.internal.on("close", () => {
            console.log(`Server on port ${this.internal.port} has been closed`);
        });

        this.internal.on("session.data", (session, data) => {
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
            console.log("Session has been authenticated");

            return session.send(new GrantAuthPacket());
        });
    }

    listen()
    {
        this.internal.listen();
    }

    close(callback = () => {})
    {
        this.internal.close(callback);
    }
}

module.exports = RelayServer;
