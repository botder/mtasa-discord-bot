'use strict';

var getPrefix = function () {
    var timestamp = (new Date()).toISOString().replace('T', ' ').substr(0, 19);
    return '[' + timestamp + '] [HTTP]';
};

var server = require('http').createServer();

server.on('request', function (request, response) {
    // Ignore requests for favicon.ico (Chrome)
    if (request.url === '/favicon.ico') {
        response.writeHead(200, {
            'Content-Type': 'image/x-icon'
        });
        response.end();
        return;
    }

    console.log(getPrefix(), request.headers.host, 'v' + request.httpVersion, request.method, request.url);

    response.writeHead(200, {
        'Content-Type': 'application/json'
    });
    response.end(JSON.stringify({
        'status': 'offline'
    }));
});

server.on('timeout', function (socket) {
    socket.destroy();
});

server.on('error', function (err) {
    console.log(getPrefix(), 'Server has error\'ed:');
    console.log(err.stack);
});

server.on('close', function () {
    console.log(getPrefix(), 'Server has been shut down');
});

server.on('listening', function () {
    console.log(getPrefix(), 'Listening on port ' + server.address().port);
    server.setTimeout(30000);
});

exports.start = function (port) {
    server.listen(port, '127.0.0.1');
};

exports.stop = function (callback) {
    server.close((typeof callback === 'function') ? callback : null);
};
