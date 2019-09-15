const newman = require('newman'),
  once = require('once'),

  getRandomArbitrary = function (max = 1000, min = 9999) {
    return Math.round(Math.random() * (max - min) + min);
  };

module.exports = function (options, done) {
  // Configure done to be called only once
  done = once(done);

  // Generate a random number for this run
  const id = getRandomArbitrary();

  // Initiate a newman run with the given options
  newman
    .run(options)
    .on('start', function (err) {
      if (err) {
        // Exit if there was an error while starting
        return done(err);
      }

      // The execution has just started but there is no point waiting for it to get over
      return done();
    })
    .on('item', (err, { item }) => {
      if (err) {
        // Log the error in format [1] error error-message
        return console.error(`[${id}]`, 'error', err.message);
      }

      // Logs in the format [1] GET /url?param=1
      console.info(`[${id}]`, item.request.method, item.request.url.toString());
    })
    .on('console', (err, { level, messages }) => {
      if (err) {
        // Log the error in format [1] error error-message
        return console.error(`[${id}]`, 'error', err);
      }

      // Log all console messages with their respective levels
      console.info(`[${id}]`, level, messages);
    })
    .on('done', (err, summary) => {
      // Handle normal error and summary errors
      if (err || summary.error) {
        console.error(`[${id}]`, 'error encountered', err || summary.error);

        return done(err);
      }

      // NOTE: The start event has already called the callback for successful condition
      // we do not need to call done again
    });
};
