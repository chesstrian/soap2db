var io = require('socket.io-client');
var schedule = require('node-schedule');

var scripts = require('./scripts/index');
var socket = io('http://localhost:3000');

schedule.scheduleJob('*/1 * * * *', scripts.saveOdds(socket));
schedule.scheduleJob('0 0 * * *', scripts.saveEvents(socket));
