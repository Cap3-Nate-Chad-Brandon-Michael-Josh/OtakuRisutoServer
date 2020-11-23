const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const helpers = require("./test-helpers");
const jwt = require("jsonwebtoken");
const { expect } = require("chai");

describe("Auth endpoints", () => {
  let db;
  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[1];
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
  describe("POST /api/auth/login", () => {
    beforeEach("insert users", () => helpers.seedUsersTable(db, testUsers));
    const requiredFields = ["username", "password"];
    requiredFields.forEach((field) => {
      const validUser = {
        username: testUser.username,
        password: testUser.password,
      };
      it(`Responds with 400 when missing ${field}`, () => {
        delete validUser[field];
        return supertest(app)
          .post("/api/auth/login")
          .send(validUser)
          .expect(400, { error: `Missing ${field}` });
      });
      it(" responds 400 invalid when user username or password not in database", () => {
        const InvalidUser = {
          username: "invalid user name",
          password: "invalid password",
        };
        const requiredFields = ["username", "password"];
        requiredFields.forEach((field) => {
          return supertest(app)
            .post("/api/auth/login")
            .send(InvalidUser)
            .expect(400, { error: "Invalid credentials" });
        });
      });
    });
  });
});
