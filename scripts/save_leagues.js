var config = require('config');
var sql = require('mssql');

var lib = require("../lib/index");

var insertLeagueStatement = function (league) {
  return "INSERT INTO League (Name, LeagueGroup, SportId, Periods, TimePerPeriod, HalftimeMinutes, HasMoneyLine, " +
    "IsProp, ReferenceId) VALUES " +
    "( " + "'" + league.name + "'" +
    ", " + parseInt(league.league_id) +
    ", " + parseInt(league.sport_id) +
    ", " + parseInt(league.periods) +
    ", " + parseInt(league.time_per_period) +
    ", " + parseInt(league.half_time_minutes) +
    ", " + (league.ml == 'true' ? 1 : 0) +
    ", " + (league.prop == 'true' ? 1 : 0) +
    ", " + parseInt(league.id) + " )";
};

lib.getToken(function (err, token) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Token:', token);

  lib.getLeagues(token, function (err, leagues) {
    if (err) {
      console.log(err);
      return;
    }

    console.log('Processing', leagues.length, 'leagues');

    sql.connect(config.get("mssql_uri"))
      .then(function () {
        leagues.forEach(function (league) {
          new sql.Request()
            .input('league_id', sql.Int, parseInt(league.id))
            .query("SELECT * FROM League WHERE ReferenceId = @league_id")
            .then(function (record) {
              var transaction = new sql.Transaction();

              if (record.length == 0) {
                lib.runStatement(transaction, insertLeagueStatement(league));
              }
            })
            .catch(function (err) { console.log(err); });
        });
      })
      .catch(function (err) { console.log(err); });
  });
});
