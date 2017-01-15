
/*
 * Read the packets directory and include every JavaScript file in there.
 * Return an object listening the loaded files by excluding "Packet.js" from
 * the file name (e.g. AuthPacket.js will be available as <returned object>.Auth)
 */
const fs        = require("fs");
const directory = `${libdir}/packets`;

let packets = module.exports = {};
let files = fs.readdirSync(directory);

for (let file of files) {
  let filePath = `${directory}/${file}`;
  let stats = fs.statSync(filePath);

  if (stats.isFile() && file.endsWith("Packet.js")) {
    let packetName = file.substring(0, file.length - 9);
    packets[packetName] = require(filePath);
  }
}
