CREATE TABLE IF NOT EXISTS rating(
  rating_id SERIAL PRIMARY KEY,
  rating_user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  list_id INTEGER REFERENCES anime_list(list_id) ON DELETE CASCADE,
  rating INTEGER NOT NULL
)