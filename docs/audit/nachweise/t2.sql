-- T2: Negativtest. Tabelle ohne RLS muss den Basistest scheitern lassen.
begin;
create table public.probe_no_rls(id int);
\i 000_baseline.test.sql
