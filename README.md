# Work Wallet — MVP

A single vertical slice: register → log in → upload a compliance document → generate a share link/QR
code → an employer views a read-only page. No native app, no custom REST server — Supabase provides
auth, the Postgres database, and encrypted file storage; the React app talks to it directly.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- Supabase (Auth, Postgres, Storage, one Edge Function)
- react-router-dom, qrcode.react

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) -> New project.
2. Once it's up, go to **Project Settings -> API** and copy the **Project URL** and **anon public** key.

## 2. Run the database schema

Open the **SQL Editor** in Supabase, paste in `supabase/schema.sql`, and run it. This creates:

- `documents` and `share_links` tables with row-level security, so a user can only ever see/edit their
  own rows (and an anonymous visitor can only read documents belonging to an *active* share link).
- A private `documents` storage bucket with policies so a user can only read/write inside their own
  `user_id/` folder.

## 3. Deploy the edge function (for public downloads)

The public wallet page needs to hand out download links without exposing your service role key to the
browser or making the whole bucket public. `supabase/functions/get-document-url` checks the share token
server-side and returns a signed URL valid for 60 seconds.

```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref
supabase functions deploy get-document-url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # from Project Settings -> API
```

supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3bGNldmx6bmZ5eml4YXJ3cGZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzA1NDEzMiwiZXhwIjoyMTAyNjMwMTMyfQ.15Sowb3PrGApCfxrpv8N0vWB1-LaGWGT8efEcERDDv4

## 4. Configure the app

```bash
cp .env.example .env
# fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

## 5. Deploy

Push to a repo and connect it to Vercel or Netlify (matching your usual workflow) — set the same two
`VITE_SUPABASE_*` env vars in the project's dashboard. No server to stand up.

## What's deliberately not built yet

Per the MVP plan: no expiry push notifications, no multi-share-link management (one active link per
user for now), no admin/recruiter accounts, no document verification. The category list and expiry
status colours from the original spec are already wired up in the schema and UI — categories can be
extended in `src/lib/types.ts`.

## Security notes

- The storage bucket is **private**. Owners get signed URLs via their own session; public visitors get
  a signed URL only through the edge function, only for documents tied to an *active* share link.
- To revoke a share link, set `active = false` on its `share_links` row (a "Deactivate link" button in
  the dashboard is the obvious next addition — not in this slice yet).
- Supabase encrypts data at rest and all traffic is HTTPS by default, covering the spec's encryption
  requirement without extra setup.
