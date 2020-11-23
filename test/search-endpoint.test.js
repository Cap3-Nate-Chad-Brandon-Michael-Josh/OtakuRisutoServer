const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const helpers = require("./test-helpers");
const { expect } = require("chai");

describe("search endpoint", () => {
  let db;
  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];
  const animeListArr = helpers.makeAnimeListArray();
  const animeList = animeListArr[8];
  const owner = testUsers[2];

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set("db", db);
  });
  after("disconnect from db", () => db.destroy());

  before("cleanup", () => helpers.cleanTables(db));

  afterEach("cleanup", () => helpers.cleanTables(db));
  describe("/users/:term", () => {
    beforeEach("insert users", () => {
      return helpers.seedUsersTable(db, testUsers);
    });
    it("should return 200 and an array of users whose name include the search term", () => {
      return supertest(app)
        .get(`/api/search/users/${testUser.username}`)
        .set("Authorization", helpers.makeAuthHeader(testUser))
        .expect([{ username: testUser.username, user_id: testUser.user_id }]);
    });
  });
  describe("/lists/:term", () => {
    beforeEach("insert users", () => {
      return helpers.seedUsersTable(db, testUsers);
    });
    beforeEach("insert anime_list", () => {
      return helpers.seedAnimeListTable(db, animeListArr);
    });
    it("should return 200 and an array of lists whose name includes the search term", () => {
      return supertest(app)
        .get(`/api/search/lists/${animeList.name}`)
        .set("Authorization", helpers.makeAuthHeader(testUser))
        .expect([
          {
            list_id: animeList.list_id,
            name: animeList.name,
            owner: { username: owner.username, user_id: owner.user_id },
          },
        ]);
    });
  });
});
