var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendfile('www/remote.html');
});

router.get('/display', function(req, res, next) {
  res.sendfile('www/display.html');
});
router.get('/safe', function(req, res, next) {
  res.sendfile('www/safety.html');
});

router.get('/online', function(req, res, next) {
  res.send('online');
});

module.exports = router;
