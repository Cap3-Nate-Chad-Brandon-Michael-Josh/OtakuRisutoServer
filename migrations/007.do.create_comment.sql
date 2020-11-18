CREATE TABLE IF NOT EXISTS comment(
  comment_id PRIMARY KEY SERIAL,
  comment_user_id INTEGER REFERENCES user(user_id),
  list_id INTEGER REFERENCES anime-list(list_id),
  comment VARCHAR(250) NOT NULL
)