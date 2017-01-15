
const Base = require(`${libdir}/packets/BasePacket`);

class MalformedPacket extends Base
{
  constructor()
  {
    super("malformed");
  }
}

module.exports = MalformedPacket;
