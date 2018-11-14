// npm packages
const jwt = require('jsonwebtoken');
const { validate } = require('jsonschema');

// app imports
const { JWT_SECRET_KEY } = require('../config');
const { User } = require('../models');
const { formatResponse, validateSchema, APIError } = require('../helpers');
const { userNewSchema, userUpdateSchema } = require('../schemas');

async function readUser(request, response, next) {
  try {
    const { username } = request.params;
    const user = await User.readUser(username);
    return response.json(formatResponse({ user }));
  } catch (error) {
    return next(error);
  }
}

async function updateUser(request, response, next) {
  try {
    const { username } = request.params;

    validateSchema(validate(request.body, userUpdateSchema), 'user');

    if (username !== request.username) {
      throw new APIError(
        403,
        'Forbidden',
        'You are not allowed to update other users.'
      );
    }
    const user = await User.updateUser(username, request.body.user);
    return response.json(formatResponse({ user }));
  } catch (error) {
    return next(error);
  }
}

async function deleteUser(request, response, next) {
  const { username } = request.params;
  try {
    if (username !== request.username) {
      throw new APIError(
        403,
        'Forbidden',
        'You are not allowed to update other users.'
      );
    }
    const deletedMessage = await User.deleteUser(username);
    return response.json(formatResponse(deletedMessage));
  } catch (error) {
    return next(error);
  }
}

async function createUser(request, response, next) {
  try {
    validateSchema(validate(request.body, userNewSchema), 'user');
    const newUser = await User.createUser(new User(request.body.user));
    const userAndToken = {
      token: jwt.sign({ username: newUser.username }, JWT_SECRET_KEY),
      user: newUser
    };
    return response.status(201).json(formatResponse(userAndToken));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createUser,
  readUser,
  updateUser,
  deleteUser
};
