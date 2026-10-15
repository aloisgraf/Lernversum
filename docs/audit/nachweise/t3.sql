-- T3: Standardrechte, die Supabase neuen Objekten in public gibt
begin;
create table public.probe_t(id int primary key, secret text);
alter table public.probe_t enable row level security;
create function public.probe_fn() returns int language sql security definer as 'select 42';
create view public.probe_v as select * from public.probe_t;
insert into public.probe_t values (1,'geheim');
select 'tabelle_grants', grantee, string_agg(privilege_type, ',' order by privilege_type) from information_schema.role_table_grants where table_name='probe_t' and grantee in ('anon','authenticated') group by grantee;
select 'fn_execute_anon', has_function_privilege('anon','public.probe_fn()','execute');
select 'view_security_invoker', coalesce((select option_value from pg_options_to_table((select reloptions from pg_class where relname='probe_v')) where option_name='security_invoker'),'nicht gesetzt');
set local role anon;
select 'anon_liest_tabelle', count(*) from public.probe_t;
select 'anon_liest_view', count(*) from public.probe_v;
select 'anon_ruft_definer_fn', public.probe_fn();
reset role;
\i 000_baseline.test.sql
