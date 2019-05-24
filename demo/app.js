var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var router = express.Router();

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

/***************
 * Optimizely Express SDK usage
 */
var optimizelyExpressSdk = require('../index.js');
var optimizely = optimizelyExpressSdk.initialize({
  sdkKey: 'CZsVVgn6j9ce6fNPt2ZEiB',
  logLevel: 'debug',
});

app.use(optimizely.middleware);

app.use('/webhooks/optimizely', bodyParser.text({ type: '*/*' }), optimizely.webhookRequest);
app.use('/optimizely/datafile', optimizely.datafileRoute);

router.get('/', function(req, res, next) {
  const isEnabled = req.optimizely.client.isFeatureEnabled('purchase_option', 'user123');
  res.render('index', {
    title: 'Express' + (isEnabled ? ' Feature On' : ' Feature Off')
  });
});

/***************/

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
