CREATE TABLE IF NOT EXISTS anime(
  anime_id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  rating FLOAT,
  episode_count INTEGER,
  genre text[]
)