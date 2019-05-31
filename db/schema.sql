CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS "users" (
  nickname CITEXT NOT NULL,
  email CITEXT NOT NULL,
  fullname TEXT NOT NULL,
  about TEXT NOT NULL
);

CREATE UNIQUE INDEX index_on_users_nickname
  ON "users" (nickname COLLATE "C");

CREATE TABLE IF NOT EXISTS forums (
  slug CITEXT NOT NULL PRIMARY KEY,
  "user" CITEXT NOT NULL REFERENCES "users" (nickname),
  title CITEXT  NOT NULL,
  posts INT NOT NULL DEFAULT 0,
  threads INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS threads (
  id SERIAL PRIMARY KEY,
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

CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  parent INT NOT NULL DEFAULT 0,
  author CITEXT NOT NULL REFERENCES "users" (nickname),
  created timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  forum CITEXT NOT NULL,
  "isEdited" BOOLEAN NOT NULL DEFAULT FALSE,
  message TEXT NOT NULL,
  thread INT NOT NULL,
  path INTEGER[]
);

CREATE TABLE IF NOT EXISTS votes (
  "user" CITEXT NOT NULL REFERENCES "users" (nickname),
  thread INT NOT NULL REFERENCES threads (id),
  voice INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS users_forums (
  "user" CITEXT NOT NULL,
  forum CITEXT NOT NULL
);

CREATE UNIQUE INDEX index_on_user_posts
  ON users_forums("user", forum);