var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
  res.send('<h2>Home Page</h2>');
});

module.exports = router;
