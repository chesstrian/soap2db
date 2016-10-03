var config = require("config");
var soap = require("soap");

module.exports = function (token, cb) {
  soap.createClient(config.get("endpoint"), function (err, client) {
    if (err) return cb(err);

    var args = {
      token: token
    };

    client.GetEvents(args, function (err, result) {
      if (err) return cb(err);

      if (result.GetEventsResult != null && result.GetEventsResult.ResponseCode == 'SUCCESS') {
        return cb(null, result.GetEventsResult.Item.EventMessage);
      } else {
        return cb({
          error: true,
          message: 'Invalid JSON object'
        });
      }
    });
  });
};
