-- Grundregel: Jede Tabelle in den Anwendungsschemas muss Row Level Security aktiviert haben.
-- Der Test läuft bei jeder Migration mit und schlägt fehl, sobald eine Tabelle ohne RLS dazukommt.
begin;
create extension if not exists pgtap with schema extensions;

select plan(2);

select is(
  (
    select count(*)::int
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where c.relkind in ('r', 'p')
      and (n.nspname = 'public' or n.nspname like 'game\_%')
      and not c.relrowsecurity
  ),
  0,
  'Alle Tabellen in public und game_* haben RLS aktiviert'
);

select is(
  (
    select count(*)::int
    from information_schema.role_table_grants
    where grantee = 'anon'
      and privilege_type in ('INSERT', 'UPDATE', 'DELETE')
      and (table_schema = 'public' or table_schema like 'game\_%')
      and table_name not in (
        select c.relname from pg_class c where c.relrowsecurity
      )
  ),
  0,
  'Anonyme Nutzer haben keine Schreibrechte auf Tabellen ohne RLS'
);

select * from finish();
rollback;
