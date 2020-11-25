const bcrypt = require('bcryptjs');
// eslint-disable-next-line no-unused-vars
const jwt = require('jsonwebtoken');
const config = require('../src/config');

function makeUsersArray() {
  return [
    {
      user_id: 1,
      username: 'test1',
      password: 'P@ssword1',
      email: 'email123@email.com',
    },
    {
      user_id: 2,
      username: 'test2',
      password: 'P@ssword1',
      email: 'email123@email.com',
    },
    {
      user_id: 3,
      username: 'test3',
      password: 'P@ssword1',
      email: 'email123@email.com',
    },
  ];
}

function makeAnimeListArray() {
  return [
    {
      list_id: 1,
      user_id: 1,
      name: 'seen',
      private: true,
    },
    {
      list_id: 2,
      user_id: 2,
      name: 'seen',
      private: true,
    },
    {
      list_id: 3,
      user_id: 2,
      name: 'seen',
      private: true,
    },
    {
      list_id: 4,
      user_id: 1,
      name: 'must watch',
      private: true,
    },
    {
      list_id: 5,
      user_id: 2,
      name: 'must watch',
      private: true,
    },
    {
      list_id: 6,
      user_id: 3,
      name: 'must watch',
      private: true,
    },
    {
      list_id: 7,
      user_id: 1,
      name: 'shounen',
      private: false,
    },
    {
      list_id: 8,
      user_id: 2,
      name: 'ecchi',
      private: true,
    },
    {
      list_id: 9,
      user_id: 3,
      name: 'ecchi',
      private: false,
    },
  ];
}
function makeAnimeArray() {
  return [
    {
      anime_id: 1,
      title: 'testanimetitle1',
      description: 'testanimedescription1',
      image_url: 'testanimeimage1',
      rating: 2,
      episode_count: 1,
      genre: ['test1, test2'],
    },
    {
      anime_id: 2,
      title: 'testanimetitle2',
      description: 'testanimedescription2',
      image_url: 'testanimeimage2',
      rating: 3,
      episode_count: 2,
      genre: ['test3, test4'],
    },
    {
      anime_id: 3,
      title: 'testanimetitle3',
      description: 'testanimedescription3',
      image_url: 'testanimeimage3',
      rating: 4,
      episode_count: 3,
      genre: ['test5, test6'],
    },
    {
      anime_id: 4,
      title: 'testanimetitle4',
      description: 'testanimedescription4',
      image_url: 'testanimeimage4',
      rating: 5,
      episode_count: 4,
      genre: ['test7, test8'],
    },
    {
      anime_id: 5,
      title: 'testanimetitle5',
      description: 'testanimedescription5',
      image_url: 'testanimeimage5',
      rating: 5,
      episode_count: 5,
      genre: ['test9, test10'],
    },
    {
      anime_id: 6,
      title: 'testanimetitle6',
      description: 'testanimedescription6',
      image_url: 'testanimeimage6',
      rating: 4,
      episode_count: 6,
      genre: ['test11, test12'],
    },
  ];
}

function makeListAnimeArray() {
  return [
    {
      list_anime_id: 1,
      anime_id: 1,
      list_id: 1,
    },
    {
      list_anime_id: 2,
      anime_id: 2,
      list_id: 1,
    },
    {
      list_anime_id: 3,
      anime_id: 3,
      list_id: 2,
    },
    {
      list_anime_id: 4,
      anime_id: 4,
      list_id: 2,
    },
    {
      list_anime_id: 5,
      anime_id: 5,
      list_id: 3,
    },
    {
      list_anime_id: 6,
      anime_id: 6,
      list_id: 3,
    },
    {
      list_anime_id: 7,
      anime_id: 1,
      list_id: 4,
    },
    {
      list_anime_id: 8,
      anime_id: 3,
      list_id: 4,
    },
    {
      list_anime_id: 9,
      anime_id: 2,
      list_id: 5,
    },
    {
      list_anime_id: 10,
      anime_id: 4,
      list_id: 5,
    },
    {
      list_anime_id: 11,
      anime_id: 5,
      list_id: 6,
    },
    {
      list_anime_id: 12,
      anime_id: 1,
      list_id: 6,
    },
    {
      list_anime_id: 13,
      anime_id: 6,
      list_id: 7,
    },
    {
      list_anime_id: 14,
      anime_id: 2,
      list_id: 7,
    },
    {
      list_anime_id: 15,
      anime_id: 5,
      list_id: 8,
    },
  ];
}

function makeCommentArray() {
  return [
    {
      comment_id: 1,
      comment_user_id: 1,
      list_id: 1,
      comment: 'FIRST!',
    },
    {
      comment_id: 2,
      comment_user_id: 2,
      list_id: 1,
      comment: 'SECOND!',
    },
    {
      comment_id: 3,
      comment_user_id: 3,
      list_id: 1,
      comment: 'THIRD',
    },
    {
      comment_id: 4,
      comment_user_id: 1,
      list_id: 1,
      comment: 'Ok, enough now',
    },
  ];
}

function makeRatingArray() {
  return [
    {
      rating_id: 1,
      rating_user_id: 1,
      list_id: 9,
      rating: 5,
    },
    {
      rating_id: 2,
      rating_user_id: 2,
      list_id: 9,
      rating: 1,
    },
    {
      rating_id: 3,
      rating_user_id: 3,
      list_id: 2,
      rating: 5,
    },
  ];
}
function cleanTables(db) {
  return db.raw(
    `TRUNCATE
    rating,
    comment,
    list_anime,
    anime,
    anime_list,
    users`
  );
}
function prepUsers(users) {
  const preppedUsers = users.map((user) => ({
    user_id: user.user_id,
    username: user.username,
    password: bcrypt.hashSync(user.password, 1),
    email: user.email,
  }));
  return preppedUsers;
}
async function seedUsersTable(db, users) {
  await db.into('users').insert(prepUsers(users));
  return db.raw(
    `SELECT setval('users_user_id_seq', (SELECT MAX(user_id) from users));`
  );
}
async function seedAnimeListTable(db, animeList) {
  await db.into('anime_list').insert(animeList);
  return db.raw(
    `SELECT setval('anime_list_list_id_seq', (SELECT MAX(list_id) from anime_list));`
  );
}
async function seedAnimeTable(db, anime) {
  await db.into('anime').insert(anime);
  return db.raw(
    `SELECT setval('anime_anime_id_seq', (SELECT MAX(anime_id) from anime));`
  );
}
async function seedListAnimeTable(db, listAnime) {
  await db.into('list_anime').insert(listAnime);
  return db.raw(
    `SELECT setval('list_anime_list_anime_id_seq', (SELECT MAX(list_anime_id) from list_anime));`
  );
}
async function seedCommentTable(db, comments) {
  await db.into('comment').insert(comments);
  return db.raw(
    `SELECT setval('comment_comment_id_seq', (SELECT MAX(comment_id) from comment));`
  );
}
async function seedRatingTable(db, ratings) {
  await db.into('rating').insert(ratings);
  return db.raw(
    `SELECT setval('rating_rating_id_seq', (SELECT MAX(rating_id) from rating));`
  );
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.user_id }, secret, {
    subject: user.username,
    algorithm: 'HS256',
  });
  return `Bearer ${token}`;
}
function makeExpectedListArr() {
  return [
    {
      list_id: 1,
      user_id: 1,
      name: 'seen',
      private: true,
    },
    {
      list_id: 4,
      user_id: 1,
      name: 'must watch',
      private: true,
    },
    {
      list_id: 7,
      user_id: 1,
      name: 'shounen',
      private: false,
    },
  ];
}
function makeNewAnimeArr() {
  return [
    {
      title: 'testanimetitle1',
      description: 'testanimedescription1',
      image_url: 'testanimeimage1',
      rating: 2,
      episode_count: 1,
      genre: ['test1, test2'],
    },
    {
      title: 'testanimetitle2',
      description: 'testanimedescription2',
      image_url: 'testanimeimage2',
      rating: 3,
      episode_count: 2,
      genre: ['test3, test4'],
    },
    {
      title: 'testanimetitle3',
      description: 'testanimedescription3',
      image_url: 'testanimeimage3',
      rating: 4,
      episode_count: 3,
      genre: ['test5, test6'],
    },
    {
      title: 'testanimetitle7',
      description: 'testanimedescription7',
      image_url: 'testanimeimage7',
      rating: 3,
      episode_count: 4,
      genre: ['test5, test6'],
    },
  ];
}
function makeExpectedListAnimeArr() {
  return [
    {
      list_anime_id: 16,
      list_id: 10,
      anime_id: 1,
    },
    {
      list_anime_id: 17,
      list_id: 10,
      anime_id: 2,
    },
    {
      list_anime_id: 18,
      list_id: 10,
      anime_id: 3,
    },
    {
      list_anime_id: 19,
      list_id: 10,
      anime_id: 7,
    },
  ];
}
function calculateListRating(list) {
  let ratings = makeRatingArray().filter(
    (rating) => rating.list_id === list.list_id
  );
  let sum = 0;
  for (let i = 0; i < ratings.length; i++) {
    sum = sum + ratings[i].rating;
  }
  let result = parseFloat((sum / ratings.length).toFixed(2));
  return result;
}

function makeExpectedAnimeArr(listAnimeArr) {
  let result = [];
  let anime = makeAnimeArray();
  for (let i = 0; i < listAnimeArr.length; i++) {
    result.push(
      anime.find((animeItem) => animeItem.anime_id === listAnimeArr.anime_id)
    );
  }
  return result;
}
function makeExpectedList(list) {
  let comments = makeCommentArray().filter(
    (comment) => comment.list_id === list.list_id
  );
  let listAnime = makeListAnimeArray().filter(
    (listAnime) => listAnime.list_id === list.list_id
  );
  let anime = makeExpectedAnimeArr(listAnime);
  return {
    list_id: list.list_id,
    user_id: list.user_id,
    name: list.name,
    private: list.private,
    rating: calculateListRating(list),
    comments: comments,
    list_anime: listAnime,
    anime: anime,
  };
}
module.exports = {
  makeUsersArray,
  makeAnimeListArray,
  makeAnimeArray,
  makeListAnimeArray,
  makeCommentArray,
  makeRatingArray,
  makeAuthHeader,
  seedUsersTable,
  seedAnimeTable,
  seedAnimeListTable,
  seedListAnimeTable,
  seedCommentTable,
  seedRatingTable,
  cleanTables,
  makeExpectedListArr,
  makeNewAnimeArr,
  makeExpectedListAnimeArr,
  makeExpectedList,
};
