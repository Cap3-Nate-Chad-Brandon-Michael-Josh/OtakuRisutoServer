CREATE TABLE IF NOT EXISTS anime_list (
  list_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  private BOOLEAN NOT NULL
)