
class BasePacket
{
  constructor(typeName = "unknown")
  {
    this.type = typeName;
    this.payload = {};
  }

  set(key, value) {
    this.payload[key] = value;
  }

  get(key) {
    return this.payload[key];
  }

  get json() {
    if (!Object.getOwnPropertyNames(this.payload).length) {
      return JSON.stringify({ "type": this.type });
    }
    else {
      return JSON.stringify({ "type": this.type, "payload": this.payload });
    }
  }
}

module.exports = BasePacket;
