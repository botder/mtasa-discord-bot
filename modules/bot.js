'use strict';

var config = {
    token: false,
    reconnect: true
};

var getPrefix = function () {
    var timestamp = (new Date()).toISOString().replace('T', ' ').substr(0, 19);
    return '[' + timestamp + '] [Bot]';
};

// discord.js (6.1.0) did not allow real bots to change their avatar directly o.O
// You can manually patch the npm module to allow it (and it will work)
// var avatar = require('fs').readFileSync('./modules/img/MTA.png');
var avatar = false;

var bot = new (require('discord.js')).Client(),
    utils = require('./utils/discord.js');

bot.on('message', function (message) {
    if (message.author.username === 'SKCBot')
        return;

    if (message.author == bot.user)
        return;

    var server = message.channel.server;
    var text = utils.removeMessageRefs(server, message.content); // message.cleanContent does not resolve channels

    console.log(getPrefix(), message.author.username, ':', text);

    if (message.content === '!ping')
        return bot.reply(message, 'pong');

    if (message.mentions.indexOf(bot.user) !== -1)
        return bot.reply(message, 'what the fuck did you say about me?');
});

bot.on('ready', function () {
    bot.setStatus('online', 'Multi Theft Auto');
    console.log(getPrefix(), 'Listening on Discord');

    if (avatar)
        bot.setAvatar(avatar, function (err) {
            console.log(getPrefix(), 'Could not set avatar for bot');
        });
});

bot.on('disconnected', function () {
    console.log(getPrefix(), 'The bot has lost connection to Discord');

    if (config.reconnect)
        setTimeout(connect, 10000);
});

function connect() {
    if (!config.reconnect)
        return;

    bot.loginWithToken(config.token, null, null, function (err) {
        if (err) {
            console.log(getPrefix(), 'Unable to login, trying again in 10 seconds');

            if (config.reconnect)
                setTimeout(connect, 10000);
        }
    });
}

exports.start = function (options) {
    if (typeof options.token === 'string')
        config.token = options.token;

    config.reconnect = true;

    connect();
};

exports.stop = function (callback) {
    config.reconnect = false;

    bot.logout(function () {
        console.log(getPrefix(), 'Bot has been logged out');

        if (typeof callback === 'function')
            callback();
    });
};
