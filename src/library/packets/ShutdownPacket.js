
const Base = require(`${libdir}/packets/BasePacket`);

class ShutdownPacket extends Base
{
  constructor()
  {
    super("relay.close");
  }
}

module.exports = ShutdownPacket;
