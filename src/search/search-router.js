const express = require('express');
const searchService = require('./search-service');
const { requireAuth } = require('../middleware/JWT-auth');

const searchRouter = express.Router();
searchRouter.use(requireAuth);

searchRouter.get('/users/:term', async (req, res, next) => {
  let term = req.params.term;
  let users = await searchService.getUsers(req.app.get('db'));
  let result = searchService.filterUsersByName(users, term);
  if (result.length === 0) {
    return res
      .status(400)
      .json({ error: 'Nothing found matching search criteria' });
  }
  res.json(result);
});
searchRouter.get('/lists/:term', async (req, res, next) => {
  let term = req.params.term;
  let lists = await searchService.getLists(req.app.get('db'));
  let filteredList = searchService.filterListsByName(lists, term);
  let result = [];
  for (let i = 0; i < filteredList.length; i++) {
    if (!filteredList[i].private) {
      let dbOwner = await searchService.getOwner(
        req.app.get('db'),
        filteredList[i].user_id
      );
      let rating = await searchService.getListRating(
        req.app.get('db'),
        filteredList[i].list_id
      );
      if (!rating) {
        rating = 0;
      }
      let userRating = await searchService.getUserRating(
        req.app.get('db'),
        req.user.user_id,
        filteredList[i].list_id
      );
      if (!userRating || !userRating.rating) {
        userRating = {};
        userRating.rating = 'Unrated';
      }
      result.push({
        list_id: filteredList[i].list_id,
        name: filteredList[i].name,
        owner: {
          username: dbOwner.username,
          user_id: dbOwner.user_id,
        },
        rating: rating,
        user_rating: userRating.rating,
      });
    }
  }
  if (result.length === 0) {
    return res
      .status(400)
      .json({ error: 'Nothing found matching search criteria' });
  }
  res.json(result);
});
module.exports = searchRouter;
