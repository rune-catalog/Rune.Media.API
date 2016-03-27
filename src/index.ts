/// <reference path='../typings/main.d.ts' />

import restify = require('restify');
import { default as imageHandler } from './handlers/image';

let server = restify.createServer({ name: 'rune.media.api' });

server.get('/image/:multiverseid', imageHandler); 

server.listen(8081);

