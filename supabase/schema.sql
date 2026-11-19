-- Database setup for the CPRG 303 Authentication Integration app.
-- Run this whole file in Supabase: SQL Editor > New query > Run.
--
-- announcements: anyone can read (shown on the Sign Up screen)
-- member_resources: only signed-in users can read (shown on the protected screen)


-- Tables

create table if not exists public.announcements (
  id bigint generated always as identity primary key,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.member_resources (
  id bigint generated always as identity primary key,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);


-- Turn on Row Level Security. Without a policy, all rows are blocked.

alter table public.announcements enable row level security;
alter table public.member_resources enable row level security;


-- Allow the app to read the tables.
-- anon is a signed-out user, authenticated is a signed-in user.
-- Only select is granted, so the app cannot add, change, or delete rows.

grant select on public.announcements to anon, authenticated;
grant select on public.member_resources to authenticated;


-- Policies

drop policy if exists "Anyone can read announcements" on public.announcements;
create policy "Anyone can read announcements"
  on public.announcements
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Signed-in users can read member resources" on public.member_resources;
create policy "Signed-in users can read member resources"
  on public.member_resources
  for select
  to authenticated
  using (true);


-- Sample data (only added if the table is empty)

insert into public.announcements (title, body)
select title, body
from (values
  ('Welcome', 'Create an account to see the members-only resources.'),
  ('How to sign up', 'Use a valid email and a password of at least 8 characters with a letter and a number.'),
  ('Your data is protected', 'Members-only content is protected by Row Level Security in Supabase.')
) as seed(title, body)
where not exists (select 1 from public.announcements);

insert into public.member_resources (title, body)
select title, body
from (values
  ('Getting started', 'A short guide to everything available to members.'),
  ('Member schedule', 'Check this list each week for upcoming sessions and deadlines.'),
  ('Study resources', 'Notes and links shared by the group, available after signing in.'),
  ('Contact the team', 'Message any of the team members on Teams if you have questions.')
) as seed(title, body)
where not exists (select 1 from public.member_resources);