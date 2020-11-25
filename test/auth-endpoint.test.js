const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const helpers = require('./test-helpers');
const jwt = require('jsonwebtoken');
const { expect } = require('chai');

describe('Auth endpoints', () => {
  let db;
  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[1];
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
  describe('POST /api/auth/login', () => {
    beforeEach('insert users', () => helpers.seedUsersTable(db, testUsers));
    const requiredFields = ['username', 'password'];
    requiredFields.forEach((field) => {
      const validUser = {
        username: testUser.username,
        password: testUser.password,
      };
      it(`Responds with 400 when missing ${field}`, () => {
        delete validUser[field];
        return supertest(app)
          .post('/api/auth/login')
          .send(validUser)
          .expect(400, { error: `Missing ${field}` });
      });
      it(' responds 400 invalid when user username or password not in database', () => {
        const InvalidUser = {
          username: 'invalid user name',
          password: 'invalid password',
        };
        const requiredFields = ['username', 'password'];
        requiredFields.forEach((field) => {
          return supertest(app)
            .post('/api/auth/login')
            .send(InvalidUser)
            .expect(400, { error: 'Invalid credentials' });
        });
      });
    });
    it('responds 200 ok and JWT auth token using secret when valid user login', () => {
      const validLogin = {
        username: testUser.username,
        password: testUser.password,
      };
      const expectedToken = jwt.sign(
        { user_id: testUser.user_id },
        process.env.JWT_SECRET,
        {
          subject: testUser.username,
          algorithm: 'HS256',
        }
      );
      return supertest(app)
        .post('/api/auth/login')
        .send(validLogin)
        .expect(200, { authToken: expectedToken });
    });
  });
  describe('POST /api/auth/register', () => {
    beforeEach('insert users', () => helpers.seedUsersTable(db, testUsers));
    const validUser = {
      username: 'newUser',
      password: 'P@ssword1',
      email: 'email1313@email.com',
    };
    it('Responds with 201 and a new user in database when given valid user', () => {
      return supertest(app)
        .post('/api/auth/register')
        .send(validUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).to.have.property('username');
          expect(res.body).to.have.property('email');
        })
        .expect(() => {
          db.from('users')
            .select('*')
            .where({ username: validUser.username })
            .first()
            .then((row) => {
              expect(row.username).to.eql(validUser.username);
              expect(row.email).to.eql(validUser.email);
            });
        });
    });
  });
});
