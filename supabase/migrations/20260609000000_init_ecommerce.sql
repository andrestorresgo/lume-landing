-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- Create tables
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  price numeric not null check (price >= 0),
  tag text,
  stone text not null,
  intention text not null,
  is_featured boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.users (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  display_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts on delete cascade,
  product_id uuid not null references public.products on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_cart_product unique (cart_id, product_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users on delete cascade,
  status text not null default 'pending',
  total_amount numeric not null check (total_amount >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders on delete cascade,
  product_id uuid not null references public.products on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  price numeric not null check (price >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.products enable row level security;
alter table public.users enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Policies for products
create policy "Allow public read access to products" on public.products
  for select using (true);

-- Policies for users (profiles)
create policy "Allow users to read their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Allow users to update their own profile" on public.users
  for update using (auth.uid() = id);

-- Policies for carts
create policy "Allow users to read their own cart" on public.carts
  for select using (auth.uid() = user_id);

create policy "Allow users to insert their own cart" on public.carts
  for insert with check (auth.uid() = user_id);

create policy "Allow users to update their own cart" on public.carts
  for update using (auth.uid() = user_id);

create policy "Allow users to delete their own cart" on public.carts
  for delete using (auth.uid() = user_id);

-- Policies for cart_items
create policy "Allow users to read their own cart items" on public.cart_items
  for select using (
    exists (
      select 1 from public.carts c
      where c.id = cart_id and c.user_id = auth.uid()
    )
  );

create policy "Allow users to insert their own cart items" on public.cart_items
  for insert with check (
    exists (
      select 1 from public.carts c
      where c.id = cart_id and c.user_id = auth.uid()
    )
  );

create policy "Allow users to update their own cart items" on public.cart_items
  for update using (
    exists (
      select 1 from public.carts c
      where c.id = cart_id and c.user_id = auth.uid()
    )
  );

create policy "Allow users to delete their own cart items" on public.cart_items
  for delete using (
    exists (
      select 1 from public.carts c
      where c.id = cart_id and c.user_id = auth.uid()
    )
  );

-- Policies for orders
create policy "Allow users to read their own orders" on public.orders
  for select using (auth.uid() = user_id);

create policy "Allow users to insert their own orders" on public.orders
  for insert with check (auth.uid() = user_id);

-- Policies for order_items
create policy "Allow users to read their own order items" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "Allow users to insert their own order items" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

-- Trigger to create public.users on auth.users insert
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Seed products
insert into public.products (id, name, description, price, tag, stone, intention, is_featured)
values
  ('11111111-1111-1111-1111-111111111111', 'Claridad Absoluta', 'Cuarzo Claro & Plata 925', 120, 'Más Vendido', 'Cuarzo Claro', 'Claridad', false),
  ('22222222-2222-2222-2222-222222222222', 'Escudo Natural', 'Ojo de Tigre & Oro 14k', 95, null, 'Ojo de Tigre', 'Protección', false),
  ('33333333-3333-3333-3333-333333333333', 'Fuerza Terrestre', 'Roca Volcánica & Ónix', 145, 'Nuevo', 'Roca Volcánica', 'Fuerza', false),
  ('44444444-4444-4444-4444-444444444444', 'Colección "Equilibrio"', 'Set de tres piezas diseñadas para usarse en conjunto. Cuarzo, Ágata y Roca Volcánica.', 250, null, 'Ágata', 'Equilibrio', true),
  ('55555555-5555-5555-5555-555555555555', 'Centro Calmo', 'Ágata Blanca & Plata', 85, null, 'Ágata', 'Calma', false);
