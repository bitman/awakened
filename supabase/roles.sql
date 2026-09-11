-- Run once in the-awakened SQL Editor after schema.sql.
-- Adds member/admin roles. Then promote your login with the UPDATE at the bottom.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now()
);

insert into public.profiles (id, role)
select id, 'member' from auth.users
on conflict (id) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'member')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security;

drop policy if exists members_read_own_profile on public.profiles;
create policy members_read_own_profile
  on public.profiles for select to authenticated
  using (id = auth.uid());

grant select on public.profiles to authenticated;
revoke all on public.profiles from anon;

drop policy if exists members_delete_own_posts on public.posts;
drop policy if exists admins_delete_posts on public.posts;
create policy admins_delete_posts
  on public.posts for delete to authenticated
  using (public.is_admin());

drop policy if exists members_delete_group_posts on public.group_posts;
drop policy if exists admins_delete_group_posts on public.group_posts;
create policy admins_delete_group_posts
  on public.group_posts for delete to authenticated
  using (public.is_admin());

-- Promote the first admin. Change the email to your sign-in address, then run this line.
-- update public.profiles p
-- set role = 'admin'
-- from auth.users u
-- where p.id = u.id and u.email = 'you@example.com';
