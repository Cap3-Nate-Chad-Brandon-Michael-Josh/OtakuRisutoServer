require('dotenv').config();

const knex = require('knex');
const app = require("./app");
const { PORT, DATABASE_URL } = require("./config");

const parse = require('pg-connection-string').parse;
const pgconfig = parse(DATABASE_URL + "?sslmode=require");
pgconfig.ssl = { rejectUnauthorized: false };

const db = knex({
  client: 'pg',
  connection: pgconfig,
})

app.set('db', db);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
