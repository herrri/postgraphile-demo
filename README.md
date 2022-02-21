# postgraphile-demo

## Prerequisites

* Postgres
* Javasctipt
* Docker

### Usage

Get things up and running

```
docker-compose run --rm auth yarn cli:auth generate-keys
docker compose up -d
docker exec -i postgraphile-demo-postgres-1 psql -U user -d db < schema.sql
```

Generate tokens

```
docker-compose run --rm auth yarn cli:auth generate-jwt
docker-compose run --rm auth yarn cli:auth generate-jwt --role admin --aud my_app
docker-compose run --rm auth yarn cli:auth generate-jwt --role user --sub 1
```

## Random tips

```
SELECT current_user;  -- user name of current execution context
SELECT session_user;  -- session user name

SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name='public.users';
```

* https://learn.graphile.org/docs/PostgreSQL_Row_Level_Security_Infosheet.pdf
* https://www.graphile.org/postgraphile/community-plugins/