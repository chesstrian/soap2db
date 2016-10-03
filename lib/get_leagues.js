var config = require("config");
var soap = require("soap");

module.exports = function (token, cb) {
  soap.createClient(config.get("endpoint"), function (err, client) {
    if (err) return cb(err);

    var args = {
      token: token
    };

    client.GetLeagues(args, function (err, result) {
      if (err) return cb(err);

      if (result.GetLeaguesResult != null && result.GetLeaguesResult.ResponseCode == 'SUCCESS') {
        return cb(null, result.GetLeaguesResult.Item.League);
      } else {
        return cb({
          error: true,
          message: 'Invalid JSON object'
        });
      }
    });
  });
};
