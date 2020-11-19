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
    return res.status(404).json({ error: "Unauthorized request" });
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
  res.json({ anime });
});
module.exports = animeRouter;
