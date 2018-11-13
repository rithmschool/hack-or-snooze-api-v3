/**
 * Simple helper function to wrap responses in a 'data' object
 * @param {Object} json the JSON object to wrap
 */
function formatResponse(json) {
  // sort keys
  return Object.keys(json)
    .sort()
    .reduce((obj, k) => {
      obj[k] = json[k];
      return obj;
    }, {});
}

module.exports = formatResponse;
