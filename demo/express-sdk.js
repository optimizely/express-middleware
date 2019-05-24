/**
 * Optimizely Express SDK
 *
 * Copyright 2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict'

const OptimizelySdk = require('@optimizely/optimizely-sdk');
const { DatafileManager } = require('@optimizely/js-sdk-datafile-manager');
const crypto = require('crypto');


/**
 * optimizely
 *
 * Middelware which initializes and installs the Optimizely SDK onto an express request object
 *
 * @param {Object} options
 * @param {Object} options.logLevel log level for the default logger
 *
 * @returns {Function} to handle the express request
 */
function initialize(options) {

  let {
    sdkKey,
    datafile,
    logLevel,
  } = options;


  const defaultLogger = require('@optimizely/optimizely-sdk').logging;
  const manager = new DatafileManager({
    sdkKey,
    ...options
  });

  function updateDatafile() {
    datafile = manager.get()
    datafile._lastUpdated = new Date();
    console.log('[Optimizely] Datafile Updated!');
  }

  manager.on('update', updateDatafile);
  manager.onReady().then(updateDatafile);

  manager.start();

  return {
    /**
     * Optimizely Middleware
     * Provides an Optimizely client instance of the SDK available
     * on routes
     *
     * @param {Object} req express request object
     * @param {Object} res express response object
     * @param {Function} next express routing next function
     */
    middleware(req, res, next) {
      const optimizelyClient = OptimizelySdk.createInstance({
        datafile: datafile,
        logger: defaultLogger.createLogger({
          logLevel: logLevel
        }),
        ...options
      });

      req.optimizely = {
        datafile: datafile || {},
        client: optimizelyClient,
      }

      next();
    },

    /**
     * Optimizely Webhook Route
     * Route to accept webhook notifications from Optimizely
     *
     * @param {Object} req express request object
     * @param {Object} res express response object
     * @param {Function} next express routing next function
     */
    async webhookRequest(req, res, next) {

      const WEBHOOK_SECRET = process.env.OPTIMIZELY_WEBHOOK_SECRET
      const webhook_payload = req.body
      const hmac = crypto.createHmac('sha1', WEBHOOK_SECRET)
      const webhookDigest = hmac.update(webhook_payload).digest('hex')

      const computedSignature = `sha1=${webhookDigest}`
      const requestSignature = req.header('X-Hub-Signature')

      if (!crypto.timingSafeEqual(Buffer.from(computedSignature, 'utf8'), Buffer.from(requestSignature, 'utf8'))) {
        console.log(`[Optimizely] Signatures did not match! Do not trust webhook request")`)
        res.status(500)
        return
      }

      console.log(`
        [Optimizely] Optimizely webhook request received!
        Signatures match! Webhook verified as coming from Optimizely
        Download Optimizely datafile and re-instantiate the SDK Client
        For the latest changes to take affect
      `);

      datafile = await rp(`https://cdn.optimizely.com/datafiles/${sdkKey}.json`)
      datafile._lastUpdated = new Date();

      res.sendStatus(200)
    },

    /**
     * datafileRoute
     *
     * Provides a route that exposes the contents of the datafile currently loaded in your application
     *
     * @param {Object} req express request object
     * @param {Object} res express response object
     * @param {Function} next express routing next function
     */
    datafileRoute(req, res, next) {
      const datafile = (req && req.optimizely && req.optimizely.datafile) || {}
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify(datafile, null, '  '));
    },

    /**
     * isRouteEnabled
     *
     * Provides a method which can be used to block a route in express on whether the feature is enabled or not
     *
     * @param {String} featureKey for the specific feature in question
     * @param {Function} onRouteDisabled function called when the feature is disabled
     * @param {Error} featureKey for the specific feature in question
     *
     * @returns {Function}
     */
    isRouteEnabled(featureKey, onRouteDisabled) {
      return function (req, res, next) {
        // TODO: Improve design of user Id
        const userId = req.userId || 'test123'
        const optimizelyClient = req && req.optimizely && req.optimizely.client
        if (optimizelyClient) {
          // TODO: Pass in attributes
          const enabled = optimizelyClient.isFeatureEnabled(featureKey, userId);
          if (enabled) {
            // Feature is enabled move on to next route
            next();
            return
          }
        }
        onRouteDisabled(req, res, next);
      }
    }
  }
}


module.exports = {
  initialize,
}
