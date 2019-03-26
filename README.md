## Optimizely Express Middleware

### Usage
```javascript
var optimizely = require('optimizely-express');
app.use(optimizely({ sdkKey: 'CZsVVgn6j9ce6fNPt2ZEiB' }));
app.use('/optimizely', optimizely.datafileRoute);
app.use('/checkout_flow', optimizely.isRouteEnabled('checkout_flow', (req, res, next) => { res.sendStatus(403) }), function(req, res, next) {
  res.render('checkout_flow');
});
```
