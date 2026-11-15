-- Makka Pharma CMS starter schema. Run ONLY in a dedicated Makka Supabase project.
create table if not exists public.site_admins (
 user_id uuid primary key references auth.users(id) on delete cascade
);
create table if not exists public.products (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 category text not null,
 image_url text,
 description text not null default '',
 published boolean not null default true,
 sort_order integer not null default 0,
 created_at timestamptz not null default now()
);
create table if not exists public.partners (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 description text not null default '',
 logo_url text,
 website_url text,
 published boolean not null default true,
 sort_order integer not null default 0
);
create table if not exists public.inquiries (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 email text not null,
 message text not null,
 created_at timestamptz not null default now()
);
alter table public.site_admins enable row level security;
alter table public.products enable row level security;
alter table public.partners enable row level security;
alter table public.inquiries enable row level security;
create policy "admins can read own membership" on public.site_admins for select to authenticated using (user_id = (select auth.uid()));
create policy "public read published products" on public.products for select to anon, authenticated using (published = true or exists(select 1 from public.site_admins a where a.user_id = (select auth.uid())));
create policy "admin create products" on public.products for insert to authenticated with check (exists(select 1 from public.site_admins a where a.user_id = (select auth.uid())));
create policy "admin update products" on public.products for update to authenticated using (exists(select 1 from public.site_admins a where a.user_id = (select auth.uid()))) with check (exists(select 1 from public.site_admins a where a.user_id = (select auth.uid())));
create policy "admin delete products" on public.products for delete to authenticated using (exists(select 1 from public.site_admins a where a.user_id = (select auth.uid())));
create policy "public read published partners" on public.partners for select to anon, authenticated using (published = true or exists(select 1 from public.site_admins a where a.user_id = (select auth.uid())));
create policy "admin create partners" on public.partners for insert to authenticated with check (exists(select 1 from public.site_admins a where a.user_id = (select auth.uid())));
create policy "admin update partners" on public.partners for update to authenticated using (exists(select 1 from public.site_admins a where a.user_id = (select auth.uid()))) with check (exists(select 1 from public.site_admins a where a.user_id = (select auth.uid())));
create policy "admin delete partners" on public.partners for delete to authenticated using (exists(select 1 from public.site_admins a where a.user_id = (select auth.uid())));
create policy "admin read inquiries" on public.inquiries for select to authenticated using (exists(select 1 from public.site_admins a where a.user_id = (select auth.uid())));
-- Only grant anonymous inquiry inserts after adding spam/rate-limit protection.
-- After creating an admin in Supabase Auth, assign explicitly in SQL editor:
-- insert into public.site_admins(user_id) values ('YOUR-AUTH-USER-UUID');
