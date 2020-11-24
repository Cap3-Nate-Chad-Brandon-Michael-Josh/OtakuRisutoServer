const express = require("express");
const animeService = require("../anime/anime-service");
const { requireAuth } = require("../middleware/JWT-auth");
const ListService = require("./list-service");
const jsonParser = express.json();

const ListRouter = express.Router();
ListRouter.use(requireAuth);
ListRouter.route("/")

  .get(async (req, res, next) => {
    const { user_id } = req.body;
    if (!user_id) {
      user_id = req.user.user_id;
    }
    const lists = await ListService.getAllUserLists(req.app.get("db"), user_id);
    res.status(200).json(lists);
  })
  .post(async (req, res, next) => {
    const { anime, name, private } = req.body;
    const user_id = req.user.user_id;
    const listObj = { user_id, name, private };

    await ListService.addList(req.app.get("db"), listObj).then(async (res) => {
      await anime.forEach(async (item) => {
        let exists = await animeService.hasAnimeWithTitle(
          req.app.get("db"),
          item.title
        );
        if (!exists) {
          await animeService.addAnime(
            req.app.get("db"),
            animeService.serializeAnime(item)
          );
        }
        let dbAnime = await animeService.getAnimeByTitle(
          req.app.get("db"),
          item.title
        );

        let listAnime = {
          list_id: res.list_id,
          anime_id: dbAnime[0].anime_id,
        };
        animeService.addListAnime(req.app.get("db"), listAnime);
      });
    });
    res.status(201).send(`List successfully added`);
  });

ListRouter.route("/:id")
  .get(async (req, res, next) => {
    try {
      const list = await ListService.getListById(
        req.app.get("db"),
        req.params.id
      );
      if (list.length === 0) {
        return res.status(400).json({
          error: `List at given id not found`,
        });
      } else {
        let rating = await ListService.getListRating(
          req.app.get("db"),
          req.params.id
        );
        if (!rating) {
          rating = 0;
        }
        list[0].rating = rating;
        list[0].comments = await ListService.getListComments(
          req.app.get("db"),
          req.params.id
        );
        for (let i = 0; i < list[0].comments.length; i++) {
          list[0].comments[i].username = await ListService.getCommentUsername(
            req.app.get("db"),
            list[0].comments[i].comment_user_id
          );
        }
        list[0].list_anime = await ListService.getAnimeInList(
          req.app.get("db"),
          req.params.id
        );
        list[0].anime = await ListService.getAllAnimeInfo(
          req.app.get("db"),
          list[0].list_anime
        );
      }

      if (list.length === 0) {
        return res.status(400).json({
          error: `Please send a proper list id`,
        });
      } else {
        res.status(200).json(list);
      }

      next();
    } catch (error) {
      next(error);
    }
  })
  .patch(jsonParser, (req, res, next) => {
    const patchItem = {
      name: req.body.name,
      private: req.body.private,
    };
    const user_id = req.user.user_id;
    const id = req.params.id;
    ListService.updateUserList(req.app.get("db"), id, patchItem, user_id)
      .then((item) => {
        res.status(200).json(item);
      })
      .catch(next);
  })
  .delete(async (req, res, next) => {
    const user_id = req.user.user_id;
    console.log(req.body.list_id);

    try {
      await ListService.deleteList(
        req.app.get("db"),
        req.body.list_id,
        user_id
      );
      res.status(204).send(`List Deleted.`);
    } catch (error) {
      next(error);
    }
  });
ListRouter.route("/comment").post(async (req, res, next) => {
  let { comment, list_id } = req.body;
  if (!comment) {
    return res.status(400).json({ error: "Missing comment" });
  }
  if (!list_id) {
    return res.status(400).json({ error: "Missing list_id" });
  }
  let newComment = {
    comment_user_id: req.user.user_id,
    list_id,
    comment,
  };
  let dbComment = await ListService.addComment(req.app.get("db"), newComment);
  return res.status(201).json(dbComment);
});

module.exports = ListRouter;
