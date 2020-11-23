const bcrypt = require("bcryptjs");
// eslint-disable-next-line no-unused-vars
const jwt = require("jsonwebtoken");
const config = require("../src/config");

function makeUsersArray() {
  return [
    {
      user_id: 1,
      username: "test1",
      password: "P@ssword1",
      email: "email123@email.com",
    },
    {
      user_id: 2,
      username: "test2",
      password: "P@ssword1",
      email: "email123@email.com",
    },
    {
      user_id: 3,
      username: "test3",
      password: "P@ssword1",
      email: "email123@email.com",
    },
  ];
}

function makeAnimeListArray() {
  return [
    {
      list_id: 1,
      user_id: 1,
      name: "seen",
      private: true,
    },
    {
      list_id: 2,
      user_id: 2,
      name: "seen",
      private: true,
    },
    {
      list_id: 3,
      user_id: 2,
      name: "seen",
      private: true,
    },
    {
      list_id: 4,
      user_id: 1,
      name: "must watch",
      private: true,
    },
    {
      list_id: 5,
      user_id: 2,
      name: "must watch",
      private: true,
    },
    {
      list_id: 6,
      user_id: 3,
      name: "must watch",
      private: true,
    },
    {
      list_id: 7,
      user_id: 1,
      name: "shounen",
      private: false,
    },
    {
      list_id: 8,
      user_id: 2,
      name: "isekai",
      private: false,
    },
    {
      list_id: 9,
      user_id: 3,
      name: "ecchi",
      private: false,
    },
  ];
}
function makeAnimeArray() {
  return [
    {
      anime_id: 1,
      title: "testanimetitle1",
      description: "testanimedescription1",
      image_url: "testanimeimage1",
      rating: 2,
      episode_count: 1,
    },
    {
      anime_id: 2,
      title: "testanimetitle2",
      description: "testanimedescription2",
      image_url: "testanimeimage2",
      rating: 3,
      episode_count: 2,
    },
    {
      anime_id: 3,
      title: "testanimetitle3",
      description: "testanimedescription3",
      image_url: "testanimeimage3",
      rating: 4,
      episode_count: 3,
    },
    {
      anime_id: 4,
      title: "testanimetitle4",
      description: "testanimedescription4",
      image_url: "testanimeimage4",
      rating: 5,
      episode_count: 4,
    },
    {
      anime_id: 5,
      title: "testanimetitle5",
      description: "testanimedescription5",
      image_url: "testanimeimage5",
      rating: 5,
      episode_count: 5,
    },
    {
      anime_id: 6,
      title: "testanimetitle6",
      description: "testanimedescription6",
      image_url: "testanimeimage6",
      rating: 4,
      episode_count: 6,
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
      comment: "FIRST!",
    },
    {
      comment_id: 2,
      comment_user_id: 2,
      list_id: 1,
      comment: "SECOND!",
    },
    {
      comment_id: 3,
      comment_user_id: 3,
      list_id: 1,
      comment: "THIRD",
    },
    {
      comment_id: 4,
      comment_user_id: 1,
      list_id: 1,
      comment: "Ok, enough now",
    },
  ];
}

function makeRatingArray() {
  return [
    {
      rating_id: 1,
      rating_user_id: 1,
      list_id: 1,
      rating: 5,
    },
    {
      rating_id: 2,
      rating_user_id: 2,
      list_id: 1,
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
    username: user.name,
    password: bcrypt.hashSync(user.password, 1),
    email: user.email,
  }));
  return preppedUsers;
}
function seedUsersTable(db, users) {
  return db.into("users").insert(prepUsers(users));
}
function seedAnimeListTable(db, animeList) {
  return db.into("anime_list").insert(animeList);
}
function seedAnimeTable(db, anime) {
  return db.into("anime").insert(anime);
}
function seedListAnimeTable(db, listAnime) {
  return db.into("list_anime").insert(listAnime);
}
function seedCommentTable(db, comments) {
  return db.into("comment").insert(comments);
}
function seedRatingTable(db, ratings) {
  return db.into("rating").insert(ratings);
}
//might throw an error, need to see how sign works behind the scenes. if so, user_id should be id
function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.user_id }, secret, {
    subject: user.username,
    algorithm: "HS256",
  });
  return `Bearer ${token}`;
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
<<<<<<< HEAD
=======
  cleanTables,
>>>>>>> auth-test
};
