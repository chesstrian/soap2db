var config = require('config');
var express = require('express');

var basicAuth = require('./mw/basic_auth');
var router = express.Router({caseSensitive: true});

router.get('/', basicAuth('monitor', 'w3bs3cur1ty'), function (req, res) {
  res.render('index', {title: 'Service Monitor', counts: {events: 0, participants: 0, odds: 0}});
});

module.exports = router;
