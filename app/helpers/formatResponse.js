/**
 * Simple helper function to wrap responses in a 'data' object
 * @param {Object} json the JSON object to wrap
 */
function formatResponse(json) {
  if (Array.isArray(json)) {
    return json.map(v => {
      if (typeof v === 'object') {
        return formatResponse(v);
      }
      return v;
    });
  }
  // sort keys
  return Object.keys(json)
    .sort()
    .reduce((obj, k) => {
      obj[k] = json[k];
      if (typeof obj[k] === 'object' && !(obj[k] instanceof Date)) {
        obj[k] = formatResponse(obj[k]);
      }
      return obj;
    }, {});
}

module.exports = formatResponse;
