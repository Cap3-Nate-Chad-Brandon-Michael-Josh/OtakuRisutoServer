/* eslint-disable quotes */
const express = require('express');
const authService = require('./auth-service');
const nodemailer = require('nodemailer');
const authRouter = express.Router();
const config = require('../config');

authRouter.route('/login').post(express.json(), (req, res, next) => {
  const { username, password } = req.body;
  const user = { username, password };

  for (const [key, value] of Object.entries(user))
    if (!value) {
      return res.status(400).json({ error: `Missing ${key}` });
    }

  authService
    .getUserWithUsername(req.app.get('db'), user.username)
    .then((dbUser) => {
      if (!dbUser) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      return authService
        .comparePasswords(user.password, dbUser.password)
        .then((compareMatch) => {
          if (!compareMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
          }
          const sub = dbUser.username;
          const payload = { user_id: dbUser.user_id };
          res.send({ authToken: authService.createJWT(sub, payload) });
        });
    })
    .catch(next);
});
authRouter.route('/register').post(express.json(), (req, res, next) => {
  const { username, password, email } = req.body;
  for (const field of ['username', 'password', 'email'])
    if (!req.body[field])
      return res
        .status(400)
        .json({ error: `Missing ${field} in request body` });
  const passwordError = authService.validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ error: passwordError });
  }
  authService
    .hasUserWithUserName(req.app.get('db'), username)
    .then((hasUserWithUsername) => {
      if (hasUserWithUsername) {
        return res.status(400).json({ error: 'Username already taken' });
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
            .addUser(req.app.get('db'), newUser)
            .then((user) => {
              res.status(201).json(authService.serializeUser(user));
            });
        })
        .catch(next);
    });
});
authRouter.route('/password').post((req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Please submit a valid email' });
  }
  authService.getUserWithEmail(req.app.get('db'), email).then((dbUser) => {
    if (dbUser) {
      const sub = dbUser.username;
      const payload = { user_id: dbUser.user_id };
      let passwordToken = authService.createPasswordJWT(sub, payload);

      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config.EMAIL_USER,
          pass: config.EMAIL_PASS,
        },
      });

      let mailOptions = {
        from: config.EMAIL_USER,
        to: dbUser.email,
        subject: 'Password Reset Request',
        html: `<p>Hello ${dbUser.username}, we have received a request to reset your password. If you did not send this request, there is nothing to worry about, simply ignore this message. If you wish to reset your password however, please follow this link: <a href="https://otaku-risuto.vercel.app/reset/${passwordToken}">Reset Password</a></p>`,
      };

      transporter.sendMail(mailOptions, function (err, data) {});
    }
  });
  res.status(204).send('Success');
});
authRouter.route('/reset').patch(express.json(), (req, res, next) => {
  const { token, password } = req.body;
  for (const field of ['token', 'password'])
    if (!req.body[field])
      return res
        .status(400)
        .json({ error: `Missing ${field} in request body` });
  const passwordError = authService.validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ error: passwordError });
  }

  const passwordPayload = authService.verifyPasswordJWT(token);
  authService.updatePassword(req.app.get('db'), passwordPayload.sub, password);
  authService
    .getUserWithUsername(req.app.get('db'), passwordPayload.sub)
    .then((user) => {
      const sub = user.username;
      const payload = { user_id: user.user_id };
      res.send({ authToken: authService.createJWT(sub, payload) });
    });
});
module.exports = authRouter;
