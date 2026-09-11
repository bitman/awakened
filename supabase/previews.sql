-- Run in the-awakened SQL Editor. Link thumbnails for Group excerpts.

alter table public.group_posts
  add column if not exists link_url text,
  add column if not exists link_title text,
  add column if not exists link_image text;
