'use strict';

var config = require('./modules/config.js').parseJSONFile('./config.json', 'utf8');

console.log('Discord Bot for Multi Theft Auto');
console.log('MTA-Port:', config.mta_port);
console.log('HTTP-Port:', config.http_port);
console.log(' ');

if (config.debug !== true) {
    console.log = function () {}
}

var bot = require('./modules/bot.js');
bot.start({
    token: config.token,
    servers: config.servers,
    commander: config.commander,
    url: config.redirect_uri
});

var mta = require('./modules/mta.js');
mta.start(config.mta_port);

var http = require('./modules/http.js');
http.start(config.http_port);

var proc = require('./modules/process.js');
proc.on('exit', function () {
    console.log(' ');
    console.log('Application is about to shutdown..');
    console.log(' ');

    mta.stop(function () {
        bot.stop(function () {
            http.stop(function () {
                process.exit(0);
            });
        });
    });
});
