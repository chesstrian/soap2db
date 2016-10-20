var cookieParser = require('cookie-parser');
var debug = require('debug');
var express = require('express');
var favicon = require('serve-favicon');
var hbs = require('hbs');
var http = require('http');
var morgan = require('morgan');
var path = require('path');

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
var logger = debug('web:main');
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
  console.log('Connected');

  // TODO: Connect to logs from services
});

run = function () {
  server.listen(3000, function () {
    logger('Express server listening on port', 3000);
  });
};

if (require.main == module) {
  run();
}
