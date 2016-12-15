
const net           = require("net");
const EventEmitter  = require("events").EventEmitter;
const Session       = require(__dirname + "/Session");

class Server extends EventEmitter
{
    constructor(port)
    {
        super();

        this.port       = port;
        this.sessions   = new Set();
        this.internal   = net.createServer();
        
        this.internal.on("connection", (socket) => {
            let session = new Session(socket);
            this.sessions.add(session);
            this.emit("session.ready", session);

            session.on("close", () => {
                this.sessions.delete(session);
                this.emit("session.close", session);
            });

            session.on("data", (json) => {
                this.emit("session.data", session, json);
            });
        });

        this.internal.on("listening", () => {
            this.emit("ready");
        });

        this.internal.on("close", () => {
            this.emit("close");
        });

        this.internal.on("error", () => {
            console.log(`Server error: ${error.toString()}\n${error.stack}`);
        });
    }

    listen()
    {
        if (!this.internal.listening) {
            this.internal.listen(this.port);
        }
    }

    close(callback = () => {})
    {
        if (this.internal.listening) {
            for (let session of this.sessions) {
                session.close();
            }

            this.internal.close();
        }
    }
}

module.exports = Server;
