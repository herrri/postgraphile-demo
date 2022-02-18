CREATE TABLE "votes" (
  "id" int PRIMARY KEY,
  "user" int,
  "created_by" int,
  "created_at" datetime
);

CREATE TABLE "users" (
  "id" int PRIMARY KEY,
  "first_name" varchar,
  "last_name" varchar,
  "email" varchar,
  "created_at" datetime,
  "updated_at" datetime
);

ALTER TABLE "votes" ADD FOREIGN KEY ("user") REFERENCES "users" ("id");

ALTER TABLE "votes" ADD FOREIGN KEY ("created_by") REFERENCES "users" ("id");

CREATE UNIQUE INDEX ON "votes" ("user", "created_by");
