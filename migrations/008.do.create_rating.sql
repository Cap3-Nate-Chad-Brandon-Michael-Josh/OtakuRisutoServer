CREATE TABLE IF NOT EXISTS rating(
  rating_id SERIAL PRIMARY KEY,
  rating_user_id INTEGER REFERENCES users(user_id),
  list_id INTEGER REFERENCES anime_list(list_id),
  rating INTEGER NOT NULL
)