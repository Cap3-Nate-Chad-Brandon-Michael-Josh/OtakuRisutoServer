/* eslint-disable quotes */
require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const authRouter = require("./auth/auth-router");
const animeRouter = require("./anime/anime-router");
const listRouter = require("./list/list-router");
const searchRouter = require("./search/search-router");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(express.json());
app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use("/api/auth", authRouter);
app.use("/api/anime", animeRouter);
// app.use("/api/list", listRouter);
<<<<<<< HEAD
// app.use("/api/anime", animeRouter);
app.use("/api/list", listRouter);
// app.use("/api/search", searchRouter);
=======
app.use("/api/search", searchRouter);
>>>>>>> search-users
app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

module.exports = app;
