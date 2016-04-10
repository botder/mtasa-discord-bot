'use strict';

var getPrefix = function () {
    var timestamp = (new Date()).toISOString().replace('T', ' ').substr(0, 19);
    return '[' + timestamp + '] [MTA]';
};

var server = require('net').createServer();

server.on('connection', function (socket) {
    socket.setTimeout(30000);

    socket.on('end', function () {

    });

    socket.on('timeout', function () {
        socket.destroy();
    });

    socket.on('close', function () {

    });

    socket.on('data', function () {

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
};
