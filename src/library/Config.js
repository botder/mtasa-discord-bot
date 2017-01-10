
const fs    = require("fs");
const path  = require("path");

class Config
{
  static loadFromFile(filepath)
  {
    let json = null;

    try {
      if (!fs.existsSync(filepath)) {
        return null;
      }

      let content = fs.readFileSync(filepath, "UTF-8");

      json = JSON.parse(content);

      logger.verbose(`Config: Successfully loaded file '${path.basename(filepath)}'`)
    }
    catch (error) {
      logger.error(`Config: Failed to load from file '${path.basename(filepath)}': ${error.message}`);
    }

    return json;
  }
}

module.exports = Config;
