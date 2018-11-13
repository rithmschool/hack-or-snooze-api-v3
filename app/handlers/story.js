// npm packages
const { validate } = require('jsonschema');

// app imports
const { User, Story } = require('../models');
const { APIError, formatResponse, validateSchema } = require('../helpers');
const { storyNewSchema, storyUpdateSchema } = require('../schemas');

async function createStory(request, response, next) {
  try {
    validateSchema(validate(request.body, storyNewSchema), 'story');

    const username = request.username;
    await User.readUser(username);

    const newStory = await Story.createStory(new Story(request.body));
    return response.status(201).json(formatResponse(newStory));
  } catch (error) {
    return next(error);
  }
}

async function readStory(request, response, next) {
  try {
    const story = await Story.readStory(request.params.storyId);
    return response.json(formatResponse(story));
  } catch (error) {
    return next(error);
  }
}

async function updateStory(request, response, next) {
  try {
    validateSchema(validate(request.body, storyUpdateSchema), 'story');

    const { storyId } = request.params;

    const storyCheck = await Story.readStory(storyId);
    if (request.username !== storyCheck.username) {
      throw new APIError(
        403,
        'Forbidden',
        'You are not the user who posted this story so you cannot update it.'
      );
    }
    const updatedStory = await Story.updateStory(storyId, request.body);
    return response.json(formatResponse(updatedStory));
  } catch (error) {
    return next(error);
  }
}

async function deleteStory(request, response, next) {
  try {
    const { storyId } = request.params;
    const storyCheck = await Story.readStory(storyId);
    if (storyCheck.username !== request.username) {
      throw new APIError(
        403,
        'Forbidden',
        'You did not post that story so you are not allowed to delete it.'
      );
    }
    const deletedMsg = await Story.deleteStory(storyId);
    return response.json(formatResponse(deletedMsg));
  } catch (error) {
    return next(error);
  }
}

module.exports = { createStory, readStory, updateStory, deleteStory };
