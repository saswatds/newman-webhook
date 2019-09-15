const bodyParser = require('body-parser'),
  express = require('express'),
  run = require('./runner'),

  // Create an express application
  app = express(),

  // Define the port to listen on
  PORT = process.env.PORT || 8080,

  // Postman API key (Can be found in user account settings)
  postmanApiKey = process.env.POSTMAN_API_KEY,

  // Allows you to set a custom response to be sent for the web hook calls
  customResponse = process.env.CUSTOM_RESPONSE || '',

  // Convert the request to globals to be transferred to the collection
  extractGlobals = function (req) {
    return {
      values: [
        {
          key: 'headers',
          value: JSON.stringify(req.headers)
        },
        {
          key: 'body',
          value: JSON.stringify(req.body)
        },
        {
          key: 'query',
          value: JSON.stringify(req.query)
        }
      ]
    }
  };

// Set the body parser as text body parser
app.use(bodyParser.text());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

// Register a wild-card endpoint with collection and environment
app.all('/c/:collection/e/:environment', function (req, res) {
  // Extracting the uri-params from the request
  const { collection, environment } = req.params;
  
  // Start the run
  run({
    collection,
    environment,
    postmanApiKey,
    globals: extractGlobals(req)
  }, (err) => {
    if (err) {
      // respond 500 if there was an error
      return res.status(500).send('ERROR: ' + err.message);
    }

    // Once the execution starts respond back to the user
    res.status(200).send(customResponse);
  });
})

// Register a wild-card endpoint with only collection
app.all('/c/:collection', function (req, res) {
   // Extracting the uri-params from the request
  const { collection } = req.params;
  
  // Start the run
  run({
    collection,
    postmanApiKey,
    globals: extractGlobals(req)
  }, (err) => {
    if (err) {
      // respond 500 if there was an error
      return res.status(500).send('ERROR: ' + err.message);
    }

    // Once the execution starts respond back to the user
    res.status(200).send(customResponse);
  });
});

// Start the application
app.listen(PORT, function () {
  console.info('Application started on port', PORT);
});