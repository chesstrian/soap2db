var config = require("config");
var soap = require("soap");

module.exports = function (token, awayRot, sportsbookId, lastUpdate, cb) {
  if (awayRot instanceof Function) {
    cb = awayRot;
    awayRot = sportsbookId = lastUpdate = null;
  } else if (sportsbookId instanceof Function) {
    cb = sportsbookId;
    sportsbookId = lastUpdate = null;
  } else if (lastUpdate instanceof Function) {
    cb = lastUpdate;
    lastUpdate = null;
  }

  soap.createClient(config.get("endpoint"), function (err, client) {
    if (err) return cb(err);

    var args = {
      token: token
    };

    if (awayRot != null) {
      args.awayRot = awayRot;
    }
    if (sportsbookId != null) {
      args.sportsbookId = sportsbookId;
    }
    if (lastUpdate != null) {
      args.lastUpdate = lastUpdate;
    }

    client.GetOdds(args, function (err, result) {
      if (err) return cb(err);

      if (result.GetOddsResult != null && result.GetOddsResult.ResponseCode == 'SUCCESS') {
        if (result.GetOddsResult.Item != null) {
          if (result.GetOddsResult.Item.OddMessage instanceof Array) {
            return cb(null, result.GetOddsResult.Item.OddMessage);
          } else {
            return cb(null, [result.GetOddsResult.Item.OddMessage]);
          }
        } else {
          return cb(null, []);
        }
      } else {
        return cb({
          error: true,
          message: 'Invalid JSON object: ' + result.toString()
        });
      }
    });
  });
};
