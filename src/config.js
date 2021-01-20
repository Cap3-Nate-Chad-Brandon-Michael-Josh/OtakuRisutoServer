module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  PASSWORD_SECRET: process.env.PASSWORD_SECRET,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
};
