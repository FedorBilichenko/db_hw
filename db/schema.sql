CREATE EXTENSION IF NOT EXISTS citext;

DROP TABLE IF EXISTS "users";
DROP TABLE IF EXISTS forums;

CREATE TABLE "users" (
  nickname   CITEXT     NOT NULL,
  email      CITEXT     NOT NULL,
  fullname   TEXT       NOT NULL,
  about      TEXT       NOT NULL
);

CREATE TABLE forums (
  slug CITEXT NOT NULL PRIMARY KEY,
  "user" CITEXT NOT NULL,
  title CITEXT  NOT NULL,
  posts INT8 NOT NULL DEFAULT 0,
  threads INT4 NOT NULL DEFAULT 0
);