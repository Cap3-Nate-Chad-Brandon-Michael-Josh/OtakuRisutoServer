const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const helpers = require('./test-helpers');
const { expect } = require('chai');

describe('anime endpoint', () => {
  let db;
  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];
  const animeArr = helpers.makeAnimeArray();
  const animeListArr = helpers.makeAnimeListArray();
  const animeList = animeListArr[0];
  const anime = animeArr[0];
  const listAnimeArr = helpers.makeListAnimeArray();
  const listAnime = listAnimeArr[0];

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

  describe('POST /api/anime', () => {
    beforeEach('insert users', () => {
      return helpers.seedUsersTable(db, testUsers);
    });

    beforeEach('insert anime', () => {
      return helpers.seedAnimeTable(db, animeArr);
    });
    beforeEach('insert anime-lists', () => {
      return helpers.seedAnimeListTable(db, animeListArr);
    });
    const requiredFields = ['anime', 'list_id'];
    requiredFields.forEach((field) => {
      const validAnime = {
        anime: anime,
        list_id: animeList.list_id,
      };
      it(`Responds 400 when missing ${field}`, () => {
        delete validAnime[field];
        return supertest(app)
          .post('/api/anime')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(validAnime)
          .expect(400, { error: `Missing ${field}` });
      });
    });
    it('Responds 401 when given a list_id belonging to a different user', () => {
      return supertest(app)
        .post('/api/anime')
        .set('Authorization', helpers.makeAuthHeader(testUsers[2]))
        .send({ anime, list_id: animeList.list_id })
        .expect(401, { error: 'Unauthorized request' });
    });
    it('responds with 201 and an anime object after adding it to the database as a list-anime', () => {
      return supertest(app)
        .post('/api/anime')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send({ anime, list_id: animeList.list_id })
        .expect(201, {
          anime: {
            anime_id: anime.anime_id,
            title: anime.title,
            description: anime.description,
            image_url: anime.image_url,
            rating: anime.rating,
            episode_count: anime.episode_count,
            genre: anime.genre,
          },
        })
        .expect(() =>
          db
            .from('list_anime')
            .where({ list_id: animeList.list_id })
            .then((res) => {
              expect(res[res.length - 1].anime_id).to.eql(anime.anime_id);
              expect(res[res.length - 1].list_anime_id).to.exist;
            })
        );
    });
    it('updates anime with new info if anime already exists in database', () => {
      let updatedAnime = {
        anime_id: anime.anime_id,
        title: anime.title,
        description: 'changed',
        image_url: anime.image_url,
        rating: anime.rating,
        episode_count: anime.episode_count,
        genre: anime.genre,
      };
      return supertest(app)
        .post('/api/anime')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send({ anime: updatedAnime, list_id: animeList.list_id })
        .expect(201, {
          anime: {
            anime_id: anime.anime_id,
            title: updatedAnime.title,
            description: updatedAnime.description,
            image_url: updatedAnime.image_url,
            rating: updatedAnime.rating,
            episode_count: updatedAnime.episode_count,
            genre: updatedAnime.genre,
          },
        })
        .expect(() =>
          db
            .from('list_anime')
            .where({ list_id: animeList.list_id })
            .then((res) => {
              expect(res[res.length - 1].anime_id).to.eql(
                updatedAnime.anime_id
              );
              expect(res[res.length - 1].list_anime_id).to.exist;
            })
        );
    });
  });
  describe('DELETE /api/anime', () => {
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
    it('responds 400 when list_anime_id is not provided', () => {
      return supertest(app)
        .del('/api/anime')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send({ foo: 'bar' })
        .expect(400, { error: 'Missing list_anime_id' });
    });
    it('responds 400 when list_anime_id not correct data type', () => {
      return supertest(app)
        .del('/api/anime')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send({ list_anime_id: 'this is wrong' })
        .expect(400, { error: 'Invalid list_anime_id' });
    });
    it('responds 400 when list_anime_id not in database', () => {
      return supertest(app)
        .del('/api/anime')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send({ list_anime_id: 9000 })
        .expect(400, { error: 'list_anime not found' });
    });
    it('responds with 204 when list_anime is successfully deleted', () => {
      return supertest(app)
        .del('/api/anime')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send({ list_anime_id: listAnime.list_anime_id })
        .expect(204)
        .expect(() => {
          db.from('list_anime')
            .where({ list_anime_id: listAnime.list_anime_id })
            .then((res) => {
              expect(res.length).to.eql(0);
            });
        });
    });
  });
});
