var config = require('config');
var sql = require('mssql');

var lib = require("../lib/index");

var insertSportsbookStatement = function (sb) {
  return "INSERT INTO Sportsbook (Name, ReferenceId) VALUES " +
    "( " + "'" + sb.name + "'" +
    ", " + parseInt(sb.id) + " )";
};

lib.getToken(function (err, token) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Token:', token);

  lib.getSportsbooks(token, function (err, sbs) {
    if (err) {
      console.log(err);
      return;
    }

    console.log('Processing', sbs.length, 'Sportsbooks');

    sql.connect(config.get("mssql_uri"))
      .then(function () {
        sbs.forEach(function (sb) {
          new sql.Request()
            .input('sb_id', sql.Int, parseInt(sb.id))
            .query("SELECT * FROM Sportsbook WHERE ReferenceId = @sb_id")
            .then(function (record) {
              var transaction = new sql.Transaction();

              if (record.length == 0) {
                lib.runStatement(transaction, insertSportsbookStatement(sb));
              }
            })
            .catch(function (err) { console.log(err); });
        });
      })
      .catch(function (err) { console.log(err); });
  });
});
