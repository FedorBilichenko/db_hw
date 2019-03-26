CREATE EXTENSION IF NOT EXISTS citext;

DROP TABLE IF EXISTS "users";

CREATE TABLE "users" (
  nickname   CITEXT     NOT NULL,
  email      CITEXT     NOT NULL,
  fullname   TEXT       NOT NULL,
  about      TEXT       NOT NULL
);