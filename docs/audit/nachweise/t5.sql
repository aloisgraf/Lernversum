-- T5: Namensabgleich in Test 2: Tabelle ohne RLS in game_x wird übersehen, wenn gleichnamige Tabelle mit RLS existiert
-- (Test 1 schlägt hier an; zeigt nur, dass Test 2 allein unzuverlässig ist)
begin;
create schema game_x;
create table game_x.probe(id int);
grant insert on game_x.probe to anon;
create table public.probe(id int);
alter table public.probe enable row level security;
\i 000_baseline.test.sql
