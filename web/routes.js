var config = require('config');
var express = require('express');
var sql = require('mssql');

var basicAuth = require('./mw/basic_auth');
var router = express.Router({caseSensitive: true});

router.get('/', basicAuth('monitor', 'w3bs3cur1ty'), function (req, res) {
  sql.connect(config.get("mssql_uri"))
    .then(function () {
      new sql.Request().query("SELECT (SELECT COUNT(*) FROM Event) AS events, (SELECT COUNT(*) FROM Participant) AS participants, (SELECT COUNT(*) FROM Odds) AS odds")
        .then(function (recordSet) {
          res.render('index', {title: 'Service Monitor', counts: recordSet[0]});
        })
        .catch(function (err) {
          console.log(err);
          sql.close();
        });
    })
    .catch(function (err) {
      console.log(err);
    });
});

module.exports = router;
