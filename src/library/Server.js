
const net           = require("net");
const assert        = require("assert");
const EventEmitter  = require("events").EventEmitter;
const Session       = require(__dirname + "/Session");

class Server extends EventEmitter
{
    constructor(hostname, port)
    {
        super();

        assert.equal(typeof(port), "number");
        assert.equal(typeof(hostname), "string");

        this.hostname   = hostname;
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

        this.internal.on("error", (error) => {
            console.log(`Server error: ${error.toString()}\n${error.stack}`);
        });
    }

    listen()
    {
        if (!this.internal.listening) {
            this.internal.listen(this.port, this.hostname);
        }
    }

    close()
    {
        return new Promise((resolve, reject) => {
            if (this.internal.listening) {
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
            }
            else {
                resolve();
            }
        });
    }
}

module.exports = Server;
