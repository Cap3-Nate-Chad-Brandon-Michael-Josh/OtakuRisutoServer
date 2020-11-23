ALTER TABLE anime
DROP COLUMN genre;

CREATE TABLE genre (
  genre_id SERIAL PRIMARY KEY,
  list_id INTEGER REFERENCES anime_list(list_id),
  anime_id INTEGER REFERENCES anime(anime_id),
  genre VARCHAR(100) NOT NULL
)