-- Run once in the-awakened project: SQL Editor → New query → Run.
-- Members only. Do not run this on the WeCanGo project.

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  body text not null,
  topics text[] not null default '{}',
  images text[] not null default '{}',
  author_id uuid default auth.uid() references auth.users (id) on delete set null,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.group_posts (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  author_id uuid default auth.uid() references auth.users (id) on delete set null,
  posted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists posts_published_at_idx on public.posts (published_at desc);
create index if not exists group_posts_posted_at_idx on public.group_posts (posted_at desc);

alter table public.posts enable row level security;
alter table public.group_posts enable row level security;

drop policy if exists members_read_posts on public.posts;
drop policy if exists members_insert_posts on public.posts;
drop policy if exists members_update_own_posts on public.posts;
drop policy if exists members_delete_own_posts on public.posts;
drop policy if exists members_read_group_posts on public.group_posts;
drop policy if exists members_insert_group_posts on public.group_posts;
drop policy if exists members_delete_group_posts on public.group_posts;

create policy members_read_posts
  on public.posts for select to authenticated using (true);

create policy members_insert_posts
  on public.posts for insert to authenticated
  with check (author_id = auth.uid());

create policy members_update_own_posts
  on public.posts for update to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy members_delete_own_posts
  on public.posts for delete to authenticated
  using (author_id = auth.uid());

create policy members_read_group_posts
  on public.group_posts for select to authenticated using (true);

create policy members_insert_group_posts
  on public.group_posts for insert to authenticated
  with check (author_id = auth.uid());

create policy members_delete_group_posts
  on public.group_posts for delete to authenticated
  using (true);

grant select, insert, update, delete on public.posts to authenticated;
grant select, insert, delete on public.group_posts to authenticated;

revoke all on public.posts from anon;
revoke all on public.group_posts from anon;

insert into public.posts (slug, title, excerpt, body, topics, images, author_id, published_at)
values
  (
    'leaflet-info',
    'Leaflet Info',
    'Five sanctions on the horizon: CBDC, SDGs, ESG, C40 cities, and Smart Cities — and the opposing energy of WATCH.',
    $body$We are going to be sanctioned in five ways, CBDC, SDGS, which are the foundation of the agenda based on Net Zero, ESG’s working in conjunction with SDG’s in a state and private partnership, and C40 cities run by the State and Smart Cities by the WEF.

SMART stands for Surveillance Monitoring Analysing Recording Technology.

WATCH stands for Wise Autonomous Thinking Conscious Human, the opposing energy to their Agenda.$body$,
    array['control', 'money']::text[],
    array['/images/leaflet1.jpg', '/images/leaflet2.jpg']::text[],
    null,
    '2023-10-14 00:00:00+00'
  ),
  (
    'self-custody',
    'Self Custody',
    'There is a big difference between self custody and other types of holdings when it comes to banking.',
    $body$There is a big difference between Self Custody and other types of holdings when it comes to banking...

People don’t seem to understand the many differences in something you can control, and something governments have total control over.$body$,
    array['money']::text[],
    array['/images/cbdc.jpg']::text[],
    null,
    '2023-09-23 00:00:00+00'
  )
on conflict (slug) do nothing;
