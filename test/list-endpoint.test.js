const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const helpers = require('./test-helpers');
const { expect } = require('chai');

describe('list endpoint', () => {
  let db;
  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];
  const animeArr = helpers.makeAnimeArray();
  const animeListArr = helpers.makeAnimeListArray();
  const animeList = animeListArr[8];
  const listAnimeArr = helpers.makeListAnimeArray();
  const ratingArr = helpers.makeRatingArray();
  const commentArr = helpers.makeCommentArray();
  const anime = animeArr[0];

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
        let expectedListArr = helpers.makeExpectedListArr();
        for (let i = 0; i < expectedListArr.length; i++) {
          expectedListArr[i].rating = helpers.calculateListRating(
            expectedListArr[i]
          );
          expectedListArr[i].user_rating = helpers.makeExpectedUserRating(
            expectedListArr[i],
            testUser
          );
        }
        return supertest(app)
          .get('/api/list')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(expectedListArr);
      });
    });
    describe('POST /api/list', () => {
      const requiredFields = ['name', 'private'];
      requiredFields.forEach((field) => {
        const validList = {
          name: 'testy',
          private: false,
        };
        it(`Responds 400 when missing ${field}`, () => {
          delete validList[field];
          return supertest(app)
            .post('/api/list')
            .set('Authorization', helpers.makeAuthHeader(testUser))
            .send(validList)
            .expect(400, { error: `Invalid ${field}` });
        });
      });
      it('should respond 400 when invalid name', () => {
        return supertest(app)
          .post('/api/list')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send({ name: 3, private: true })
          .expect(400, { error: 'Invalid name' });
      });
      it('should respond 400 when invalid private', () => {
        return supertest(app)
          .post('/api/list')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send({ name: 'testy', private: 'wrong' })
          .expect(400, { error: 'Invalid private' });
      });
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
      it('should update the database with new info for anime already in it when that anime is sent', () => {
        let updatedAnime = {
          anime_id: anime.anime_id,
          title: anime.title,
          description: 'changed',
          image_url: anime.image_url,
          rating: anime.rating,
          episode_count: anime.episode_count,
          genre: anime.genre,
        };
        let body = {
          anime: [updatedAnime],
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
              .from('anime')
              .select('*')
              .where({ title: updatedAnime.title })
              .then((res) => {
                expect(res[0].description).to.eql(updatedAnime.description);
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
    beforeEach('insert comments', () => {
      return helpers.seedCommentTable(db, commentArr);
    });
    afterEach('cleanup', () => helpers.cleanTables(db));
    describe('GET api/list/:id', () => {
      it('should return 400 and an error when no list found at id', () => {
        return supertest(app)
          .get('/api/list/9000000')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(400, { error: 'List at given id not found' });
      });
      it('should return 200 and a list object containing rating, comments, an array of list_anime objects, and an array of anime objects when given proper input', () => {
        return supertest(app)
          .get(`/api/list/${animeList.list_id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(helpers.makeExpectedList(animeList, testUser));
      });
    });
    describe('PATCH api/list/:id', () => {
      const requiredFields = ['name', 'private'];
      requiredFields.forEach((field) => {
        const validList = {
          name: 'testy',
          private: false,
        };
        it(`Responds 400 when missing ${field}`, () => {
          delete validList[field];
          return supertest(app)
            .patch(`/api/list/${animeList.list_id}`)
            .set('Authorization', helpers.makeAuthHeader(testUser))
            .send(validList)
            .expect(400, { error: `Invalid ${field}` });
        });
      });
      it('should respond 400 when invalid name', () => {
        return supertest(app)
          .patch(`/api/list/${animeList.list_id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send({ name: 3, private: true })
          .expect(400, { error: 'Invalid name' });
      });
      it('should respond 400 when invalid private', () => {
        return supertest(app)
          .patch(`/api/list/${animeList.list_id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send({ name: 'testy', private: 'wrong' })
          .expect(400, { error: 'Invalid private' });
      });
      it('should return 200 and a list object when given proper input', () => {
        let body = {
          name: 'changed',
          private: false,
        };
        return supertest(app)
          .patch(`/api/list/${animeList.list_id}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[2]))
          .send(body)
          .expect({
            list_id: animeList.list_id,
            user_id: animeList.user_id,
            name: body.name,
            private: body.private,
            rating: helpers.calculateListRating(animeList),
            user_rating: helpers.makeExpectedUserRating(
              animeList,
              testUsers[2]
            ),
          });
      });
    });
    describe('DELETE api/list/:id', () => {
      it('should respond 400 if missing list_id', () => {
        return supertest(app)
          .del(`/api/list/${animeList.list_id}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[2]))
          .send({ foo: 'bar' })
          .expect(400, { error: 'Missing list_id' });
      });
      it('should respond 204 after deleting list from database', () => {
        return supertest(app)
          .del(`/api/list/${animeList.list_id}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[2]))
          .send({ list_id: animeList.list_id })
          .expect(204)
          .then(() => {
            return db
              .from('anime_list')
              .select('*')
              .where({ list_id: animeList.list_id })
              .then((res) => expect(res.length).to.eql(0));
          });
      });
    });
  });
  describe('/api/comment', () => {
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
    beforeEach('insert comments', () => {
      return helpers.seedCommentTable(db, commentArr);
    });
    describe('POST /api/list/comment', () => {
      const requiredFields = ['comment', 'list_id'];
      requiredFields.forEach((field) => {
        const validComment = {
          comment: 'testy',
          list_id: 3,
        };
        it(`Responds 400 when missing ${field}`, () => {
          delete validComment[field];
          return supertest(app)
            .post('/api/list/comment')
            .set('Authorization', helpers.makeAuthHeader(testUser))
            .send(validComment)
            .expect(400, { error: `Invalid ${field}` });
        });
      });
      it('should respond 400 when invalid comment', () => {
        return supertest(app)
          .post('/api/list/comment')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send({ comment: 3, list_id: true })
          .expect(400, { error: 'Invalid comment' });
      });
      it('should respond 400 when invalid list_id', () => {
        return supertest(app)
          .post('/api/list/comment')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send({ comment: 'testy', list_id: 'wrong' })
          .expect(400, { error: 'Invalid list_id' });
      });
      it('should respond 201 and a new comment object after adding comment to database when valid data passed in', () => {
        let newComment = {
          comment: 'Im a test! Look at me!',
          list_id: animeList.list_id,
        };
        return supertest(app)
          .post('/api/list/comment')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(newComment)
          .expect(201)
          .expect((res) => {
            expect(res.body).to.have.property('comment_id');
            expect(res.body.comment).to.eql(newComment.comment);
            expect(res.body.list_id).to.eql(newComment.list_id);
            expect(res.body.comment_user_id).to.eql(testUser.user_id);
          })
          .expect(() => {
            db.from('comment')
              .select('*')
              .where({
                comment_user_id: testUser.user_id,
                list_id: newComment.list_id,
              })
              .then((res) => {
                expect(res[0]).to.have.property('comment_id');
                expect(res[0].comment).to.eql(newComment.comment);
                expect(res[0].list_id).to.eql(newComment.list_id);
                expect(res[0].comment_user_id).to.eql(testUser.user_id);
              });
          });
      });
    });
  });
  describe('/api/list/rating', () => {
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
    beforeEach('insert comments', () => {
      return helpers.seedCommentTable(db, commentArr);
    });
    describe('POST /api/list/rating', () => {
      const requiredFields = ['rating', 'list_id'];
      requiredFields.forEach((field) => {
        const validRating = {
          rating: 5,
          list_id: 3,
        };
        it(`Responds 400 when missing ${field}`, () => {
          delete validRating[field];
          return supertest(app)
            .post('/api/list/rating')
            .set('Authorization', helpers.makeAuthHeader(testUser))
            .send(validRating)
            .expect(400, { error: `Invalid ${field}` });
        });
      });
      it('should respond with 400 when rating is > 5', () => {
        return supertest(app)
          .post('/api/list/rating')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send({ rating: 90000, list_id: 3 })
          .expect(400, { error: 'Invalid rating' });
      });
      it('should respond with 400 when rating is < 1', () => {
        return supertest(app)
          .post('/api/list/rating')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send({ rating: 0, list_id: 3 })
          .expect(400, { error: 'Invalid rating' });
      });
      it('should respond with 400 when rating is not a number', () => {
        return supertest(app)
          .post('/api/list/rating')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send({ rating: true, list_id: 3 })
          .expect(400, { error: 'Invalid rating' });
      });
      it('should respond with 400 when list_id is not a number', () => {
        return supertest(app)
          .post('/api/list/rating')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send({ rating: 3, list_id: true })
          .expect(400, { error: 'Invalid list_id' });
      });
      it('should respond with 201 and a new rating object from database after being given valid data', () => {
        let newRating = {
          rating: 4,
          list_id: animeList.list_id,
        };
        return supertest(app)
          .post('/api/list/rating')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(newRating)
          .expect(201)
          .expect((res) => {
            expect(res.body).to.have.property('rating_id');
            expect(res.body.rating).to.eql(newRating.rating);
            expect(res.body.list_id).to.eql(newRating.list_id);
            expect(res.body.rating_user_id).to.eql(testUser.user_id);
          })
          .expect(() => {
            db.from('rating')
              .select('*')
              .where({
                rating_user_id: testUser.user_id,
                list_id: newRating.list_id,
              })
              .then((res) => {
                expect(res[0]).to.have.property('rating_id');
                expect(res[0].rating).to.eql(newRating.rating);
                expect(res[0].list_id).to.eql(newRating.list_id);
                expect(res[0].rating_user_id).to.eql(testUser.user_id);
              });
          });
      });
    });
  });
  describe('/api/list/user/user:id', () => {
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
    beforeEach('insert comments', () => {
      return helpers.seedCommentTable(db, commentArr);
    });
    describe('GET /api/list/user/user:id', () => {
      it('should respond with 200 and an array of list objects when given proper data', () => {
        let expectedPublicListArr = helpers
          .makeExpectedListArr()
          .filter((item) => item.private === false);
        for (let i = 0; i < expectedPublicListArr.length; i++) {
          expectedPublicListArr[i].rating = helpers.calculateListRating(
            expectedPublicListArr[i]
          );
          expectedPublicListArr[i].user_rating = helpers.makeExpectedUserRating(
            expectedPublicListArr[i],
            testUser
          );
          expectedPublicListArr[i].owner = {
            user_id: testUser.user_id,
            username: testUser.username,
          };
        }
        return supertest(app)
          .get(`/api/list/user/${testUser.user_id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(expectedPublicListArr);
      });
    });
  });
});
