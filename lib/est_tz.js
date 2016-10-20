var moment = require('moment-timezone');

module.exports = function (dateStr) {
  return new Date(moment.tz(dateStr, "America/Los_Angeles").tz("America/New_York").format('YYYY-MM-DDTHH:mm:ss'));
};
