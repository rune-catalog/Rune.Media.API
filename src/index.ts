/// <reference path='../typings/main.d.ts' />

import restify = require('restify');

let server = restify.createServer({ name: 'rune.media.api' });

server.listen(8081);

