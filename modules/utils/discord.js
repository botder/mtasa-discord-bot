'use strict';

module.exports.removeMessageRefs = function (server, text) {
    return text.replace(/<@(\S*)>|<#(\S*)>/g, function (match, userID, channelID) {
        var client = server.members.get("id", userID);
        if (client !== null)
            return "@" + client.username;

        var channel = server.channels.get("id", channelID);
        if (channel !== null)
            return "#" + channel.name;

        return match;
    });
};

module.exports.getRolesAsArray = function (roles) {
    var roleBuffer = [];

    roles.forEach(function(role) {
        roleBuffer[roleBuffer.length] = role.name;
    });

    return roleBuffer;
};
