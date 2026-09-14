-- Run in the-awakened SQL Editor. Topics admins can add, then tick on a post.

create table if not exists public.topics (
  slug text primary key,
  title text not null,
  created_at timestamptz not null default now()
);

insert into public.topics (slug, title) values
  ('control', 'Control'),
  ('health', 'Health'),
  ('money', 'Money')
on conflict (slug) do nothing;

alter table public.topics enable row level security;

drop policy if exists members_read_topics on public.topics;
drop policy if exists admins_insert_topics on public.topics;
drop policy if exists admins_update_topics on public.topics;
drop policy if exists admins_delete_topics on public.topics;

create policy members_read_topics
  on public.topics for select to authenticated using (true);

create policy admins_insert_topics
  on public.topics for insert to authenticated
  with check (public.is_admin());

create policy admins_update_topics
  on public.topics for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy admins_delete_topics
  on public.topics for delete to authenticated
  using (public.is_admin());

grant select, insert, update, delete on public.topics to authenticated;
revoke all on public.topics from anon;

drop policy if exists admins_update_posts on public.posts;
create policy admins_update_posts
  on public.posts for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());
