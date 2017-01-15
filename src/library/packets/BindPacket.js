
const Base = require(`${libdir}/packets/BasePacket`);

class BindPacket extends Base
{
  constructor(success, error)
  {
    super("channel.bind");
    this.set("bound", !!success)

    if (error != undefined) {
      this.set("error", error);
    }
  }
}

module.exports = BindPacket;
