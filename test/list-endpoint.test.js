const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const helpers = require('./test-helpers');
const { expect } = require('chai');

describe.only('list endpoint', () => {
  let db;
  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];
  const animeArr = helpers.makeAnimeArray();
  const animeListArr = helpers.makeAnimeListArray();
  const animeList = animeListArr[8];
  const anime = animeArr[0];
  const listAnimeArr = helpers.makeListAnimeArray();
  const listAnime = listAnimeArr[0];
  const ratingArr = helpers.makeRatingArray();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });
  before('cleanup', () => helpers.cleanTables(db));
  after('disconnect from db', () => db.destroy());

  afterEach('cleanup', () => {
    return helpers.cleanTables(db);
  });
  describe('/api/list', () => {
    beforeEach('insert users', () => {
      return helpers.seedUsersTable(db, testUsers);
    });

    beforeEach('insert anime', () => {
      return helpers.seedAnimeTable(db, animeArr);
    });
    beforeEach('insert anime-lists', () => {
      return helpers.seedAnimeListTable(db, animeListArr);
    });
    beforeEach('insert list_anime', () => {
      return helpers.seedListAnimeTable(db, listAnimeArr);
    });
    afterEach('cleanup', () => helpers.cleanTables(db));
    describe('GET /api/list', () => {
      it('should respond with 200 and an array of list objects when given proper data', () => {
        return supertest(app)
          .get('/api/list')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(helpers.makeExpectedListArr());
      });
    });
    describe('POST /api/list', () => {
      it('should respond with 201 after list has been added to database', () => {
        let body = {
          anime: helpers.makeNewAnimeArr(),
          name: 'testy',
          private: false,
        };

        return supertest(app)
          .post('/api/list')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(body)
          .expect(201)
          .then(() => {
            return db
              .from('anime_list')
              .select('*')
              .where({ user_id: testUser.user_id });
          })
          .then((res) => {
            expect(res[res.length - 1].name).to.eql(body.name);
            return db
              .from('list_anime')
              .select('*')
              .where({ list_id: res[res.length - 1].list_id })
              .then((res) => {
                expect(res).to.eql(helpers.makeExpectedListAnimeArr());
              });
          });
      });
    });
  });
  describe('/api/list/:id', () => {
    beforeEach('insert users', () => {
      return helpers.seedUsersTable(db, testUsers);
    });

    beforeEach('insert anime', () => {
      return helpers.seedAnimeTable(db, animeArr);
    });
    beforeEach('insert anime-lists', () => {
      return helpers.seedAnimeListTable(db, animeListArr);
    });
    beforeEach('insert list_anime', () => {
      return helpers.seedListAnimeTable(db, listAnimeArr);
    });
    beforeEach('insert ratings', () => {
      return helpers.seedRatingTable(db, ratingArr);
    });
    afterEach('cleanup', () => helpers.cleanTables(db));
    describe('GET api/list/:id', () => {
      it('should return 200 and a list object containing rating, comments, an array of list_anime objects, and an array of anime objects', () => {
        return supertest(app)
          .get(`/api/list/${animeList.list_id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(helpers.makeExpectedList(animeList));
      });
    });
  });
});
