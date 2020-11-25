const express = require('express');
const animeService = require('../anime/anime-service');
const { requireAuth } = require('../middleware/JWT-auth');
const ListService = require('./list-service');
const jsonParser = express.json();

const ListRouter = express.Router();
ListRouter.use(requireAuth);
ListRouter.use(jsonParser);
ListRouter.route('/')

  .get(async (req, res, next) => {
    let user_id = req.user.user_id;
    const lists = await ListService.getAllUserLists(req.app.get('db'), user_id);
    res.status(200).json(lists);
  })
  .post(async (req, res, next) => {
    let { anime, name, private } = req.body;
    if (!anime) {
      anime = [];
    }
    const user_id = req.user.user_id;
    const listObj = { user_id, name, private };
    if (!name || typeof name !== 'string') {
      return res.status(400).json('Invalid name');
    }
    if (private === undefined || typeof private !== 'boolean') {
      return res.status(401).json('Invalid private');
    }

    await ListService.addList(req.app.get('db'), listObj).then(async (result) => {
      //TO DO: clean this up, unnecessarrily hammering database.
      //where not in
      //where title not in (select title from anime)

      for (let item of anime) {
        let exists = await animeService.hasAnimeWithTitle(
          req.app.get('db'),
          item.title
        );
        if (!exists) {
          await animeService.addAnime(
            req.app.get('db'),
            animeService.serializeAnime(item)
          );
        }
        let dbAnime = await animeService.getAnimeByTitle(
          req.app.get('db'),
          item.title
        );

        let listAnime = {
          anime_id: dbAnime[0].anime_id,
          list_id: result.list_id,
        };
        await animeService.addListAnime(req.app.get('db'), listAnime);
      }
    });
    return res.status(201).json({message: `List successfully added`});
  });

ListRouter.route('/:id')
  .get(async (req, res, next) => {
    try {
      const list = await ListService.getListById(
        req.app.get('db'),
        req.params.id
      );
      if (list.length === 0) {
        return res.status(400).json({
          error: `List at given id not found`,
        });
      } else {
        let rating = await ListService.getListRating(
          req.app.get('db'),
          req.params.id
        );
        if (!rating) {
          rating = 0;
        }
        list[0].rating = rating;
        list[0].comments = await ListService.getListComments(
          req.app.get('db'),
          req.params.id
        );
        for (let i = 0; i < list[0].comments.length; i++) {
          list[0].comments[i].username = await ListService.getCommentUsername(
            req.app.get('db'),
            list[0].comments[i].comment_user_id
          );
        }
        list[0].list_anime = await ListService.getAnimeInList(
          req.app.get('db'),
          req.params.id
        );
        list[0].anime = await ListService.getAllAnimeInfo(
          req.app.get('db'),
          list[0].list_anime
        );
      }
      if (list.length === 0) {
        return res.status(400).json({
          error: `Please send a proper list id`,
        });
      }

      return res.status(200).json(list[0]);
    } catch (error) {
      next(error);
    }
  })
  .patch(jsonParser, (req, res, next) => {
    let { name, private } = req.body;
    if (!name) {
      return res.status(400).json('Missing name');
    }
    if (private === undefined) {
      return res.status(400).json('Missing private');
    }
    const patchItem = {
      name,
      private,
    };
    const user_id = req.user.user_id;
    const id = req.params.id;
    ListService.updateUserList(req.app.get('db'), id, patchItem, user_id)
      .then((item) => {
        res.status(200).json(item);
      })
      .catch(next);
  })
  .delete(async (req, res, next) => {
    const user_id = req.user.user_id;
    const { list_id } = req.body;
    if (!list_id) {
      return res.status(400).json('Missing list_id');
    }
    try {
      await ListService.deleteList(req.app.get('db'), list_id, user_id);
      res.status(204).send(`List Deleted.`);
    } catch (error) {
      next(error);
    }
  });
ListRouter.route('/comment').post(async (req, res, next) => {
    console.log(req.body)
  let { comment, list_id } = req.body;
  if (!comment) {
    return res.status(400).json({ error: 'Missing comment' });
  }
  if (!list_id) {
    return res.status(400).json({ error: 'Missing list_id' });
  }
  let newComment = {
    comment_user_id: req.user.user_id,
    list_id,
    comment,
  };
  let dbComment = await ListService.addComment(req.app.get('db'), newComment);
  return res.status(201).json(dbComment);
});
ListRouter.route('/rating').post(async (req, res, next) => {
  let { rating, list_id } = req.body;
  if (!rating || typeof rating !== 'number' || rating > 5 || rating < 1) {
    return res.status(400).json({ error: 'Invalid rating' });
  }
  if (!list_id) {
    return res.status(400).json({ error: 'Missing list_id' });
  }
  let alreadyRated = false;
  let usersWhoRated = await ListService.getUsersWhoRated(
    req.app.get('db'),
    list_id
  );
  for (let i = 0; i < usersWhoRated.length; i++) {
    if (usersWhoRated[i].rating_user_id === req.user.user_id) {
      alreadyRated = true;
    }
  }
  if (alreadyRated) {
    let dbRating = await ListService.updateRating(
      req.app.get('db'),
      list_id,
      req.user.user_id,
      rating
    );
    return res.status(201).json(dbRating);
  }
  newRating = {
    rating_user_id: req.user.user_id,
    rating,
    list_id,
  };
  let dbRating = await ListService.addRating(req.app.get('db'), newRating);
  res.status(201).json(dbRating);
});

ListRouter.route('/user/:user_id').get(async (req, res, next) => {
  let user_id = req.params.user_id;
  const lists = await ListService.getAllUserLists(req.app.get('db'), user_id);
  let result = lists.filter((list) => list.private === false);
  res.status(200).json(result);
});
module.exports = ListRouter;
