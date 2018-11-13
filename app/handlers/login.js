// npm packages
const jwt = require('jsonwebtoken');
const { validate } = require('jsonschema');
const bcrypt = require('bcrypt');
// app imports
const { JWT_SECRET_KEY } = require('../config');
const { User } = require('../models');
const { APIError, formatResponse, validateSchema } = require('../helpers');
const { loginSchema } = require('../schemas');

async function login(request, response, next) {
  try {
    validateSchema(validate(request.body, loginSchema), 'login');

    const user = await User.readUser(request.body.username, {
      username: 1,
      password: 1
    });
    const isValid = bcrypt.compareSync(request.body.password, user.password);
    if (!isValid) {
      throw new APIError(401, 'Unauthorized', 'Invalid password.');
    }
    const userAndToken = {
      token: jwt.sign({ username: user.username }, JWT_SECRET_KEY),
      user
    };
    return response.json(formatResponse(userAndToken));
  } catch (error) {
    return next(error);
  }
}

module.exports = login;
