CREATE TABLE IF NOT EXISTS anime(
  anime_id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  rating INTEGER,
  episode_count INTEGER
)