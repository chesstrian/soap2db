var async = require('async');
var config = require('config');
var moment = require('moment');
var sql = require('mssql');

var lib = require("../lib/index");

module.exports = function () {
  var insertOddStatement = "INSERT INTO Odds " +
    "(" +
    "EventId, SportsbookId, LeagueId, Period, AwayRotationNumber, AwaySpread, AwayJuice, AwayMoneyLine, HomeSpread, " +
    "HomeJuice, HomeMoneyLine, Total, TotalOverMoneyLine, TotalUnderMoneyLine, DrawMoneyLine, LastUpdateOn" +
    ") VALUES " +
    "(" +
    "@event_id, @sportsbook_id, @league_id, @period, @away_rotation_number, @away_spread, @away_juice, " +
    "@away_money_line, @home_spread, @home_juice, @home_money_line, @total, @total_over_money_line, " +
    "@total_under_money_line, @draw_money_line, @last_update_on" +
    ")";

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
          var psOdds = new sql.PreparedStatement();
          psOdds.input('event_id', sql.Int);
          psOdds.input('sportsbook_id', sql.Int);
          psOdds.input('league_id', sql.Int);
          psOdds.input('period', sql.Int);
          psOdds.input('away_rotation_number', sql.Int);
          psOdds.input('away_spread', sql.Float);
          psOdds.input('away_juice', sql.Int);
          psOdds.input('away_money_line', sql.Int);
          psOdds.input('home_spread', sql.Float);
          psOdds.input('home_juice', sql.Int);
          psOdds.input('home_money_line', sql.Int);
          psOdds.input('total', sql.Float);
          psOdds.input('total_over_money_line', sql.Int);
          psOdds.input('total_under_money_line', sql.Int);
          psOdds.input('draw_money_line', sql.Int);
          psOdds.input('last_update_on', sql.DateTime);

          psOdds.prepare(insertOddStatement, function (err) {
            if (err) {
              console.log(err);
              return;
            }

            async.mapSeries(odds, function (odd, next) {
              psOdds.execute({
                event_id: parseInt(odd.event_id),
                sportsbook_id: parseInt(odd.book_id),
                league_id: parseInt(odd.league_id),
                period: parseInt(odd.period_id),
                away_rotation_number: parseInt(odd.away_rot) || null,
                away_spread: parseFloat(odd.away_point) || null,
                away_juice: parseInt(odd.away_point_money) || null,
                away_money_line: parseInt(odd.away_money_line) || null,
                home_spread: parseFloat(odd.home_point) || null,
                home_juice: parseInt(odd.home_point_money) || null,
                home_money_line: parseInt(odd.home_money_line) || null,
                total: parseFloat(odd.total) || null,
                total_over_money_line: parseInt(odd.over_money) || null,
                total_under_money_line: parseInt(odd.under_money) || null,
                draw_money_line: parseInt(odd.draw_money_line) || null,
                last_update_on: new Date(odd.last_update)
              }, next);
            });
          }, function (err) {
            if (err) { console.log(err); }

            psOdds.unprepare(function (err) {
              if (err) { console.log(err); }

              sql.close();
            });
          });

        })
        .catch(function (err) { console.log(err); });
    });
  });
};
