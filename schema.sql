CREATE TABLE "scores" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "score" int,
  "user_id" int,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "username" varchar,
  "email" varchar,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE VIEW "public_scores" AS
  SELECT score, username
  FROM scores, users
  WHERE public.users.id = public.scores.user_id;

ALTER TABLE "scores" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

COMMENT ON TABLE "scores" IS '@omit update,delete';

CREATE ROLE "admin";
CREATE ROLE "user";
CREATE ROLE "anonymous";

GRANT ALL ON public.users TO "admin";
GRANT ALL ON public.scores TO "admin";
GRANT ALL ON public.public_scores TO "anonymous";
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO "admin";
GRANT USAGE, SELECT ON SEQUENCE scores_id_seq TO "admin";

GRANT SELECT ON public.users TO "user";
GRANT INSERT ON public.scores TO "user";
GRANT SELECT ON public.public_scores TO "user";
GRANT USAGE, SELECT ON SEQUENCE scores_id_seq TO "user";

GRANT SELECT ON public.public_scores TO "anonymous";