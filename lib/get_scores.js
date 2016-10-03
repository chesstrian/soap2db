var config = require("config");
var soap = require("soap");

module.exports = function (token, cb) {
  soap.createClient(config.get("endpoint"), function (err, client) {
    if (err) return cb(err);

    var args = {
      token: token
    };

    client.GetScores(args, function (err, result) {
      if (err) return cb(err);

      if (result.GetScoresResult != null && result.GetScoresResult.ResponseCode == 'SUCCESS') {
        return cb(null, result.GetScoresResult.Item.EventScore);
      } else {
        return cb({
          error: true,
          message: 'Invalid JSON object'
        });
      }
    });
  });
};
