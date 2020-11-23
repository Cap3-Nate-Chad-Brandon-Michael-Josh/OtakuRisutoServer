BEGIN;
TRUNCATE
rating,
comment,
list_anime,
anime,
anime_list,
users;

INSERT INTO users (user_id, username, password, email)
VALUES
(1, 'admin1', '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG', 'email123@email.com'),
(2, 'admin2', '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG', 'email123@email.com'),
(3, 'admin3', '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG', 'email123@email.com'),
(4, 'admin4', '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG', 'email123@email.com');

INSERT INTO anime_list (list_id, user_id, name, private)
VALUES
(1, 1, 'seen', true),
(2, 1, 'must watch', true),
(3, 2, 'seen', true),
(4, 2, 'must watch', true);

INSERT INTO anime(anime_id, title, description, image_url, rating, episode_count, genre)
VALUES
(1, 'attack on titan', 'yea you know what it is', 'sample image_url', 8, 26, '{shounen, action}'),
(2, 'naruto', 'yea you know what it is', 'sample image_url', 1, 260, '{shounen, action}'),
(3, 'boku no pico', 'yea you know what it is', 'sample image_url', 7, 12, '{horror}'),
(4, 'dragonball z', 'yea you know what it is', 'sample image_url', 3, 2600, '{shounen, action}'),
(5, 'my hero academia', 'yea you know what it is', 'sample image_url', 10, 72, '{shounen, action}'),
(6, 'sword art online', 'yea you know what it is', 'sample image_url', 10, 48, '{shounen, action, virtual reality}');


INSERT INTO list_anime(list_anime_id, anime_id, list_id)
VALUES
(1, 6, 1),
(2, 5, 1),
(3, 1, 1),
(4, 4, 2),
(5, 3, 2),
(6, 2, 2),
(7, 1, 3),
(8, 6, 4);


INSERT INTO comment(comment_id, comment_user_id, list_id, comment)
VALUES 
(1, 1, 1, 'FIRST!!'),
(2, 2, 1, 'Aww I wanted to be first'),
(3, 3, 1, 'SECOND!!'),
(4, 2, 1, 'no your not! I was!'),
(5, 1, 2, 'FIRST!!');


INSERT INTO rating(rating_id, rating_user_id, list_id, rating)
VALUES
(1, 1, 1, 5),
(2, 2, 1, 1),
(3, 1, 2, 3);
SELECT setval('users_user_id_seq', (SELECT MAX(user_id) from users));
SELECT setval('anime_list_list_id_seq', (SELECT MAX(list_id) from anime_list));
SELECT setval('anime_anime_id_seq', (SELECT MAX(anime_id) from anime));
SELECT setval('list_anime_list_anime_id_seq', (SELECT MAX(list_anime_id) from list_anime));
SELECT setval('comment_comment_id_seq', (SELECT MAX(comment_id) from comment));
SELECT setval('rating_rating_id_seq', (SELECT MAX(rating_id) from rating));
COMMIT;