const bodyParser = require('body-parser'),
  express = require('express'),
  newman = require('newman'),

  // Create an express application
  app = express(),

  // Define the port to listen on
  PORT = process.env.PORT || 8080,

  apiKey = process.env.POSTMAN_API_KEY,
  customResponse = process.env.CUSTOM_RESPONSE;

extractGlobals = function (req) {
  return {
    values: [
      {
        key: 'headers',
        value: JSON.stringify(req.headers)
      },
      {
        key: 'body',
        value: req.body
      },
      {
        key: 'query',
        value: JSON.stringify(req.query)
      }
    ]
  }
},
getRandomArbitrary = function (max = 1000, min = 9999) {
  return Math.round(Math.random() * (max - min) + min);
}

// Set the body parser as text body parser
app.use(bodyParser.text({ type: '*/*' }));

// Register a wild-card endpoint with collection and environment
app.all('/c/:collection/e/:environment', function (req, res) {
  const { collection, environment } = req.params,
  id = getRandomArbitrary();

  newman
    .run({
      collection: `https://api.getpostman.com/collections/${collection}?apikey=${apiKey}`,
      environment: `https://api.getpostman.com/environments/${environment}?apikey=${apiKey}`,
      globals: extractGlobals(req)
    })
    .on('start', function (err) {
      if (err) {
        return res.status(500).send('ERROR: ' + err.message);
      }

      // Once the execution starts respond back to the user
      res.status(200).send(customResponse || 'OK');
    })
    .on('item', function (err, { item }) {
      console.log(`[${id}]`, item.request.method, item.request.url.toString());
    })
    .on('console', function (err, {level, messages}) {
       // Log all console messages
       console.log(`[${id}]`, level, messages);
    })
    .on('done', function (err, summary) {
      if (err || summary.error) {
        console.error(`[${id}]`,'error encountered', err || summary.error);
      }
    });
})

// Register a wild-card endpoint with only collection
app.all('/c/:collection', function (req, res) {
  const { collection } = req.params,
    id = getRandomArbitrary();
  
  newman
    .run({
      collection: `https://api.getpostman.com/collections/${collection}?apikey=${apiKey}`,
      globals: extractGlobals(req)
    })
    .on('start', function (err) {
      if (err) {
        return res.status(500).send('ERROR: ' + err.message);
      }

      // Once the execution starts respond back to the user
      res.status(200).send(customResponse || 'OK');
    })
    .on('item', function (err, { item }) {
      console.log(`[${id}]`, item.request.method, item.request.url.toString());
    })
    .on('console', function (err, {level, messages}) {
       // Log all console messages
       console.log(`[${id}]`, level, messages);
    })
    .on('done', function (err, summary) {
      if (err || summary.error) {
        console.error(`[${id}]`,'error encountered', err || summary.error);
      }
    });
});

// Start the application
app.listen(PORT, function () {
  console.info('Application started on port', PORT);
});