var debug = require('debug');

var logger = debug('app:service');

module.exports = function (socket) {
  return function (message) {
    logger(message);
    socket.emit('server:log', message);
  };
};
