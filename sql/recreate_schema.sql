-- Enable pgcrypto for UUID generation and hashing
create extension if not exists pgcrypto;

-- 1. DROP TABLES (Cleanup)
-- Drop tables with Foreign Keys first
drop table if exists public.profiles cascade;
drop table if exists public.submissions cascade;
drop table if exists public.program_requests cascade;
drop table if exists public.faculty cascade;
drop table if exists public.subjects cascade;
-- Drop potentially existing legacy tables
drop table if exists public.uploads cascade;
-- Drop independent tables
drop table if exists public.registrations cascade;
drop table if exists public.heis cascade;
drop table if exists public.program_master cascade;

-- 2. CREATE TABLES

-- HEIs Table (Referenced by others)
create table public.heis (
  id uuid default gen_random_uuid() primary key,
  name text,
  campus_name text,
  address text,
  region_destination text,
  academic_year text,
  created_at timestamptz default now()
);
alter table public.heis enable row level security;

-- RLS Policies for HEIs moved after profiles table creation


-- Profiles Table (Users/Admins)
create table public.profiles (
  id uuid default gen_random_uuid() primary key,
  username text unique,
  role text,
  assigned_region text,
  password_hash text,
  must_change_password boolean default true,
  hei_id uuid references public.heis(id) on delete set null,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;

-- RLS Policies for HEIs (Must be created after profiles table)
create policy "Enable read access for all users" on public.heis for select using (true);
create policy "Enable insert/update/delete for admins only" on public.heis for all using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- RLS Policies for Profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);
create policy "Admins can update all profiles" on public.profiles for update using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- Registrations Table (Pending User Signups)
create table public.registrations (
  id uuid default gen_random_uuid() primary key,
  hei_name text,
  campus text,
  region text,
  province text,
  city text,
  barangay text,
  address_line1 text,
  address_line2 text,
  zip_code text,
  first_name text,
  middle_name text,
  last_name text,
  suffix text,
  status text default 'For Approval',
  username text unique,
  password_hash text,
  is_first_login boolean default true,
  created_at timestamptz default now()
);
alter table public.registrations enable row level security;

-- RLS Policies for Registrations
create policy "Enable insert for everyone" on public.registrations for insert with check (true);
create policy "Admins can view/update all registrations" on public.registrations for all using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- Submissions Table (Files uploaded by HEIs)
create table public.submissions (
  id uuid default gen_random_uuid() primary key,
  hei_id uuid references public.heis(id) on delete cascade,
  campus text,
  form_type text,
  file_id text,
  file_name text,
  web_view_link text,
  web_content_link text,
  created_at timestamptz default now()
);
alter table public.submissions enable row level security;

-- RLS Policies for Submissions
create policy "Admins can do everything on submissions" on public.submissions for all using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);
create policy "HEIs can view own submissions" on public.submissions for select using (
  hei_id in (
    select hei_id from public.profiles
    where profiles.id = auth.uid()
  )
);
create policy "HEIs can insert own submissions" on public.submissions for insert with check (
  hei_id in (
    select hei_id from public.profiles
    where profiles.id = auth.uid()
  )
);
create policy "HEIs can update/delete own submissions" on public.submissions for update using (
  hei_id in (
    select hei_id from public.profiles
    where profiles.id = auth.uid()
  )
);

-- Program Master Table (List of standard programs)
create table public.program_master (
  id uuid default gen_random_uuid() primary key,
  code text,
  title text,
  created_at timestamptz default now()
);
alter table public.program_master enable row level security;

-- RLS Policies for Program Master
create policy "Enable read access for all users" on public.program_master for select using (true);
create policy "Admins can manage program master" on public.program_master for all using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- Program Requests Table (New program applications)
create table public.program_requests (
  id uuid default gen_random_uuid() primary key,
  hei_id uuid references public.heis(id) on delete cascade,
  campus text,
  program_code text,
  program_title text,
  file_id text,
  file_name text,
  web_view_link text,
  web_content_link text,
  status text default 'For Approval',
  created_at timestamptz default now()
);
alter table public.program_requests enable row level security;

-- RLS Policies for Program Requests
create policy "Admins can do everything on program requests" on public.program_requests for all using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);
create policy "HEIs can view own program requests" on public.program_requests for select using (
  hei_id in (
    select hei_id from public.profiles
    where profiles.id = auth.uid()
  )
);
create policy "HEIs can insert own program requests" on public.program_requests for insert with check (
  hei_id in (
    select hei_id from public.profiles
    where profiles.id = auth.uid()
  )
);
create policy "HEIs can update/delete own program requests" on public.program_requests for update using (
  hei_id in (
    select hei_id from public.profiles
    where profiles.id = auth.uid()
  )
);

-- Website Content Table (CMS for homepage)
create table if not exists public.website_content (
  id integer primary key,
  hero_json jsonb,
  news_json jsonb,
  events_json jsonb,
  created_at timestamptz default now()
);
alter table public.website_content enable row level security;

-- RLS Policies for Website Content
drop policy if exists "Enable read access for all users" on public.website_content;
create policy "Enable read access for all users" on public.website_content for select using (true);

drop policy if exists "Admins can manage website content" on public.website_content;
create policy "Admins can manage website content" on public.website_content for all using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- Faculty Table (For Stats)
create table public.faculty (
  id uuid default gen_random_uuid() primary key,
  hei_id uuid references public.heis(id) on delete cascade,
  name text,
  rank text,
  created_at timestamptz default now()
);
alter table public.faculty enable row level security;

-- RLS Policies for Faculty
create policy "Admins can do everything on faculty" on public.faculty for all using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);
create policy "HEIs can view own faculty" on public.faculty for select using (
  hei_id in (
    select hei_id from public.profiles
    where profiles.id = auth.uid()
  )
);
create policy "HEIs can insert own faculty" on public.faculty for insert with check (
  hei_id in (
    select hei_id from public.profiles
    where profiles.id = auth.uid()
  )
);
create policy "HEIs can update/delete own faculty" on public.faculty for update using (
  hei_id in (
    select hei_id from public.profiles
    where profiles.id = auth.uid()
  )
);

-- Subjects/Programs Table (For Stats & Student Counts)
create table public.subjects (
  id uuid default gen_random_uuid() primary key,
  hei_id uuid references public.heis(id) on delete cascade,
  code text,
  description text,
  type text, -- 'Degree Program' or 'Subject'
  title text,
  units integer,
  govt_authority text,
  ay_started text,
  students_ay1 integer default 0,
  students_ay2 integer default 0,
  students_ay3 integer default 0,
  syllabus_file_id text,
  syllabus_file_name text,
  syllabus_view_link text,
  status text default 'For Approval',
  created_at timestamptz default now()
);
alter table public.subjects enable row level security;

-- RLS Policies for Subjects
create policy "Admins can do everything on subjects" on public.subjects for all using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);
create policy "HEIs can view own subjects" on public.subjects for select using (
  hei_id in (
    select hei_id from public.profiles
    where profiles.id = auth.uid()
  )
);
create policy "HEIs can insert own subjects" on public.subjects for insert with check (
  hei_id in (
    select hei_id from public.profiles
    where profiles.id = auth.uid()
  )
);
create policy "HEIs can update/delete own subjects" on public.subjects for update using (
  hei_id in (
    select hei_id from public.profiles
    where profiles.id = auth.uid()
  )
);

-- 3. FUNCTIONS AND SEED DATA (from create_ched_admin_and_seed.sql)

-- Helper function to create or update CHED admin users
drop function if exists public.create_ched_admin(text, text);
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

-- Seed Super admin
select create_ched_admin('superched', 'ALL');

-- Seed Regional CHED admins
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

-- Function for Login
drop function if exists public.login_profile(text, text);
create or replace function public.login_profile(p_username text, p_password text)
returns table(
  id uuid,
  username text,
  role text,
  assigned_region text,
  hei_id uuid,
  must_change_password boolean
)
language sql
as $$
  select
    p.id,
    p.username,
    p.role,
    p.assigned_region,
    p.hei_id,
    coalesce(p.must_change_password, false) as must_change_password
  from public.profiles p
  where p.username = p_username
    and p.password_hash = crypt(p_password, p.password_hash);
$$;

-- Function for Reset Password
drop function if exists public.reset_password_default(text);
create or replace function public.reset_password_default(p_username text)
returns void
language plpgsql
as $$
begin
  update public.profiles
  set password_hash = crypt('CHED@1994', gen_salt('bf')),
      must_change_password = true
  where username = p_username;
end;
$$;

-- Function for Update Credentials
drop function if exists public.update_profile_credentials(uuid, text, text, boolean);
create or replace function public.update_profile_credentials(
  p_user_id uuid,
  p_new_username text,
  p_new_password text,
  p_is_admin boolean
)
returns void
language plpgsql
as $$
begin
  update public.profiles
  set
    username = case
      when p_is_admin then username
      when coalesce(trim(p_new_username), '') = '' then username
      else trim(p_new_username)
    end,
    password_hash = crypt(p_new_password, gen_salt('bf')),
    must_change_password = false
  where id = p_user_id;
end;
$$;

-- Seed initial website content
insert into public.website_content (id, hero_json, news_json, events_json)
values (1, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb)
on conflict (id) do nothing;
