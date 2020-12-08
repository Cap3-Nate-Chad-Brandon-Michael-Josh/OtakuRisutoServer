const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('search endpoint', () => {
  let db;
  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];
  const animeListArr = helpers.makeAnimeListArray();
  const animeList = animeListArr[8];
  const owner = testUsers[2];
  const ratingsArr = helpers.makeRatingArray();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });
  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));
  describe('/users/:term', () => {
    beforeEach('insert users', () => {
      return helpers.seedUsersTable(db, testUsers);
    });
    it('should return 400 and an error when nothing is found matching the term', () => {
      return supertest(app)
        .get('/api/search/users/foobarshouldntbehere')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(400, { error: 'Nothing found matching search criteria' });
    });
    it('should return 200 and an array of users whose name include the search term', () => {
      return supertest(app)
        .get(`/api/search/users/${testUser.username}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200, [
          { username: testUser.username, user_id: testUser.user_id },
        ]);
    });
  });
  describe('/lists/:term', () => {
    beforeEach('insert users', () => {
      return helpers.seedUsersTable(db, testUsers);
    });
    beforeEach('insert anime_list', () => {
      return helpers.seedAnimeListTable(db, animeListArr);
    });
    beforeEach('insert anime_list', () => {
      return helpers.seedRatingTable(db, ratingsArr);
    });
    it('should return 400 and an error when nothing is found matching the term', () => {
      return supertest(app)
        .get('/api/search/lists/foobarshouldntbehere')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(400, { error: 'Nothing found matching search criteria' });
    });
    it('should return 200 and an array of lists whose name includes the search term', () => {
      return supertest(app)
        .get(`/api/search/lists/${animeList.name}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200, [
          {
            list_id: animeList.list_id,
            name: animeList.name,
            owner: { username: owner.username, user_id: owner.user_id },
            rating: helpers.calculateListRating(animeList),
            user_rating: helpers.makeExpectedUserRating(animeList, testUser),
          },
        ]);
    });
  });
});
