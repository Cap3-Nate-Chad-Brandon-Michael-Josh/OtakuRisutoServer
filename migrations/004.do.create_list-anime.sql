CREATE TABLE list-anime(
  list_anime_id PRIMARY KEY SERIAL,
  anime_id INTEGER REFERENCES anime(anime_id),
  list_id INTEGER REFERENCES anime-list(list_id)
)