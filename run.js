var schedule = require('node-schedule');

var scripts = require('./scripts/index');

schedule.scheduleJob('*/1 * * * *', scripts.saveOdds);
schedule.scheduleJob('0 0 * * *', scripts.saveEvents);
