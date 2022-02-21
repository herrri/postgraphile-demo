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

CREATE FUNCTION current_user_id() RETURNS INTEGER AS $$ 
SELECT 
  nullif(
    current_setting('jwt.claims.user_id', true), 
    ''
  ):: INTEGER;
$$ LANGUAGE SQL stable;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY pol_users_admin
  ON users TO admin
  USING (true);

CREATE POLICY pol_scores_admin
  ON scores TO admin
  USING (true);

CREATE POLICY pol_users_user
  ON users TO "user"
  USING (
    id = current_user_id()
  );

CREATE POLICY pol_scores_user
  ON public.scores TO "user"
  for SELECT, 
  USING (
    user_id = current_user_id()
  );

CREATE FUNCTION my_create_score(score int) RETURNS public.scores AS $$
  INSERT INTO public.scores (score, user_id, created_at, updated_at) VALUES ($1, current_user_id(), NOW(), NOW()) RETURNING *;
$$ LANGUAGE sql VOLATILE STRICT SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION my_create_score TO "user";