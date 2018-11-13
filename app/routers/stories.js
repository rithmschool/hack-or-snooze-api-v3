// npm packages
const express = require('express');

// app imports
const { storyHandler, storiesHandler } = require('../handlers');
const { authRequired } = require('../middleware');

// global constants
const router = new express.Router();
const { createStory, readStory, updateStory, deleteStory } = storyHandler;
const { readStories } = storiesHandler;

router
  .route('')
  .get(readStories)
  .post(authRequired, createStory);

router
  .route('/:storyId')
  .get(readStory)
  .patch(authRequired, updateStory)
  .delete(authRequired, deleteStory);

module.exports = router;
