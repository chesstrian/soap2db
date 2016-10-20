var config = require('config');
var cookieParser = require('cookie-parser');
var debug = require('debug');
var express = require('express');
var favicon = require('serve-favicon');
var hbs = require('hbs');
var http = require('http');
var morgan = require('morgan');
var path = require('path');
var sql = require('mssql');

/* Handlebars helpers */
var blocks = {};

hbs.registerHelper('extend', function(name, context) {
  var block = blocks[name];
  if (!block) {
    block = blocks[name] = [];
  }

  block.push(context.fn(this));
});

hbs.registerHelper('block', function(name) {
  var val = (blocks[name] || []).join('\n');

  // clear the block
  blocks[name] = [];
  return val;
});

var app = express();
var logger = debug('app:web');
var routes = require('./web/routes');
var server = http.Server(app);

var io = require('socket.io').listen(server);

app.enable('case sensitive routing');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(morgan('dev'));
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);

io.on('connection', function (socket) {
  if (socket.handshake.headers['user-agent'] != 'node-XMLHttpRequest') {
    socket.join('subscribers');
  }

  socket.on('server:log', function (message) {
    io.to('subscribers').emit('client:log', message);
  });

  socket.on('server:added', function (added) {
    io.to('subscribers').emit('client:added', added);
  });

  socket.on('count', function () {
    sql.connect(config.get("mssql_uri"))
      .then(function () {
        new sql.Request().query("SELECT (SELECT COUNT(*) FROM Event) AS events, (SELECT COUNT(*) FROM Participant) AS participants, (SELECT COUNT(*) FROM Odds) AS odds")
          .then(function (recordSet) {
            io.to('subscribers').emit('client:count', recordSet[0]);
          })
          .catch(function (err) {
            console.log(err);
            sql.close();
            io.to('subscribers').emit('client:count', {events: 0, participants: 0, odds: 0, error: true});
          });
      })
      .catch(function (err) {
        console.log(err);
        io.to('subscribers').emit('client:count', {events: 0, participants: 0, odds: 0, error: true});
      });
  });

});

run = function () {
  server.listen(3000, function () {
    logger('Express server listening on port', 3000);
  });
};

if (require.main == module) {
  run();
}
