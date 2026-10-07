create type public.lead_status as enum
  ('new', 'contacted', 'responded', 'booked', 'not_interested');

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (workspace_id, user_id)
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  full_name text not null,
  email text,
  company text,
  job_title text,
  source text not null,
  status public.lead_status not null default 'new',
  created_at timestamptz not null default now(),
  contacted_at timestamptz,
  responded_at timestamptz,
  last_message_preview text,
  search_text text generated always as (
    lower(full_name || ' ' || coalesce(company, '') || ' ' || coalesce(email, ''))
  ) stored,
  constraint leads_timeline_ok check (
    (contacted_at is null or contacted_at >= created_at)
    and (responded_at is null or (contacted_at is not null and responded_at >= contacted_at))
  )
);

create index leads_ws_created_idx on public.leads (workspace_id, created_at desc);
create index leads_ws_status_idx  on public.leads (workspace_id, status);

alter table public.workspaces        enable row level security;
alter table public.workspace_members enable row level security;
alter table public.leads             enable row level security;

revoke all on public.workspaces, public.workspace_members, public.leads from anon;

create policy "read own memberships" on public.workspace_members
  for select to authenticated using (user_id = (select auth.uid()));

create policy "read own workspace" on public.workspaces
  for select to authenticated using (exists (
    select 1 from public.workspace_members m
    where m.workspace_id = workspaces.id and m.user_id = (select auth.uid())));

create policy "read own leads" on public.leads
  for select to authenticated using (exists (
    select 1 from public.workspace_members m
    where m.workspace_id = leads.workspace_id and m.user_id = (select auth.uid())));

create function public.lead_funnel(
  p_workspace uuid, p_from timestamptz, p_to timestamptz, p_sources text[] default null)
returns table (total bigint, contacted bigint, responded bigint, booked bigint)
language sql stable security invoker set search_path = ''
as $$
  select count(*), count(contacted_at), count(responded_at),
         count(*) filter (where status = 'booked')
  from public.leads
  where workspace_id = p_workspace
    and created_at >= p_from and created_at < p_to
    and (p_sources is null or source = any (p_sources));
$$;
