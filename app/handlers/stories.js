// app imports
const { Story } = require('../models');
const { formatResponse, parseSkipLimit } = require('../helpers');

async function readStories(request, response, next) {
  try {
    let skip = parseSkipLimit(request.query.skip, null, 'skip') || 0;
    let limit = parseSkipLimit(request.query.limit, 25, 'limit') || 25;
    if (typeof skip !== 'number') {
      return next(skip);
    } else if (typeof limit !== 'number') {
      return next(limit);
    }
    const stories = await Story.readStories({}, {}, skip, limit);
    return response.json(formatResponse(stories));
  } catch (error) {
    return next(error);
  }
}

module.exports = { readStories };
