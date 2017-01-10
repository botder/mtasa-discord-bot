
const crypto = require("crypto");

class RelayUtil
{
  static encryptPassword(plainPassword)
  {
    return crypto
      .createHash("sha512")
      .update(plainPassword)
      .digest("hex");
  }

  static encryptWithSalt(cryptedPassword, salt)
  {
    return crypto
      .createHash("sha256")
      .update(salt)
      .update(cryptedPassword)
      .digest("hex");
  }
}

module.exports = RelayUtil;
