## Optimizely Express Middleware

### Usage
```javascript
var optimizelyExpressSdk = require('@optimizely/express-sdk');
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

```
