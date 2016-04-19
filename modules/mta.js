'use strict';

var getPrefix = function () {
    var timestamp = (new Date()).toISOString().replace('T', ' ').substr(0, 19);
    return '[' + timestamp + '] [MTA]';
};

var server = require('net').createServer(),
    sockets = {};

server.on('connection', function (socket) {
    // Add socket to socket list
    var socketID = 0;
    for (; sockets[socketID] != undefined; ++socketID) { }
    sockets[socketID] = socket;

    // Show connection info in console
    console.log(getPrefix(), 'Socket', socketID, 'opened');
    socket.setTimeout(10000);
    socket.write('Handshake\r\n');

    socket.on('timeout', function () {
        console.log(getPrefix(), 'Socket', socketID, 'timed out');
        socket.destroy();
    });

    socket.on('close', function () {
        console.log(getPrefix(), 'Socket', socketID, 'closed');
        delete sockets[socketID];
    });

    socket.on('data', function (data) {
        console.log(getPrefix(), 'data', data);
    });
});

server.on('close', function () {
    console.log(getPrefix(), 'Interface has been shut down');
});

server.on('listening', function () {
    console.log(getPrefix(), 'Listening on port ' + server.address().port);
});

exports.start = function (port) {
    server.listen(port, '127.0.0.1');
};

exports.stop = function (callback) {
    server.close((typeof callback === 'function') ? callback : null);

    for (var socketID in sockets) {
        if (sockets.hasOwnProperty(socketID))
            sockets[socketID].destroy();
    }
};
