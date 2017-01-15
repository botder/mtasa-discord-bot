
const util    = require("util");
const Config  = require(`${libdir}/Config`);

/*
 * Load default configuration JSON file in the root directory
 */
global.config = Config.loadFromFile(`${rootdir}/config.json`);

if (!util.isObject(config) || config == null) {
  logger.error("Config: Unable to load config.json (file might not exist)");
  process.exit();
}

/*
 * Verify relay configuration
 */
if (!util.isObject(config.relay) || config.relay == null) {
  logger.error("Config: 'relay' is not an object or empty");
  process.exit();
}

let relay = config.relay;
let relayError = false;

if (!util.isNumber(relay.port)) {
  logger.error("Config: Relay: field 'port' is not a number");
  relayError = true;
}

if (!util.isString(relay.hostname) || !relay.hostname) {
  logger.error("Config: Relay: field 'hostname' is not a string or empty");
  relayError = true;
}

if (!util.isString(relay.password) || !relay.password) {
  logger.error("Config: Relay: field 'password' is not a string or empty");
  relayError = true;
}

if (relayError) {
  logger.error("Config: Relay configuration has errors");
}

/*
 * Verify discord configuration
 */
if (!util.isObject(config.discord) || config.discord == null) {
  logger.error("Config: 'discord' is not an object or empty");
  process.exit();
}

let discord = config.discord;
let discordError = false;

if (!util.isString(discord.playing) || !discord.playing) {
  logger.error("Config: Discord: field 'playing' is not a string or empty");
  discordError = true;
}

if (!util.isString(discord.bot_token) || !discord.bot_token) {
  logger.error("Config: Discord: field 'bot_token' is not a string or empty");
  discordError = true;
}

/*if (!util.isArray(discord.guilds) || util.isNullOrUndefined(discord.guilds[0])) {
  logger.error("Config: Discord: 'guilds' is not an array or empty");
  discordError = true;
}

for (let gindex of discord.guilds.keys()) {
  let guild = discord.guilds[gindex];

  if (!util.isString(guild.id) || !guild.id) {
    logger.error(`Config: Discord: Guild ${gindex + 1}: field 'id' is not a string or empty`);
    discordError = true;
  }

  if (!util.isArray(guild.channels) || util.isNullOrUndefined(guild.channels[0])) {
    logger.error(`Config: Discord: Guild ${gindex + 1}: 'channels' is not an array or empty`);
    discordError = true;
    continue;
  }

  for (let cindex of guild.channels.keys()) {
    let channel = guild.channels[cindex];

    if (!util.isString(channel) || !channel) {
      logger.error(`Config: Discord: Guild ${gindex + 1}: Channel ${cindex + 1}: channel name is not a string or empty`);
      discordError = true;
    }
  }
}*/

if (discordError) {
  logger.error("Config: Discord configuration has errors");
}

/*
 * Exit application on error
 */
if (relayError || discordError) {
  process.exit();
}
