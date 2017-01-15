
const Base = require(`${libdir}/packets/BasePacket`);

class PingPacket extends Base
{
  constructor()
  {
    super("ping");
  }
}

module.exports = PingPacket;
