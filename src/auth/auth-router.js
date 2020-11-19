/* eslint-disable quotes */
const express = require("express");
const authService = require("./auth-service");

const authRouter = express.Router();

authRouter.route("/login").post(express.json(), (req, res, next) => {
  const { username, password } = req.body;
  const user = { username, password };

  for (const [key, value] of Object.entries(user))
    if (!value) {
      return res.status(400).json({ error: `Missing ${key}` });
    }

  authService
    .getUserWithUsername(req.app.get("db"), user.username)
    .then((dbUser) => {
      if (!dbUser) {
        return res.status(400).json({ error: "Invalid credentials" });
      }
      return authService
        .comparePasswords(user.password, dbUser.password)
        .then((compareMatch) => {
          if (!compareMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
          }
          const sub = dbUser.username;
          const payload = { user_id: dbUser.user_id };
          res.send({ authToken: authService.createJWT(sub, payload) });
        });
    })
    .catch(next);
});
authRouter.route("/register").post(express.json(), (req, res, next) => {
  const { username, password, email } = req.body;
  for (const field of ["username", "password", "email"])
    if (!req.body[field])
      return res
        .status(400)
        .json({ error: `Missing ${field} in request body` });
  const passwordError = authService.validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ error: passwordError });
  }
  authService
    .hasUserWithUserName(req.app.get("db"), username)
    .then((hasUserWithUsername) => {
      if (hasUserWithUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }
      return authService
        .hashPassword(password)
        .then((hashedPassword) => {
          const newUser = {
            username,
            password: hashedPassword,
            email,
          };
          return authService
            .addUser(req.app.get("db"), newUser)
            .then((user) => {
              res.status(201).json(authService.serializeUser(user));
            });
        })
        .catch(next);
    });
});
module.exports = authRouter;
