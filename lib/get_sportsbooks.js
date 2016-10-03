var config = require("config");
var soap = require("soap");

module.exports = function (token, sportsbookId, cb) {
  if (sportsbookId instanceof Function) {
    cb = sportsbookId;
    sportsbookId = null;
  }

  soap.createClient(config.get("endpoint"), function (err, client) {
    if (err) return cb(err);

    var args = {
      token: token
    };

    if (sportsbookId != null) {
      args.sportsbookId = sportsbookId;
    }

    client.GetSportsbooks(args, function (err, result) {
      if (err) return cb(err);

      if (result.GetSportsbooksResult != null && result.GetSportsbooksResult.ResponseCode == 'SUCCESS') {
        return cb(null, result.GetSportsbooksResult.Item.Sportsbook);
      } else {
        return cb({
          error: true,
          message: 'Invalid JSON object'
        });
      }
    });
  });
};
