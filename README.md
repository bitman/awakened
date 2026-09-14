# the-awakened.uk

Members’ site for The Awakened. Vue 3, to be hosted on Vercel with a **separate** Supabase organisation from WeCanGo.

Tabs: Home, About, Posts (long-form), Group (curated WhatsApp), Links, Topics. Pages other than sign-in require a Supabase email/password session.

Old Statamic copy, topics, links, and images were imported. Publishing posts and WhatsApp curation come later.

This repo is **not** WeCanGo. Keep accounts, env files, and CLI links separate so work here cannot pause or bill the other site.

## Local development

```sh
npm install
npm run dev
```

Open http://localhost:5173

```sh
npm run build      # type-check + production build
npm run test:unit
npm run lint
```

### Supabase keys (this project only)

The Vue app uses the **anon** key. It never uses the `postgres://…` database URL or the `service_role` key.

1. Copy `.env.example` to `.env.local`.
2. In the **the-awakened** Supabase project (not WeCanGo): **Settings → API**. Paste the `anon` `public` key into `VITE_SUPABASE_ANON_KEY`.
3. Add the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` on the Vercel project (Environment Variables), then redeploy.
4. **Authentication → Users → Add user** for each member. There is no public sign-up form.
5. Under **Authentication → Providers → Email**, you can turn off “Confirm email” while you are setting up, or add users already confirmed.
6. Create the tables: SQL Editor → paste `supabase/schema.sql` → Run. That adds `posts` and `group_posts`, member-only RLS, and the two old articles.
7. Roles: paste `supabase/roles.sql` → Run. Then run the `update … role = 'admin'` at the bottom with your sign-in email. After that, admins add users and switch roles on the **Members** page.
8. WhatsApp ingest: paste `supabase/whatsapp.sql` → Run. On Vercel add **Secret** env vars (no `VITE_` prefix): `SUPABASE_SERVICE_ROLE_KEY` (service_role key), `WHATSAPP_INGEST_SECRET` (a long random string), `WHATSAPP_VERIFY_TOKEN` (for Meta later). Redeploy. POST JSON to `/api/whatsapp` with `Authorization: Bearer <WHATSAPP_INGEST_SECRET>`.
9. Link thumbnails: paste `supabase/previews.sql` → Run. Group excerpts that contain a URL fetch a small preview image on save.

Do not copy keys from WeCanGo.

## Keep this project isolated from WeCanGo

You do **not** need a second email login. You **do** need a separate Vercel team and a separate Supabase organization. Limits and Fair Use restrictions are billed and enforced at that level, not per project.

### Vercel

| Shared on one Hobby account | What happens |
| --- | --- |
| 100 GB Fast Data Transfer / month | One busy site can **pause both** |
| 1 concurrent build | Deploys queue behind each other |
| 1M function invocations, 4 CPU-hrs | Shared meter |

Hobby is also for personal, non-commercial use. If either site is a real public product, that team belongs on Pro.

**Do this:**

1. In the Vercel dashboard, create a new team named `the-awakened` (team switcher, top left).
2. Import **this** GitHub repo into that team. Do not add it under the WeCanGo team.
3. Attach the domain `the-awakened.uk` on this project only.
4. After `npx vercel link`, confirm `.vercel/project.json` points at the new team. Never copy `.vercel/` from `open_karaoke`.
5. Set your Vercel **default team** to WeCanGo if that is the live production site, so a stray `vercel` in the wrong folder is less likely to surprise you. Always pass `--scope the-awakened` (or the team slug) when deploying this app.

Same GitHub user is fine. Separate **repo** is required.

### Supabase

| Shared on one organization | What happens |
| --- | --- |
| Egress, MAU, storage, function invocations | One quota for every project in the org |
| Free: 2 active projects | A third project will not launch |
| Fair Use restriction | Applied to **all** projects in the org (read-only DB, 402s, pause) |
| Plan is org-wide | You cannot mix Free and Pro projects in one org |

If WeCanGo is already on Pro, a new project in that org is also Pro: extra compute starts around **$10/month per project** on top of the $25 plan fee (one Micro instance is covered by included compute credits).

**Do this:**

1. Create a **new organization** in the Supabase dashboard, e.g. `the-awakened`.
2. Create the project there. Do not add it next to WeCanGo.
3. Copy only this project's anon URL/key into `.env.local` (from `.env.example`). Never reuse WeCanGo keys.
4. Run `npx supabase login` then `npx supabase link --project-ref <this-project-ref>` from this repo only.

Paused free projects do not count toward the 2-project cap. Fair Use **does** apply org-wide, which is the main reason not to share an org.

### GitHub and secrets

- New repository (this one). Do not add a Vercel project on the WeCanGo repo.
- `.env.local` is gitignored. Never copy `open_karaoke/.env.local` here.
- Service role keys stay in Supabase dashboard / Vercel env for this project. They never go in client code.

### When a fully separate login *is* worth it

Only if you want a hard wall: different payment card, different GitHub OAuth, no risk of picking the wrong team in the dashboard. Operational cost is extra 2FA, extra CLI logins, and more chance of deploying while logged into the wrong account. For two of your own sites, **new team + new org on the same login** is the usual setup.

## Domain

Point `the-awakened.uk` (and `www`) at the Vercel project in the **the-awakened** team. Do not add this domain to the WeCanGo project.

## Stack

- Vue 3 + TypeScript + Vite
- Vue Router + Pinia
- Vercel static hosting (SPA rewrite in `vercel.json`)
- Supabase to be added in its own org when we need a backend
