CREATE TABLE IF NOT EXISTS comment(
  comment_id SERIAL PRIMARY KEY,
  comment_user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  list_id INTEGER REFERENCES anime_list(list_id) ON DELETE CASCADE,
  comment VARCHAR(250) NOT NULL
)