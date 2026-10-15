-- T6: Andere Schemas, die über die API erreichbar werden könnten, prüft der Basistest nicht
begin;
create schema app_private;
create table app_private.probe(id int);
grant usage on schema app_private to anon; grant select on app_private.probe to anon;
\i 000_baseline.test.sql
