// npm packages
const jwt = require('jsonwebtoken');
const { validate } = require('jsonschema');
const bcrypt = require('bcrypt');
// app imports
const { JWT_SECRET_KEY } = require('../config');
const { User } = require('../models');
const { APIError, formatResponse, validateSchema } = require('../helpers');
const { loginSchema } = require('../schemas');

async function auth(request, response, next) {
  const validSchema = validateSchema(
    validate(request.body, loginSchema),
    'user'
  );
  if (validSchema !== 'OK') {
    return next(validSchema);
  }

  try {
    const user = await User.readUser(request.body.username);
    const isValid = bcrypt.compareSync(request.body.password, user.password);
    if (!isValid) {
      throw new APIError(401, 'Unauthorized', 'Invalid password.');
    }
    const userAndToken = {
      token: jwt.sign({ username: user.username }, JWT_SECRET_KEY),
      ...user
    };
    return response.json(formatResponse(userAndToken));
  } catch (error) {
    return next(error);
  }
}

module.exports = auth;
