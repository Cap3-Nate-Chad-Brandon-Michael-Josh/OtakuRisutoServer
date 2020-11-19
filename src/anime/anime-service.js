const xss = require("xss");

const animeService = {
  hasAnimeWithTitle(db, title) {
    return db("anime")
      .where({ title: title })
      .first()
      .then((anime) => !!anime);
  },
  addAnime(db, anime) {
    return db("anime")
      .insert(anime)
      .returning("*")
      .then(([anime]) => anime);
  },
  serializeAnime(anime) {
    return {
      title: xss(anime.title),
      description: xss(anime.description),
      image_url: xss(anime.image_url),
      rating: anime.rating,
      episode_count: anime.episode_count,
    };
  },
  addListAnime(db, listAnime) {
    return db("list_anime")
      .insert(listAnime)
      .returning("*")
      .then(([listAnime]) => listAnime);
  },
  getAnimeById(db, id) {
    return db("anime").select("*").where({ anime_id: id });
  },
  getAnimeByTitle(db, title) {
    return db("anime").select("*").where({ title: title });
  },
  getListOwner(db, list_id) {
    return db("anime_list")
      .select("user_id")
      .where({ list_id })
      .then(([owner]) => owner);
  },
};

module.exports = animeService;
