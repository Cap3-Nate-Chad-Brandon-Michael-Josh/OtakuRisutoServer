/* eslint-disable quotes */
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const xss = require("xss");
const config = require("../config");
// eslint-disable-next-line no-useless-escape
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const authService = {
  getUserwithUsername(db, username) {
    return db("users").where({ username }).first();
  },
  comparePasswords(password, hash) {
    return bcrypt.compare(password, hash);
  },
  verifyJWT(token) {
    return jwt.verify(token, config.JWT_SECRET, {
      algorithm: "HS256",
    });
  },

  createJWT(subject, payload) {
    return jwt.sign(payload, config.JWT_SECRET, {
      subject,
      algorithm: "HS256",
    });
  },
  hasUserWithUserName(db, username) {
    return db("users")
      .where({ username })
      .first()
      .then((user) => !!user);
  },
  addUser(db, user) {
    return db("users")
      .insert(user)
      .returning("*")
      .then(([user]) => user);
  },
  serializeUser(user) {
    return {
      username: xss(user.username),
      email: xss(user.email),
    };
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  validatePassword(password) {
    if (password.length < 8) {
      return "Password must be longer than 8 characters";
    }
    if (password.length > 72) {
      return "Password must be less than 72 characters";
    }
    if (password.startsWith(" ") || password.endsWith(" ")) {
      return "Password must not start or end with empty string";
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return "Password must contain 1 upper case, lower case, number and special character";
    }
    return null;
  },
};

module.exports = authService;
