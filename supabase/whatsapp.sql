-- Run in the-awakened SQL Editor. Extra columns so WhatsApp ingest can land on Group.
-- Everything is published for now. Later we can set published = false and curate.

alter table public.group_posts
  add column if not exists author_name text,
  add column if not exists wa_id text,
  add column if not exists source text not null default 'manual',
  add column if not exists published boolean not null default true;

create unique index if not exists group_posts_wa_id_idx
  on public.group_posts (wa_id)
  where wa_id is not null;
