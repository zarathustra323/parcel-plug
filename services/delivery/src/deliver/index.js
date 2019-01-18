const normalizeQuery = require('../utils/normalize-query');
const createCorrelator = require('../utils/create-correlator');
const getAd = require('./get-ad');
const events = require('./events');
const logError = require('../log-error');
const { log } = require('../utils');

/**
 * @param {object} adunit The requested adunit document.
 * @param {object} query The request query string parameters.
 * @param {string} type The request type, e.g. `click` or `image`.
 */
module.exports = async (adunit, query, type) => {
  const { _id: adunitid } = adunit;
  const {
    date,
    email,
    rand,
    send,
  } = normalizeQuery(query);

  const correlator = createCorrelator({
    adunitid,
    date,
    email,
    rand,
  });
  log({ correlator });
  const correlated = await getAd(correlator, adunit, date);
  log({ correlated });

  // Record events, but do not await.
  const params = {
    now: new Date(),
    email,
    send,
  };
  switch (type) {
    case 'image':
      events.request(adunit, params).catch(e => logError(e));
      if (correlated) events.view(adunit, correlated.adId, params).catch(e => logError(e));
      break;
    case 'click':
      if (correlated) events.click(adunit, correlated.adId, params).catch(e => logError(e));
      break;
    default:
      break;
  }
  return correlated;
};
