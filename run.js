var config = require('config');
var sql = require('mssql');

var scripts = require('./scripts/index');

sql.connect(config.get("mssql_uri"))
  .then(function () {
    scripts.saveEvents() && setTimeout(scripts.saveEvents, config.get('run_events_each'));
  })
  .catch(function (err) { console.log(err); });
