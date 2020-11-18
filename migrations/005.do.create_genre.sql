CREATE TABLE genre (
  genre_id PRIMARY KEY SERIAL,
  list_id INTEGER REFERENCES anime-list(list_id),
  anime_id INTEGER REFERENCES anime(anime_id),
  genre TEXT NOT NULL
)