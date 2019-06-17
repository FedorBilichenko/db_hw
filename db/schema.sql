CREATE EXTENSION IF NOT EXISTS citext;

DROP TABLE IF EXISTS users_forums;
DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS threads;
DROP TABLE IF EXISTS forums;
DROP TABLE IF EXISTS "users";

CREATE TABLE IF NOT EXISTS "users" (
  nickname CITEXT NOT NULL,
  email CITEXT NOT NULL,
  fullname TEXT NOT NULL,
  about TEXT NOT NULL
);

CREATE UNIQUE INDEX index_on_users_nickname
  ON "users" (nickname COLLATE "C");

/*CREATE INDEX index_on_users_nickname_email
  ON "users" (nickname, email);

CREATE INDEX index_on_users_email
  ON "users" (email);*/

CREATE TABLE IF NOT EXISTS forums (
  slug CITEXT NOT NULL PRIMARY KEY,
  "user" CITEXT NOT NULL REFERENCES "users" (nickname),
  title CITEXT  NOT NULL,
  posts INT NOT NULL DEFAULT 0,
  threads INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS threads (
  id SERIAL NOT NULL PRIMARY KEY,
  slug CITEXT DEFAULT NULL,
  author CITEXT NOT NULL REFERENCES "users" (nickname),
  created timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  forum CITEXT NOT NULL REFERENCES forums (slug),
  message TEXT NOT NULL,
  title TEXT NOT NULL,
  votes INT DEFAULT 0
);

CREATE UNIQUE INDEX index_on_threads_slug
  ON threads (slug);

CREATE TABLE IF NOT EXISTS users_forums (
  "user" CITEXT NOT NULL,
  forum CITEXT NOT NULL
);

CREATE UNIQUE INDEX index_on_user_posts
  ON users_forums("user", forum);

CREATE FUNCTION new_thread() RETURNS trigger AS $new_thread$
  BEGIN
    UPDATE forums
    SET threads = threads + 1
    WHERE slug = NEW.forum;

    INSERT INTO users_forums ("user", forum)
    SELECT NEW.author, NEW.forum
    WHERE NOT EXISTS (
                SELECT 1
                FROM users_forums
                WHERE "user" = NEW.author
                  AND forum = NEW.forum
                LIMIT 1
        );

    RETURN NEW;
  END;
$new_thread$ LANGUAGE plpgsql;

CREATE TRIGGER new_thread AFTER INSERT ON threads
  FOR EACH ROW EXECUTE PROCEDURE new_thread();

-- CREATE INDEX index_on_forums_slug ON forums(slug);



CREATE INDEX index_on_threads_id ON threads(id);
CREATE INDEX index_on_threads_forum ON threads(forum);

CREATE TABLE IF NOT EXISTS posts (
  id SERIAL NOT NULL PRIMARY KEY,
  parent INT NOT NULL DEFAULT 0,
  author CITEXT NOT NULL REFERENCES "users" (nickname),
  created timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  forum CITEXT NOT NULL,
  "isEdited" BOOLEAN NOT NULL DEFAULT FALSE,
  message TEXT NOT NULL,
  thread INT NOT NULL,
  path INTEGER[] NOT NULL
);

CREATE INDEX index_on_posts_id ON posts (id);
CREATE INDEX index_on_posts_id_thread ON posts (id, thread);

CREATE TABLE IF NOT EXISTS votes (
  "user" CITEXT NOT NULL REFERENCES "users" (nickname),
  thread INT NOT NULL REFERENCES threads (id),
  vote INT NOT NULL DEFAULT 0,
  PRIMARY KEY ("user", thread)
);

CREATE INDEX index_on_votes_user_thread
  ON votes ("user", thread);