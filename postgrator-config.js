/* eslint-disable quotes */
require("dotenv").config();

const parse = require('pg-connection-string').parse;
const pgconfig = parse(DATABASE_URL + "?sslmode=require");
pgconfig.ssl = { rejectUnauthorized: false };

module.exports = {
  migrationDirectory: "migrations",
  driver: "pg",
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database:
    process.env.NODE_ENV === "test"
      ? process.env.TEST_DATABASE_NAME
      : process.env.DATABASE_NAME,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  connectionString: (process.env.NODE_ENV === 'test')
    ? process.env.TEST_DATABASE_URL
    : pgconfig,
};
