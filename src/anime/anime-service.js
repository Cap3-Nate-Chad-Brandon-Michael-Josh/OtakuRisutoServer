/* eslint-disable quotes */
const xss = require('xss');

const animeService = {
  hasAnimeWithTitle(db, title) {
    return db('anime')
      .where({ title: title })
      .first()
      .then((anime) => !!anime);
  },
  addAnime(db, anime) {
    return db('anime').insert(anime).returning('*');
  },
  serializeAnime(anime) {
    let temp = [];
    for (let i = 0; i < anime.genre.length; i++) {
      temp.push(xss(anime.genre[i]));
    }
    return {
      title: xss(anime.title),
      description: xss(anime.description),
      image_url: xss(anime.image_url),
      rating: anime.rating,
      episode_count: anime.episode_count,
      genre: temp,
    };
  },
  addListAnime(db, listAnime) {
    return db('list_anime')
      .insert(listAnime)
      .returning('*')
      .then(([listAnime]) => listAnime);
  },
  getAnimeById(db, id) {
    return db('anime').select('*').where({ anime_id: id });
  },
  getAnimeByTitle(db, title) {
    return db('anime').select('*').where({ title: title });
  },
  getListOwner(db, list_id) {
    return db('anime_list')
      .select('user_id')
      .where({ list_id })
      .then(([owner]) => owner);
  },
  getLocation(db, list_anime_id) {
    return db('list_anime')
      .select('list_id')
      .where({ list_anime_id })
      .then(([location]) => location);
  },
  deleteListAnime(db, list_anime_id) {
    return db('list_anime').where({ list_anime_id }).del();
  },
  updateAnime(db, anime, anime_id) {
    return db('anime')
      .where({ anime_id })
      .update({
        description: anime.description,
        image_url: anime.image_url,
        rating: anime.rating,
        episode_count: anime.episode_count,
        genre: anime.genre,
      })
      .returning('*');
  },
};

module.exports = animeService;
