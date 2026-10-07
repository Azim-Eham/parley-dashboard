create table public.companies (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  industry text,
  website text,
  size text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  job_title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type public.deal_stage as enum ('discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost');

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  name text not null,
  value numeric(12,2) not null default 0,
  stage public.deal_stage not null default 'discovery',
  expected_close_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type public.activity_type as enum ('call', 'email', 'meeting', 'task');
create type public.activity_status as enum ('pending', 'completed');

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete cascade,
  type public.activity_type not null default 'task',
  description text not null,
  due_date timestamptz,
  status public.activity_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index companies_ws_idx on public.companies (workspace_id);
create index contacts_ws_idx on public.contacts (workspace_id);
create index deals_ws_idx on public.deals (workspace_id);
create index activities_ws_idx on public.activities (workspace_id);

alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.deals enable row level security;
alter table public.activities enable row level security;

revoke all on public.companies, public.contacts, public.deals, public.activities from anon;

create policy "manage own companies" on public.companies
  for all to authenticated using (exists (
    select 1 from public.workspace_members m
    where m.workspace_id = companies.workspace_id and m.user_id = (select auth.uid())));
    
create policy "manage own contacts" on public.contacts
  for all to authenticated using (exists (
    select 1 from public.workspace_members m
    where m.workspace_id = contacts.workspace_id and m.user_id = (select auth.uid())));

create policy "manage own deals" on public.deals
  for all to authenticated using (exists (
    select 1 from public.workspace_members m
    where m.workspace_id = deals.workspace_id and m.user_id = (select auth.uid())));

create policy "manage own activities" on public.activities
  for all to authenticated using (exists (
    select 1 from public.workspace_members m
    where m.workspace_id = activities.workspace_id and m.user_id = (select auth.uid())));

-- Update leads to allow all operations, not just select
drop policy if exists "read own leads" on public.leads;
create policy "manage own leads" on public.leads
  for all to authenticated using (exists (
    select 1 from public.workspace_members m
    where m.workspace_id = leads.workspace_id and m.user_id = (select auth.uid())));
