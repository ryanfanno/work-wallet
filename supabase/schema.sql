-- Work Wallet MVP schema
-- Run this in the Supabase SQL editor for a new project.
-- Auth (users) is handled entirely by Supabase Auth — no custom users table needed.

-- ─── Documents ──────────────────────────────────────────────────────────
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null default 'General',
  storage_path text not null,
  expiry_date date,
  uploaded_at timestamptz not null default now()
);

alter table documents enable row level security;

create policy "Users can manage their own documents"
  on documents for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Share links ────────────────────────────────────────────────────────
create table if not exists share_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  public_token text not null unique default encode(gen_random_bytes(6), 'hex'),
  display_name text,
  created_at timestamptz not null default now(),
  active boolean not null default true
);

alter table share_links enable row level security;

create policy "Users can manage their own share links"
  on share_links for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Anyone (including anonymous visitors) can look up an active share link by token.
-- This is what powers the public read-only wallet page.
create policy "Anyone can read an active share link by token"
  on share_links for select
  using (active = true);

-- Anyone can read documents belonging to a user who has an active share link.
-- (The app looks up the share link first, then queries documents for that user_id.)
create policy "Anyone can read documents via an active share link"
  on documents for select
  using (
    exists (
      select 1 from share_links
      where share_links.user_id = documents.user_id
      and share_links.active = true
    )
  );

-- ─── Storage ────────────────────────────────────────────────────────────
-- Create a private bucket called "documents" in Supabase Storage (Dashboard -> Storage -> New bucket,
-- uncheck "Public bucket"), then run the policies below.

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "Users can upload to their own folder"
  on storage.objects for insert
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can view their own files"
  on storage.objects for select
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own files"
  on storage.objects for delete
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- Public downloads for shared documents are handled in the app via short-lived
-- signed URLs (created with the service role on a small edge function), OR — for
-- the MVP — by fetching through the authenticated owner's session when generating
-- the link. See README "Public downloads" note for the two options.
