# Verite & Co. Website

A minimal React website for Verite & Co. clothing brand.

## Setup

1. Install dependencies:
```
npm install
```

2. Start development server:
```
npm start
```

3. Build for production:
```
npm run build
```

The website will open at http://localhost:3000

## Features

- Responsive design
- Hero section
- Collections showcase (Gents & Women's Fashion)
- About section
- Contact information with WhatsApp and Facebook links
- Clean, modern UI

## Supabase Cloud Setup (Shared Products Across Devices)

This project now supports cloud sync using Supabase (DB + Storage).

### 1. Environment Variables

Create `.env` from `.env.example`:

```bash
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
REACT_APP_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### 2. SQL: Create `products` table

Run in Supabase SQL editor:

```sql
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('mens', 'ladies')),
  title text not null,
  description text not null,
  price text not null,
  sizes text default '',
  img text not null,
  facebook_link text default '',
  in_stock boolean not null default true,
  is_new boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
```

### 3. Storage bucket for product images

Create bucket in Supabase Storage:

- Bucket name: `product-images`
- Public bucket: `true`

### 4. Quick policies (easy setup)

For quick client-side setup, enable public policies:

```sql
alter table public.products enable row level security;

create policy "public_read_products"
on public.products
for select
using (true);

create policy "public_write_products"
on public.products
for all
using (true)
with check (true);
```

```sql
create policy "public_read_storage"
on storage.objects
for select
using (bucket_id = 'product-images');

create policy "public_write_storage"
on storage.objects
for all
using (bucket_id = 'product-images')
with check (bucket_id = 'product-images');
```

Note: these policies are intentionally open for easy setup. For production-hard security, switch to authenticated policies later.
