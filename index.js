var lib = require("./lib/index");

lib.getToken(function (err, token) {
  console.log(err || token);
});
