-- T4: View nur mit SELECT-Recht (Schreibrechte entzogen) umgeht RLS, Basistest bleibt grün
begin;
create table public.probe_t(id int primary key, secret text);
alter table public.probe_t enable row level security;
insert into public.probe_t values (1,'geheim');
create view public.probe_v as select * from public.probe_t;
revoke insert, update, delete on public.probe_v from anon, authenticated;
set local role anon;
select 'anon_liest_view_trotz_rls', count(*) from public.probe_v;
reset role;
\i 000_baseline.test.sql
