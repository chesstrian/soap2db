var soap = require("soap");

var url = "http://74.208.226.147/FeedServiceBR/SMTO.Feed.Service.FeedService.svc?singleWsdl";

soap.createClient(url, function (err, client) {
  var args = {
    username: "GoldenTest",
    password: "123456"
  };

  client.GenerateToken(args, function (err, result) {
    console.log(result);
  });
});
