var config = require('config');
var moment = require('moment');
var sql = require('mssql');

var lib = require("../lib/index");

var insertOddStatement = function (odd) {
  return "INSERT INTO Odds (EventId, SportsbookId, LeagueId, Period, AwayRotationNumber, AwaySpread, AwayJuice, " +
    "AwayMoneyLine, HomeSpread, HomeJuice, HomeMoneyLine, Total, TotalOverMoneyLine, TotalUnderMoneyLine, " +
    "DrawMoneyLine, LastUpdateOn) VALUES " +
    "( " + parseInt(odd.event_id) +
    ", " + parseInt(odd.book_id) +
    ", " + parseInt(odd.league_id) +
    ", " + parseInt(odd.period_id) +
    ", " + parseInt(odd.away_rot || 0) +
    ", " + parseFloat(odd.away_point || 0) +  // TODO: Is this AwaySpread?
    ", " + parseInt(odd.away_point_money || 0) +  // TODO: Is this AwayJuice?
    ", " + parseInt(odd.away_money_line || 0) +
    ", " + parseFloat(odd.home_point || 0) +  // TODO: Is this HomeSpread?
    ", " + parseInt(odd.home_point_money || 0) +  // TODO: Is this HomeJuice?
    ", " + parseInt(odd.home_money_line || 0) +
    ", " + parseFloat(odd.total || 0) +
    ", " + parseInt(odd.over_money || 0) +
    ", " + parseInt(odd.under_money || 0) +
    ", " + parseInt(odd.draw_money_line || 0) +
    ", " + "'" + odd.last_update + "' )";
};

lib.getToken(function (err, token) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Token:', token);

  lib.getOdds(token, null, null, moment(new Date()).format(), function (err, odds) {
    if (err) {
      console.log(err);
      return;
    }

    console.log('Processing', odds.length, 'Odds');

    sql.connect(config.get("mssql_uri"))
      .then(function () {
        odds.forEach(function (odd) {
          var transaction = new sql.Transaction();

          lib.runStatement(transaction, insertOddStatement(odd));
        });
      })
      .catch(function (err) { console.log(err); });
  });
});
