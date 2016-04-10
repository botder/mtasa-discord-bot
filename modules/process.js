'use strict';

var getPrefix = function () {
    var timestamp = (new Date()).toISOString().replace('T', ' ').substr(0, 19);
    return '[' + timestamp + '] [APP]';
};

var emitter = new (require('events')).EventEmitter();
var waitingForExit = false;

// Preserve process from exiting instantly
process.stdin.resume();

function handler() {
    if (waitingForExit)
        return;

    waitingForExit = true;
    emitter.emit('exit');
    setTimeout(exit, 30000);
}

function exit() {
    process.exit(0);
}

// Capture exit event
process.on('exit', handler.bind(null));

// Capture CTRL-C event
process.on('SIGINT', handler.bind(null));

// Patch for win32 platform to emit the SIGINT event on CTRL-C
if (process.platform === 'win32') {
    require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    }).on('SIGNINT', function () {
        process.emit('SIGINT');
    });
}

// Capture uncaught exceptions and exit gracefully
process.on('uncaughtException', function (err) {
    console.log(getPrefix(), 'Warning! An uncaught exception has exploded:');
    console.log(err.stack);
    process.exit(99);
});

exports.on = function (event, listener) {
    return emitter.on(event, listener);
};
