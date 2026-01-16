-- Ensure pgcrypto is available for bcrypt hashing
create extension if not exists pgcrypto;

-- Add password_hash column if it does not exist yet
alter table public.profiles
add column if not exists password_hash text;

-- Helper function to create or update CHED admin users
create or replace function public.create_ched_admin(p_username text, p_assigned_region text)
returns void
language plpgsql
as $$
begin
  insert into public.profiles (username, role, assigned_region, password_hash)
  values (
    p_username,
    'admin',
    p_assigned_region,
    crypt('CHED@1994', gen_salt('bf'))
  )
  on conflict (username) do update
    set assigned_region = excluded.assigned_region,
        role = excluded.role,
        password_hash = excluded.password_hash;
end;
$$;

-- Super admin
select create_ched_admin('superched', 'ALL');

-- Regional CHED admins
select create_ched_admin('ched_region1', 'Region 1');
select create_ched_admin('ched_region2', 'Region 2');
select create_ched_admin('ched_region3', 'Region 3');
select create_ched_admin('ched_region4a', 'Region 4A');
select create_ched_admin('ched_region4b', 'Region 4B');
select create_ched_admin('ched_region5', 'Region 5');
select create_ched_admin('ched_region6', 'Region 6');
select create_ched_admin('ched_region7', 'Region 7');
select create_ched_admin('ched_region8', 'Region 8');
select create_ched_admin('ched_region9', 'Region 9');
select create_ched_admin('ched_region10', 'Region 10');
select create_ched_admin('ched_region11', 'Region 11');
select create_ched_admin('ched_region12', 'Region 12');
select create_ched_admin('ched_region13', 'Region 13');

select create_ched_admin('ched_ncr', 'NCR');
select create_ched_admin('ched_car', 'CAR');
select create_ched_admin('ched_barmm', 'BARMM');

create or replace function public.login_profile(p_username text, p_password text)
returns table(
  id uuid,
  username text,
  role text,
  assigned_region text,
  hei_id uuid
)
language sql
as $$
  select
    p.id,
    p.username,
    p.role,
    p.assigned_region,
    p.hei_id
  from public.profiles p
  where p.username = p_username
    and p.password_hash = crypt(p_password, p.password_hash);
$$;

create or replace function public.reset_password_default(p_username text)
returns void
language plpgsql
as $$
begin
  update public.profiles
  set password_hash = crypt('CHED@1994', gen_salt('bf'))
  where username = p_username;
end;
$$;
