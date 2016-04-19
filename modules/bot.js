'use strict';

var config = {
    token: false,
    commander: false,
    servers: []
};

var getPrefix = function () {
    var timestamp = (new Date()).toISOString().replace('T', ' ').substr(0, 19);
    return '[' + timestamp + '] [Bot]';
};

var Discord = require('discord.js'),
    discordUtil = require('./utils/discord.js'),
    util = require('util');

var bot = new Discord.Client({
    autoReconnect: true,
    forceFetchUsers: true,
    maxCachedMessages: 15
});

var commands = {};

bot.on('message', function (message) {
    // Ignore messages from my old bot (will be removed later)
    if (message.author.name === 'SKCBot')
        return;

    // Ignore message from the bot itself
    if (message.author == bot.user)
        return;

    // Aliases and convertions
    var author = message.author;
    var channel = message.channel;
    var server = message.channel.server;
    var text = discordUtil.removeMessageRefs(server, message.content).trim();
    var isOwner = server.owner === author;
    var isCommander = author.id === config.commander;

    // Message logging
    console.log(getPrefix(), util.format('[%s #%s] %s: %s', server.name, channel.name, author.name, text));

    // Command processing
    var firstChar = text.charAt(0);

    if (firstChar !== '!')
        return;

    var textParts = text.split(/\s+/).filter(Boolean);
    var command = textParts.shift();

    if (command === '!ping') {
        return bot.reply(message, 'pong');
    }
    else if (command === '!add') {
        if (!isCommander)
            return bot.reply(message, 'sorry, but you can\'t use this command.');

        if (textParts.length < 2)
            return bot.reply(message, 'Syntax: !add name text');

        var commandName = '!' + textParts.shift();

        if (commands.hasOwnProperty(commandName))
            return bot.reply(message, 'sorry, but this command already exists.');

        commands[commandName] = textParts.join(' ');

        return bot.reply(message, 'added command ' + commandName);
    }
    else if (command === '!remove') {
        if (!isCommander)
            return bot.reply(message, 'sorry, but you can\'t use this command.');

        if (textParts.length < 1)
            return bot.reply(message, 'Syntax: !remove name');

        var commandName = '!' + textParts.shift();

        if (!commands.hasOwnProperty(commandName))
            return bot.reply(message, 'sorry, but this command doesn\'t exist.');

        delete commands[commandName];

        return bot.reply(message, 'removed command ' + commandName);
    }
    else if (command === '!whois') {
        if (!isCommander)
            return bot.reply(message, 'sorry, but you can\'t use this command.');

        if (textParts.length < 1)
            return bot.reply(message, 'Syntax: !whois name');

        var rawName = textParts.shift();
        var mentionName = rawName.slice(1);
        var userRaw = server.members.get('username', rawName);
        var userMention = server.members.get('username', mentionName);
        var user = (userRaw !== null) ? userRaw : userMention;

        if (user === null)
            return bot.reply(message, 'sorry, but user not found.');

        return bot.reply(message, util.format('%s (id: %s, discriminator: %d, status: %s)\n%s',
            user.name,
            user.id,
            user.discriminator,
            user.status,
            (user.avatarURL !== null) ? user.avatarURL : 'No avatar available'
        ));
    }
    else if (command === '!whitelisted') {
        if (!isOwner && !isCommander)
            return bot.reply(message, 'sorry, but you can\'t use this command.');

        var state = (config.servers.indexOf(server.id) !== -1) ? 'is' : 'is not';
        return bot.reply(message, 'this server ' + state + ' whitelisted.');
    }
    else if (command === '!server') {
        return bot.reply(message, util.format('you are on %s (id: %s).', server.name, server.id));
    }
    else if (command === '!whoami') {
        return bot.reply(message, 'your account id: ' + author.id);
    }
    else if (commands.hasOwnProperty(command)) {
        return bot.reply(message, commands[command]);
    }
});

bot.on('error', function (err) {
    console.log(getPrefix(), 'Internal module error:');
    console.log(err.stack);
    process.exit(0);
});

bot.on('serverCreated', function (server) {
    console.log(getPrefix(), util.format('Joined server %s (id: %s)', server.name, server.id));

    if (config.servers.indexOf(server.id) === -1) {
        console.log(getPrefix(), util.format('Server %s (id: %s) is not whitelisted', server.name, server.id));

        setTimeout(function () {
            bot.leaveServer(server, function (err) {
                console.log(getPrefix(), 'Couldn\'t leave server:', err.toString());
            });

            // TODO: Check if future versions of discord.js emit 'serverDeleted' on .leaveServer
            bot.emit('serverDeleted', server);
        }, 30000);
    }
});

bot.on('serverDeleted', function (server) {
    console.log(getPrefix(), util.format('Quit server %s (id: %s)', server.name, server.id));
});

bot.on('channelDeleted', function (channel) {
    console.log(getPrefix(), 'Channel destroyed:', channel.name, '(server: ', channel.server.name, 'id: ', channel.server.id + ')');
});

bot.on('userBanned', function (user, server) {
    console.log(getPrefix(), user.name, '(id: ', user.id + ')', 'has been banned on', server.name, '(id: ', server.id + ')');
});

bot.on('userUnbanned', function (user, server) {
    console.log(getPrefix(), user.name, '(id: ', user.id + ')', 'has been unbanned on', server.name, '(id: ', server.id + ')');
});

bot.on('ready', function () {
    bot.setStatus('online', 'Multi Theft Auto');
    console.log(getPrefix(), 'Listening on Discord');

    bot.servers.forEach(function (server) {
        bot.emit('serverCreated', server);
    });
});

bot.on('disconnected', function () {
    console.log(getPrefix(), 'Couldn\'t connect to Discord or lost connection');
});

function connect() {
    bot.loginWithToken(config.token, false, false, function (err) {
        if (err)
            console.log(getPrefix(), 'Verify your login credentials, couldn\'t login');
    });
}

exports.start = function (options) {
    if (typeof options.token === 'string')
        config.token = options.token;

    if (Array.isArray(options.servers))
        config.servers = options.servers;

    if (typeof options.commander === 'string')
        config.commander = options.commander;

    if (typeof options.url === 'string')
        bot.userAgent.full = 'MTA (' + options.url + ', 1.0.0)';

    connect();
};

exports.stop = function (callback) {
    bot.logout(function () {
        console.log(getPrefix(), 'Bot has been logged out');

        if (typeof callback === 'function')
            callback();
    });
};
