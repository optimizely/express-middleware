# Optimizely Express Middleware

This repository houses the [Express.js](http://expressjs.com/) integration for use with Optimizely Full Stack and Optimizely Rollouts.

Optimizely Full Stack is A/B testing and feature flag management for product development teams. Experiment in any application. Make every feature on your roadmap an opportunity to learn. Learn more at https://www.optimizely.com/platform/full-stack/, or see the [documentation](https://docs.developers.optimizely.com/full-stack/docs).

Optimizely Rollouts is free feature flags for development teams. Easily roll out and roll back features in any application without code deploys. Mitigate risk for every feature on your roadmap. Learn more at https://www.optimizely.com/rollouts/, or see the [documentation](https://docs.developers.optimizely.com/rollouts/docs).

## Installation
Using NPM:
```
npm install @optimizely/express-sdk --save
```

Using yarn:
```
yarn add @optimizely/express-sdk
```

## Configuration
```javascript
const optimizelyExpressSdk = require('@optimizely/express-sdk');
const optimizely = optimizelyExpressSdk.initialize({
  sdkKey: 'CZsVVgn6j9ce6fNPt2ZEiB',
  datafileOptions: {
    autoUpdate: true,
    updateInterval: 600000 // 10 minutes in milliseconds
  },
});
```

The `autoUpdate` parameter indicates that your feature flags will get automatically updated from changes made in Optimizely's user interface. The `updateInterval` indicates how frequently the Optimizely Express SDK will poll for changes.

## Usage

### `optimizely.middleware`
```
app.use(optimizely.middleware);
```
The above middleware adds the following object on the express request object

**req.optimizely**:
```
req.optimizely = {
  datafile: A representation of all of your feature flags and experiments as defined in Optimizely
  client: The Optimizely SDK client instance which has methods like for `isFeatureEnabled`, `activate`, `track`, etc.
}
```

Once the middleware is installed, you can use the standard Optimizely JavaScript SDK APIs like [isFeatureEnabled](https://docs.developers.optimizely.com/rollouts/docs/is-feature-enabled)

```
app.get('/', function(req, res, next) {
  const isEnabled = req.optimizely.client.isFeatureEnabled('checkout_flow', '123');
  res.render('index', {
    title: 'Express: ' + (isEnabled ? 'feature on!' : 'feature off')
  });
});
```

### `optimizely.webhookRequest`
If you would rather that your server not poll for changes made in Optimizely's configuration but rather get updated as quickly as possible when changes occur, you can use the following secure webhook implementation. Note, this requires following the documentation on setting up a [secure webhook](https://docs.developers.optimizely.com/rollouts/docs/webhooks) in the Optimizely UI.
```
app.use('/webhooks/optimizely', bodyParser.text({ type: '*/*' }), optimizely.webhookRequest);
```
Once you have successfully implemented the webhook, you can turn off the polling completely by setting the `autoUpdate` attribute to false above in the [configuration](#Configuration) step.

### `optimizely.datafileRoute`
If you would like to see the latest configuration of your feature flags and experiments as defined in Optimizely's UI, you can see the datafile by installing this route on your server:
```
app.use('/optimizely/datafile', optimizely.datafileRoute);
```


## About

`@optimizely/optimizely-sdk` is developed and maintained by [Optimizely](https://optimizely.com) and many [contributors](https://github.com/optimizely/javascript-sdk/graphs/contributors). If you're interested in learning more about what Optimizely X Full Stack can do for your company, please [get in touch](mailto:eng@optimizely.com)!


### Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md).
