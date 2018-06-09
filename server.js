var express = require('express');
var logger = require('morgan');

var app = express();
var port = process.env.PORT || 3000;

app.listen(port);
app.use(logger('dev'));

var index = require('./api/index');
var bb = require('./api/bb');
app.use('', index);
app.use('/bb', bb);

exports = module.exports = app;
