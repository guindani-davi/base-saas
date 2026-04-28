create table public.memberships (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  organization_id uuid not null,
  roles role[] not null default '{}'::role[],
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone null,
  created_by uuid not null,
  updated_by uuid null,
  is_active boolean not null default true,
  constraint memberships_pkey primary key (id),
  constraint memberships_user_id_organization_id_key unique (user_id, organization_id),
  constraint memberships_created_by_fkey foreign KEY (created_by) references users (id),
  constraint memberships_organization_id_fkey foreign KEY (organization_id) references organizations (id) on delete RESTRICT,
  constraint memberships_updated_by_fkey foreign KEY (updated_by) references users (id),
  constraint memberships_user_id_fkey foreign KEY (user_id) references users (id) on delete RESTRICT
) TABLESPACE pg_default;

create index IF not exists idx_memberships_organization_id on public.memberships using btree (organization_id) TABLESPACE pg_default;

create index IF not exists idx_memberships_user_id on public.memberships using btree (user_id) TABLESPACE pg_default;