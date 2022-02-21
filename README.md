`https://dbdiagram.io/d/620f4825485e433543d59822`

`docker exec -i postgraphile-demo-postgres-1 psql -U user -d db < schema.sql`

```
SELECT current_user;  -- user name of current execution context
SELECT session_user;  -- session user name

SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name='public.users';
```