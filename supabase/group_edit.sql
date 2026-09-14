-- Run in the-awakened SQL Editor. Lets admins edit Group excerpts.

grant update on public.group_posts to authenticated;

drop policy if exists members_update_group_posts on public.group_posts;
create policy members_update_group_posts
  on public.group_posts for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());
