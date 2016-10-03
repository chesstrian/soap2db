var config = require("config");
var soap = require("soap");

module.exports = function (cb) {
  soap.createClient(config.get("endpoint"), function (err, client) {
    if (err) return cb(err);

    var args = {
      username: config.get("username"),
      password: config.get("password")
    };

    client.GenerateToken(args, function (err, result) {
      if (err) return cb(err);

      if (result.GenerateTokenResult != null && result.GenerateTokenResult.ResponseCode == 'SUCCESS') {
        return cb(null, result.GenerateTokenResult.Item);
      } else {
        return cb({
          error: true,
          message: 'Invalid JSON object'
        });
      }
    });
  });
};
