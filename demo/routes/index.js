var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  const isEnabled = req.optimizely.client.isFeatureEnabled('purchase_option', 'user123');
  res.render('index', {
    title: 'Express ' + (isEnabled ? 'Feature flag ON' : 'Feature flag OFF')
  });
});

module.exports = router;
