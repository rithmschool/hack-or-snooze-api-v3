// npm packages
const jwt = require('jsonwebtoken');

// app imports
const { APIError } = require('../helpers');

// global constants
const { JWT_SECRET_KEY } = require('../config');

function authRequired(request, response, next) {
  try {
    const token = request.body.token || request.query.token;
    const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
    request.token = token;
    request.username = decodedToken.username;
    return next();
  } catch (e) {
    return next(
      new APIError(401, 'Unauthorized', 'Missing or invalid auth token.')
    );
  }
}

module.exports = authRequired;
