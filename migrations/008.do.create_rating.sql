CREATE TABLE IF NOT EXISTS rating(
  rating_id PRIMARY KEY SERIAL,
  rating_user_id INTEGER REFERENCES user(user_id),
  list_id INTEGER REFERENCES anime-list(list_id),
  rating INTEGER NOT NULL
)