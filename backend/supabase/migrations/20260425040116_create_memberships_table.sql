create type "public"."role" as enum ('admin', 'editor', 'viewer');


  create table "public"."memberships" (
    "id" uuid not null,
    "user_id" uuid not null,
    "organization_id" uuid not null,
    "role" public.role not null,
    "is_active" boolean not null,
    "created_by" uuid not null,
    "updated_by" uuid,
    "created_at" timestamp without time zone not null,
    "updated_at" timestamp without time zone
      );


alter table "public"."memberships" enable row level security;

CREATE UNIQUE INDEX memberships_pkey ON public.memberships USING btree (id, user_id, organization_id);

alter table "public"."memberships" add constraint "memberships_pkey" PRIMARY KEY using index "memberships_pkey";

alter table "public"."memberships" add constraint "memberships_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.users(id) not valid;

alter table "public"."memberships" validate constraint "memberships_created_by_fkey";

alter table "public"."memberships" add constraint "memberships_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) not valid;

alter table "public"."memberships" validate constraint "memberships_organization_id_fkey";

alter table "public"."memberships" add constraint "memberships_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public.users(id) not valid;

alter table "public"."memberships" validate constraint "memberships_updated_by_fkey";

alter table "public"."memberships" add constraint "memberships_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) not valid;

alter table "public"."memberships" validate constraint "memberships_user_id_fkey";

grant delete on table "public"."memberships" to "anon";

grant insert on table "public"."memberships" to "anon";

grant references on table "public"."memberships" to "anon";

grant select on table "public"."memberships" to "anon";

grant trigger on table "public"."memberships" to "anon";

grant truncate on table "public"."memberships" to "anon";

grant update on table "public"."memberships" to "anon";

grant delete on table "public"."memberships" to "authenticated";

grant insert on table "public"."memberships" to "authenticated";

grant references on table "public"."memberships" to "authenticated";

grant select on table "public"."memberships" to "authenticated";

grant trigger on table "public"."memberships" to "authenticated";

grant truncate on table "public"."memberships" to "authenticated";

grant update on table "public"."memberships" to "authenticated";

grant delete on table "public"."memberships" to "service_role";

grant insert on table "public"."memberships" to "service_role";

grant references on table "public"."memberships" to "service_role";

grant select on table "public"."memberships" to "service_role";

grant trigger on table "public"."memberships" to "service_role";

grant truncate on table "public"."memberships" to "service_role";

grant update on table "public"."memberships" to "service_role";


