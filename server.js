var express = require('express');
var logger = require('morgan');

var app = express();
var port = process.env.PORT || 3000;

app.listen(port);
app.use(logger('dev'));

var index = require('./api/index');
var exrx = require('./api/exrx');
app.use('', index);
app.use('/exrx', exrx);

exports = module.exports = app;
