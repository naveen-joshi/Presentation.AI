-- Presentation.AI core schema
-- profiles, decks, deck_collaborators, share_links, templates, yjs_updates + RLS

-- ── Helpers ─────────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- Auto-create a profile row when an auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end $$;

-- Access helpers used by RLS policies. All are `security definer` so the
-- policies can read related tables without recursing through their RLS.
create or replace function public.deck_owner_id(p_deck uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select owner_id from public.decks where id = p_deck;
$$;

create or replace function public.is_deck_owner(p_deck uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.decks where id = p_deck and owner_id = auth.uid()
  );
$$;

create or replace function public.deck_role(p_deck uuid)
returns text language sql stable security definer set search_path = public as $$
  select role from public.deck_collaborators
  where deck_id = p_deck and user_id = auth.uid();
$$;

create or replace function public.can_read_deck(p_deck uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.decks
    where id = p_deck
      and (
        owner_id = auth.uid()
        or visibility in ('public', 'unlisted')
        or exists (
          select 1 from public.deck_collaborators
          where deck_id = p_deck and user_id = auth.uid()
        )
      )
  );
$$;

create or replace function public.can_edit_deck(p_deck uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.decks
    where id = p_deck and owner_id = auth.uid()
  )
  or exists (
    select 1 from public.deck_collaborators
    where deck_id = p_deck and user_id = auth.uid() and role = 'editor'
  );
$$;

-- ── Tables ──────────────────────────────────────────────────────────────────

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.decks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null default 'Untitled deck',
  slug text unique,
  markdown text not null default '',
  theme text not null default 'nord',
  size text not null default 'm',
  head_font text,
  body_font text,
  template text not null default 'classic',
  transition text not null default 'slide',
  visibility text not null default 'private'
    check (visibility in ('private', 'unlisted', 'public')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index decks_owner_idx on public.decks (owner_id, updated_at desc);
create index decks_slug_idx on public.decks (slug) where slug is not null;

create table public.deck_collaborators (
  deck_id uuid not null references public.decks (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'viewer'
    check (role in ('editor', 'commenter', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (deck_id, user_id)
);

create table public.share_links (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.decks (id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  role text not null default 'viewer'
    check (role in ('editor', 'commenter', 'viewer')),
  expires_at timestamptz,
  revoked boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  description text not null default '',
  markdown text not null default '',
  theme text not null default 'nord',
  size text not null default 'm',
  head_font text,
  body_font text,
  template text not null default 'classic',
  transition text not null default 'slide',
  visibility text not null default 'private'
    check (visibility in ('private', 'public')),
  tags text[] not null default '{}',
  preview_image text,
  usage_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index templates_visibility_idx on public.templates (visibility);

-- Append-only log of Yjs document updates used by the collaboration sync
-- provider (packages/sync). A deck's document is rebuilt by applying its
-- updates in order; rows are compacted into snapshots periodically.
create table public.yjs_updates (
  id bigint generated always as identity primary key,
  deck_id uuid not null references public.decks (id) on delete cascade,
  update bytea not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index yjs_updates_deck_idx on public.yjs_updates (deck_id, id);

-- ── Triggers ────────────────────────────────────────────────────────────────

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger decks_set_updated_at
  before update on public.decks
  for each row execute function public.set_updated_at();

create trigger templates_set_updated_at
  before update on public.templates
  for each row execute function public.set_updated_at();

-- ── Row Level Security ──────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.decks enable row level security;
alter table public.deck_collaborators enable row level security;
alter table public.share_links enable row level security;
alter table public.templates enable row level security;
alter table public.yjs_updates enable row level security;

-- profiles: every signed-in user can read basic profile info (needed to show
-- collaborator names); each user manages their own row.
create policy "profiles are readable by signed-in users"
  on public.profiles for select to authenticated
  using (true);

create policy "users insert their own profile"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

create policy "users update their own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- decks: owner has full access; collaborators follow their role; public and
-- unlisted decks are readable by any signed-in user (unlisted access is
-- effectively by knowing the id; share links for anonymous viewers are
-- resolved server-side with the service role).
create policy "decks readable by owner, collaborators, or visibility"
  on public.decks for select to authenticated
  using (public.can_read_deck(id));

create policy "users create their own decks"
  on public.decks for insert to authenticated
  with check (owner_id = auth.uid());

create policy "decks updatable by owner or editors"
  on public.decks for update to authenticated
  using (public.can_edit_deck(id)) with check (public.can_edit_deck(id));

create policy "decks deletable by owner"
  on public.decks for delete to authenticated
  using (public.is_deck_owner(id));

-- deck_collaborators: only the deck owner manages the list; collaborators can
-- read their own membership (so the UI can derive their role).
create policy "collaborators readable by owner or self"
  on public.deck_collaborators for select to authenticated
  using (public.is_deck_owner(deck_id) or user_id = auth.uid());

create policy "owner inserts collaborators"
  on public.deck_collaborators for insert to authenticated
  with check (public.is_deck_owner(deck_id) and user_id <> auth.uid());

create policy "owner updates collaborators"
  on public.deck_collaborators for update to authenticated
  using (public.is_deck_owner(deck_id)) with check (public.is_deck_owner(deck_id));

create policy "owner deletes collaborators"
  on public.deck_collaborators for delete to authenticated
  using (public.is_deck_owner(deck_id));

-- share_links: only the deck owner manages links. The public share page
-- resolves tokens server-side with the service role.
create policy "share links readable by deck owner"
  on public.share_links for select to authenticated
  using (public.is_deck_owner(deck_id));

create policy "owner creates share links"
  on public.share_links for insert to authenticated
  with check (public.is_deck_owner(deck_id));

create policy "owner updates share links"
  on public.share_links for update to authenticated
  using (public.is_deck_owner(deck_id)) with check (public.is_deck_owner(deck_id));

create policy "owner deletes share links"
  on public.share_links for delete to authenticated
  using (public.is_deck_owner(deck_id));

-- templates: owner has full access; public templates are browsable by anyone
-- (including anonymous visitors of the public gallery).
create policy "public templates readable by everyone"
  on public.templates for select to anon, authenticated
  using (visibility = 'public');

create policy "private templates readable by owner"
  on public.templates for select to authenticated
  using (owner_id = auth.uid());

create policy "users create their own templates"
  on public.templates for insert to authenticated
  with check (owner_id = auth.uid());

create policy "templates updatable by owner"
  on public.templates for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "templates deletable by owner"
  on public.templates for delete to authenticated
  using (owner_id = auth.uid());

-- yjs_updates: readable and writable only by users who can edit the deck.
create policy "updates readable by editors"
  on public.yjs_updates for select to authenticated
  using (public.can_edit_deck(deck_id));

create policy "updates insertable by editors"
  on public.yjs_updates for insert to authenticated
  with check (public.can_edit_deck(deck_id) and created_by = auth.uid());
