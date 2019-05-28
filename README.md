## Optimizely Express Middleware

### Usage
```javascript
const optimizelyExpressSdk = require('@optimizely/express-sdk');
const optimizely = optimizelyExpressSdk.initialize({
  sdkKey: 'CZsVVgn6j9ce6fNPt2ZEiB',
  datafileOptions: {
    autoUpdate: true,
    updateInterval: 600000 // 10 minutes in milliseconds
  },
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
