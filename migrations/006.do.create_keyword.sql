CREATE TABLE IF NOT EXISTS keyword(
  keyword_id SERIAL PRIMARY KEY,
  list_id INTEGER REFERENCES anime_list(list_id),
  keyword VARCHAR(100) NOT NULL
)