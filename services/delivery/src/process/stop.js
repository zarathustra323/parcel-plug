const db = require('../db');
const { log } = require('../utils');

const stop = (promise, name) => {
  log(`> Disconnecting from ${name}...`);
  return promise.then((r) => {
    log(`> ${name} disconnected`);
    return r;
  });
};

module.exports = () => Promise.all([
  stop(db.close(), 'MongoDB'),
]);
