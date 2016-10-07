var config = require('config');
var moment = require("moment");
var sql = require('mssql');

var lib = require("./lib/index");

lib.getToken(function (err, token) {
  if (err) {
    console.log(err);
    return;
  }

  console.log(token);

  // lib.getLeagues(token, function (err, leagues) {
  //   console.log(leagues);
  // });
  //
  // lib.getEvents(token, function (err, events) {
  //   console.log(events);
  // });

  lib.getScores(token, function (err, scores) {
    console.log(scores);
  });

  // lib.getSportsbooks(token, function (err, sportbooks) {
  //   console.log(sportbooks);
  // });
  //
  // lib.getOdds(token, null, null, moment(new Date()).format(), function (err, odds) {
  //   console.log(odds);
  // });
});

/*
sql.connect(config.get("mssql_uri"))
  .then(function () {
    new sql.Request().query("SELECT * FROM Event")
      .then(function (recordSet) {
        console.log('RecordSet:', recordSet);
        sql.close();
      })
      .catch(function (err) {
        console.log(err);
        sql.close();
      });
  })
  .catch(function (err) {
    console.log(err);
  });
*/