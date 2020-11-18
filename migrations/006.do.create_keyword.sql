CREATE TABLE IF NOT EXISTS keyword(
  keyword_id PRIMARY KEY SERIAL,
  list_id INTEGER REFERENCES anime-list(list_id),
  keyword TEXT NOT NULL
)