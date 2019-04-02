## Optimizely Express Middleware

### Usage
```javascript
var optimizely = require('optimizely-express');
app.use(optimizely({ sdkKey: 'CZsVVgn6j9ce6fNPt2ZEiB' }));
app.use('/optimizely', optimizely.datafileRoute);


const permissionDenied = function(req, res, next) => { res.sendStatus(403) }

app.use('/checkout_flow',
  optimizely.isRouteEnabled('checkout_flow', permissionDenied),
  (req, res, next) => {
    res.render('checkout_flow');
  }
);

app.use('/homepage', (req, res, next) => {
  const optimizely = req.optimizely.client
  const enabled = optimizely.isFeatureEnabled('homepage_demo', req.userId);
  res.render('checkout_flow', { demo: enabled });
});
```
