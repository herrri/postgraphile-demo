CREATE TABLE "votes" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user" int,
  "created_by" int,
  "created_at" timestamp
);

CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "first_name" varchar,
  "last_name" varchar,
  "email" varchar,
  "created_at" timestamp,
  "updated_at" timestamp
);

ALTER TABLE "votes" ADD FOREIGN KEY ("user") REFERENCES "users" ("id");

ALTER TABLE "votes" ADD FOREIGN KEY ("created_by") REFERENCES "users" ("id");

CREATE UNIQUE INDEX ON "votes" ("user", "created_by");

COMMENT ON TABLE "votes" IS '@omit update,delete';

CREATE ROLE "admin";
CREATE ROLE "user";
CREATE ROLE "anonymous";

GRANT ALL ON public.users TO "admin";
GRANT ALL ON public.votes TO "admin";
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO "admin";
GRANT USAGE, SELECT ON SEQUENCE votes_id_seq TO "admin";

GRANT SELECT ON public.users TO "user";
GRANT SELECT, INSERT ON public.votes TO "user";
GRANT USAGE, SELECT ON SEQUENCE votes_id_seq TO "user";

GRANT SELECT ON public.votes TO "anonymous"