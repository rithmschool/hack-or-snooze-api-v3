// app imports
const { User, Story } = require('../models');
const { formatResponse, APIError } = require('../helpers');

async function addUserFavorite(request, response, next) {
  try {
    if (username !== request.username) {
      throw new APIError(
        403,
        'Forbidden',
        'You are not allowed to update other users.'
      );
    }

    const { username, storyId } = request.params;
    const user = await User.readUser(username);
    const story_id = await Story.getMongoId(storyId);
    const userResp = User.addOrDeleteFavorite(username, story_id, 'add');
    return response.json(formatResponse(userResp));
  } catch (error) {
    return next(error);
  }
}

async function deleteUserFavorite(request, response, next) {
  try {
    if (username !== request.username) {
      throw new APIError(
        403,
        'Forbidden',
        'You are not allowed to update other users.'
      );
    }

    const { username, storyId } = request.params;
    const user = await User.readUser(username);
    const story_id = await Story.getMongoId(storyId);
    const userResp = User.addOrDeleteFavorite(username, story_id, 'delete');
    return response.json(formatResponse(userResp));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  addUserFavorite,
  deleteUserFavorite
};
