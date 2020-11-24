const express = require("express");
const animeService = require("./anime-service");
const { requireAuth } = require("../middleware/JWT-auth");

const animeRouter = express.Router();
animeRouter.use(requireAuth);

animeRouter.post("/", async (req, res, next) => {
  let { anime, list_id } = req.body;
  if (!anime) {
    return res.status(400).json({ error: "Missing anime" });
  }
  if (!list_id) {
    return res.status(400).json({ error: "Missing list_id" });
  }
  let owner = await animeService.getListOwner(req.app.get("db"), list_id);

  if (owner.user_id !== req.user.user_id) {
    return res.status(401).json({ error: "Unauthorized request" });
  }
  let exists = await animeService.hasAnimeWithTitle(
    req.app.get("db"),
    anime.title
  );
  if (!exists) {
    await animeService.addAnime(
      req.app.get("db"),
      animeService.serializeAnime(anime)
    );
  }
  let dbAnime = await animeService.getAnimeByTitle(
    req.app.get("db"),
    anime.title
  );

  let listAnime = {
    list_id,
    anime_id: dbAnime[0].anime_id,
  };
  animeService.addListAnime(req.app.get("db"), listAnime);
  res.status(201).json({ anime });
});
animeRouter.delete("/", async (req, res, next) => {
  let { list_anime_id } = req.body;
  if (!list_anime_id) {
    return res.status(400).json({ error: "Missing list_anime_id" });
  }
  let list_id = await animeService.getLocation(
    req.app.get("db"),
    list_anime_id
  );
  if (!list_id) {
    return res.status(400).json({ error: "list_anime not found" });
  }
  let owner = await animeService.getListOwner(
    req.app.get("db"),
    list_id.list_id
  );
  if (owner.user_id !== req.user.user_id) {
    return res.status(401).json({ error: "Unauthorized request" });
  }
  await animeService.deleteListAnime(req.app.get("db"), list_anime_id);
  res.status(204).send(`Deleted ${list_anime_id}`);
});
module.exports = animeRouter;
