CREATE TABLE IF NOT EXISTS anime-list (
  list_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES user(user_id),
  name TEXT NOT NULL,
  private BOOLEAN NOT NULL
)