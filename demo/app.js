require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var optimizelyExpressSdk = require('../index.js');
//var optimizely = require('optimizely-express');
var bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

var optimizely = optimizelyExpressSdk.initialize({
  sdkKey: 'CZsVVgn6j9ce6fNPt2ZEiB',
});

app.use(optimizely.middleware);
app.use('/webhooks/optimizely', bodyParser.text({ type: '*/*' }), optimizely.webhookRequest);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use('/optimizely/datafile', optimizely.datafileRoute);

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/checkout_flow', optimizely.isRouteEnabled('checkout_flow', (req, res, next) => { res.sendStatus(403) }), function(req, res, next) {
  res.render('checkout_flow');
});

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
