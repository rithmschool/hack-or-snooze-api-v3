// npm packages
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_WORK_FACTOR = 10;

// app imports
const { APIError } = require('../helpers');

// constants
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Story' }],
    name: String,
    password: String,
    stories: [{ type: Schema.Types.ObjectId, ref: 'Story' }],
    username: {
      type: String,
      index: true
    }
  },
  { timestamps: true }
);

userSchema.statics = {
  /**
   * Create a single new User
   * @param {object} newUser - an instance of User
   * @returns {Promise<User, APIError>}
   */
  async createUser(newUser) {
    try {
      const user = await this.findOne({ username: newUser.username }).exec();
      if (user) {
        throw new APIError(
          409,
          'User Already Exists',
          `There is already a user with username '${user.username}'.`
        );
      }

      const hashed = await bcrypt.hash(newUser.password, SALT_WORK_FACTOR);
      newUser.password = hashed;
      const savedUser = await newUser.save();
      // don't include the password in the response
      const { password, ...responseUser } = savedUser.toObject();
      return responseUser;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  /**
   * Delete a single User
   * @param {String} username
   * @returns {Promise<Success Message, APIError>}
   */
  async deleteUser(username) {
    try {
      const user = await this.findOneAndRemove({ username });
      if (!user) {
        throw new APIError(
          404,
          'User Not Found',
          `No user '${username}' found.`
        );
      }
      const deletedUser = user.toObject();
      delete deletedUser.password;

      return {
        message: `User '${username}' successfully deleted.`,
        user: deletedUser
      };
    } catch (error) {
      return Promise.reject(error);
    }
  },
  /**
   * Get a single User by username
   * @param {String} username
   * @returns {Promise<User, APIError>}
   */
  async readUser(username, fields = { password: 0 }) {
    try {
      const user = await this.findOne({ username }, fields)
        .populate('favorites')
        .populate('stories')
        .exec();

      if (!user) {
        throw new APIError(
          404,
          'User Not Found',
          `No user '${username}' found.`
        );
      }
      return user.toObject();
    } catch (error) {
      return Promise.reject(error);
    }
  },
  /**
   * Get a list of Users
   * @param {Object} query - pre-formatted query to retrieve things.
   * @param {Object} fields - a list of fields to select or not in object form
   * @param {String} skip - number of docs to skip (for pagination)
   * @param {String} limit - number of docs to limit by (for pagination)
   * @returns {Promise<Users, APIError>}
   */
  async readUsers(query, fields, skip = 0, limit = 20) {
    try {
      const users = await this.find(query, {
        ...fields,
        password: 0,
        stories: 0,
        favorites: 0
      })
        .skip(skip)
        .limit(limit)
        .sort({ username: 1 })
        .exec();

      if (users.length === 0) {
        return [];
      }
      return users.map(user => user.toObject());
    } catch (error) {
      return Promise.reject(error);
    }
  },
  /**
   * Patch/Update a single User
   * @param {String} username - the User's name
   * @param {Object} userUpdate - the json containing the User attributes
   * @returns {Promise<User, APIError>}
   */
  async updateUser(username, userUpdate) {
    try {
      if (userUpdate.password) {
        userUpdate.password = await bcrypt.hash(
          userUpdate.password,
          SALT_WORK_FACTOR
        );
      }
      const user = await this.findOneAndUpdate({ username }, userUpdate, {
        new: true
      })
        .populate('favorites')
        .populate('stories')
        .exec();

      if (!user) {
        throw new APIError(
          404,
          'User Not Found',
          `No user with username '${username}' found.`
        );
      }

      const { password, ...responseUser } = user.toObject();
      return responseUser;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  /**
   * A function to add or remove favorites from the set of
   *  user favorites. Note: favorites are story._ids, not storyIds.
   * @param {String} username
   * @param {String} favoriteId aka story._id
   * @param {String} action 'add' or 'delete'
   * @return {Promise<User>}
   */
  async addOrDeleteFavorite(username, favoriteId, action) {
    const actions = {
      add: '$addToSet',
      delete: '$pull'
    };

    try {
      const user = await this.findOneAndUpdate(
        { username },
        { [actions[action]]: { favorites: favoriteId } },
        { new: true }
      )
        .populate('favorites')
        .populate('stories')
        .exec();

      if (!user) {
        throw new APIError(
          404,
          'User Not Found',
          `No user with username '${username}' found.`
        );
      }

      const { password, ...responseUser } = user.toObject();
      return responseUser;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  /**
   * This method is for the special instance where a story gets deleted
   *  and it has to be removed from every User's favorite list
   * @param {String} favoriteId aka story._id
   */
  removeFavoriteFromAll(favoriteId) {
    return this.update({}, { $pull: { favorites: favoriteId } });
  }
};

// This code removes _id and __v from query results
if (!userSchema.options.toObject) userSchema.options.toObject = {};
userSchema.options.toObject.transform = (doc, ret) => {
  const transformed = ret;
  delete transformed._id;
  delete transformed.__v;
  return transformed;
};

module.exports = mongoose.model('User', userSchema);
