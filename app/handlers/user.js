// npm packages
const jwt = require('jsonwebtoken');
const { validate } = require('jsonschema');

// app imports
const { JWT_SECRET_KEY } = require('../config');
const { User } = require('../models');
const {
  ensureCorrectUser,
  formatResponse,
  validateSchema
} = require('../helpers');
const { userNewSchema, userUpdateSchema } = require('../schemas');

function readUser(request, response, next) {
  const username = request.params.username;
  return User.readUser(username)
    .then(user => response.json(formatResponse(user)))
    .catch(err => next(err));
}

function updateUser(request, response, next) {
  const { username } = request.params;
  const correctUser = ensureCorrectUser(
    request.headers.authorization,
    username
  );
  if (correctUser !== 'OK') {
    return next(correctUser);
  }
  const validSchema = validateSchema(
    validate(request.body, userUpdateSchema),
    'user'
  );
  if (validSchema !== 'OK') {
    return next(validSchema);
  }
  return User.updateUser(username, request.body.data)
    .then(user => response.json(formatResponse(user)))
    .catch(err => next(err));
}

function deleteUser(request, response, next) {
  const username = request.params.username;
  const correctUser = ensureCorrectUser(
    request.headers.authorization,
    username
  );
  if (correctUser !== 'OK') {
    return next(correctUser);
  }
  return User.deleteUser(username)
    .then(user => response.json(formatResponse(user)))
    .catch(err => next(err));
}

async function createUser(request, response, next) {
  const validSchema = validateSchema(
    validate(request.body, userNewSchema),
    'user'
  );
  if (validSchema !== 'OK') {
    return next(validSchema);
  }

  try {
    const newUser = await User.createUser(new User(request.body.data));
    const userAndToken = {
      token: jwt.sign({ username: newUser.username }, JWT_SECRET_KEY),
      ...newUser
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
