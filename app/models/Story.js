// npm packages
const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

// app imports
const { APIError } = require('../helpers');

// constants
const { Schema } = mongoose;

const storySchema = new Schema(
  {
    author: String,
    storyId: {
      type: String,
      index: true
    },
    title: String,
    url: String,
    username: {
      type: String,
      index: true
    }
  },
  { timestamps: true }
);

storySchema.statics = {
  /**
   * Create a single new Story
   * @param {object} newStory - an instance of Story
   * @returns {Promise<Story, APIError>}
   */
  async createStory(newStory) {
    newStory.storyId = uuidv4();
    try {
      const story = await newStory.save();
      return story.toObject();
    } catch (error) {
      return Promise.reject(error);
    }
  },
  /**
   * Delete a single Story
   * @param {String} storyId
   * @returns {Promise<Success Message, APIError>}
   */
  async deleteStory(storyId) {
    try {
      const story = await this.findOneAndRemove({ storyId }).exec();

      if (!story) {
        throw new APIError(
          404,
          'Story Not Found',
          `No story with ID '${storyId}' found.`
        );
      }

      return {
        status: 200,
        title: 'Story Deleted',
        message: `Story with ID '${storyId}' successfully deleted.`
      };
    } catch (error) {
      return Promise.reject(error);
    }
  },
  /**
   * Get a single Story by storyId
   * @param {String} storyId
   * @returns {Promise<Story, APIError>}
   */
  async readStory(storyId) {
    try {
      const story = await this.findOne({ storyId }).exec();
      if (!story) {
        throw new APIError(
          404,
          'Story Not Found',
          `No story with ID '${storyId}' found.`
        );
      }
      return story.toObject();
    } catch (error) {
      return Promise.reject(error);
    }
  },
  /**
   * Get a list of Stories
   * @param {Object} query - pre-formatted query to retrieve things.
   * @param {Object} fields - a list of fields to select or not in object form
   * @param {String} skip - number of docs to skip (for pagination)
   * @param {String} limit - number of docs to limit by (for pagination)
   * @returns {Promise<Stories, APIError>}
   */
  async readStories(query, fields = {}, skip = 0, limit = 20) {
    try {
      const stories = await this.find(query, fields)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec();

      if (stories.length === 0) {
        return [];
      }
      return stories.map(story => story.toObject()); // proper formatting
    } catch (error) {
      return Promise.reject(error);
    }
  },
  /**
   * Patch/Update a single Story
   * @param {String} storyId
   * @param {Object} storyUpdate - the json containing the Story attributes
   * @returns {Promise<Story, APIError>}
   */
  async updateStory(storyId, storyUpdate) {
    try {
      const story = await this.findOneAndUpdate({ storyId }, storyUpdate, {
        new: true
      }).exec();

      if (!story) {
        throw new APIError(
          404,
          'Story Not Found',
          `No story with ID '${storyId}' found.`
        );
      }

      return story.toObject();
    } catch (error) {
      return Promise.reject(error);
    }
  },
  /**
   * Convenience method for getting just the _id as a string back
   * @param {String} storyId
   * @returns {Promise<Story, APIError>}
   */
  async getMongoId(storyId) {
    try {
      const story = await this.findOne({ storyId }, { _id: 1 }).exec();
      if (!story) {
        throw new APIError(
          404,
          'Story Not Found',
          `No story with ID '${storyId}' found.`
        );
      }
      return story._id;
    } catch (err) {
      return Promise.reject(err);
    }
  }
};

// Hooks to insert / remove stories from the user that posted them
storySchema.post('save', story =>
  mongoose
    .model('User')
    .updateUser(story.username, { $addToSet: { stories: story._id } })
);
storySchema.post('remove', story => {
  // remove from posting user's list of stories
  mongoose
    .model('User')
    .updateUser(story.username, { $pull: { stories: story._id } });
  // remove from favorites for all users who have favorited the story
  mongoose.model('User').removeFavoriteFromAll(story._id);
});

// This code removes _id and __v from query results
if (!storySchema.options.toObject) storySchema.options.toObject = {};
storySchema.options.toObject.transform = (doc, ret) => {
  const transformed = ret;
  delete transformed._id;
  delete transformed.__v;
  return transformed;
};

module.exports = mongoose.model('Story', storySchema);
