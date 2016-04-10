'use strict';

var fs = require('fs'),
    net = require('net'),
    stripJSONComments = require('strip-json-comments');

exports.parseJSONFile = function (filepath, encoding) {
    var content = fs.readFileSync(filepath, { encoding: encoding });
    return JSON.parse(stripJSONComments(content));
};
