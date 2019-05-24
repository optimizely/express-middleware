var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');

var router = express.Router();
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

/*************
 * Optimizely Express SDK Usage
 */
// TODO: Update once package is public
//var optimizelyExpressSdk = require('../index.js');
var optimizelyExpressSdk = require('./express-sdk.js');
var optimizely = optimizelyExpressSdk.initialize({
  sdkKey: 'CZsVVgn6j9ce6fNPt2ZEiB',
});
app.use(optimizely.middleware);
app.use('/webhooks/optimizely', bodyParser.text({ type: '*/*' }), optimizely.webhookRequest);
app.use('/optimizely/datafile', optimizely.datafileRoute);

app.get('/', function(req, res, next) {
  const isEnabled = req.optimizely.client.isFeatureEnabled('checkout_flow', '123');
  res.render('index', {
    title: 'Express: ' + (isEnabled ? 'feature on!' : 'feature off')
  });
});

/*************/

app.use(logger('dev'));
app.use(express.json());
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
