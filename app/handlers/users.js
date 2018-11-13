// app imports
const { User } = require('../models');
const { formatResponse, parseSkipLimit } = require('../helpers');

async function readUsers(request, response, next) {
  try {
    const skip = parseSkipLimit(request.query.skip, null, 'skip') || 0;
    const limit = parseSkipLimit(request.query.limit, 50, 'limit') || 25;
    if (typeof skip !== 'number') {
      return next(skip);
    } else if (typeof limit !== 'number') {
      return next(limit);
    }
    const users = await User.readUsers({}, { password: 0 }, skip, limit);
    return response.json(formatResponse(users));
  } catch (e) {
    return next(e);
  }
}

module.exports = {
  readUsers
};
