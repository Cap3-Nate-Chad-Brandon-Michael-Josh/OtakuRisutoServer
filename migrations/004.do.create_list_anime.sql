CREATE TABLE list_anime(
  list_anime_id SERIAL PRIMARY KEY,
  anime_id INTEGER REFERENCES anime(anime_id),
  list_id INTEGER REFERENCES anime_list(list_id)
)