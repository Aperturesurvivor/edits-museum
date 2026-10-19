-- Edits Museum schema for Supabase (Postgres). Run in the SQL editor of a fresh project.
-- Media is never stored here: thumb/video_* are X CDN URLs streamed by the browser.

create table if not exists public.edits (
  id           text primary key,          -- X post id
  url          text not null,
  author       text not null,
  author_name  text not null default '',
  caption      text not null default '',  -- screening/genre tagging only; never rendered
  created_at   text,
  likes        integer not null default 0,
  bookmarks    integer not null default 0,
  views        bigint  not null default 0,
  video_views  bigint  not null default 0,
  duration_s   real,
  media_type   text,
  thumb        text,
  width        integer,
  height       integer,
  video_hi     text,
  video_lo     text,
  genre        text,
  wing         text not null default 'unsorted',   -- primary wing (max weight) from visual review
  wings        text[] not null default '{}',       -- every wing listed in (primary + weight >= 0.5)
  weights      jsonb not null default '{}'::jsonb, -- 0-1 per wing from visual review
  review       jsonb,                              -- verdict, confidence, reason, models
  live         boolean not null default false,     -- passed visual review (or approved by Josiah)
  subject      text not null default '',
  status       text not null default 'unscreened'
               check (status in ('unscreened','flagged_review','flagged_medium','hand_kept','approved_by_josiah','approved')),
  source       text not null default '',
  score        real not null default 0,   -- computed by the importer (src/lib/ranking.ts)
  imported_at  timestamptz not null default now()
);
create index if not exists edits_score_idx on public.edits (score desc);
create index if not exists edits_wing_score_idx on public.edits (wing, score desc);
create index if not exists edits_wings_idx on public.edits using gin (wings);

create or replace view public.wing_counts as
  select w as wing, count(*)::int as n from public.edits, unnest(wings) as w where live group by w;

create or replace view public.live_count as
  select count(*)::int as n from public.edits where live;

create table if not exists public.submissions (
  id           text primary key,          -- X post id
  author       text not null,
  url          text not null,
  wing         text,
  status       text not null default 'pending' check (status in ('pending','approved','rejected')),
  submitted_at timestamptz not null default now()
);

-- RLS: the public (anon) key can read edits; everything else goes through the service role on the server.
alter table public.edits enable row level security;
alter table public.submissions enable row level security;
drop policy if exists "edits are public" on public.edits;
create policy "edits are public" on public.edits for select using (live);
-- No anon policies on submissions: inserts/reads happen server-side with the service role key.
