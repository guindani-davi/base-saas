
  create table "public"."referesh_tokens" (
    "id" uuid not null,
    "user_id" uuid not null,
    "token_hash" text not null,
    "expires_at" timestamp without time zone not null,
    "revoked_at" timestamp without time zone,
    "created_at" timestamp without time zone not null
      );


alter table "public"."referesh_tokens" enable row level security;

CREATE UNIQUE INDEX referesh_tokens_pkey ON public.referesh_tokens USING btree (id);

CREATE UNIQUE INDEX referesh_tokens_token_hash_key ON public.referesh_tokens USING btree (token_hash);

alter table "public"."referesh_tokens" add constraint "referesh_tokens_pkey" PRIMARY KEY using index "referesh_tokens_pkey";

alter table "public"."referesh_tokens" add constraint "referesh_tokens_token_hash_key" UNIQUE using index "referesh_tokens_token_hash_key";

alter table "public"."referesh_tokens" add constraint "referesh_tokens_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) not valid;

alter table "public"."referesh_tokens" validate constraint "referesh_tokens_user_id_fkey";

grant delete on table "public"."referesh_tokens" to "anon";

grant insert on table "public"."referesh_tokens" to "anon";

grant references on table "public"."referesh_tokens" to "anon";

grant select on table "public"."referesh_tokens" to "anon";

grant trigger on table "public"."referesh_tokens" to "anon";

grant truncate on table "public"."referesh_tokens" to "anon";

grant update on table "public"."referesh_tokens" to "anon";

grant delete on table "public"."referesh_tokens" to "authenticated";

grant insert on table "public"."referesh_tokens" to "authenticated";

grant references on table "public"."referesh_tokens" to "authenticated";

grant select on table "public"."referesh_tokens" to "authenticated";

grant trigger on table "public"."referesh_tokens" to "authenticated";

grant truncate on table "public"."referesh_tokens" to "authenticated";

grant update on table "public"."referesh_tokens" to "authenticated";

grant delete on table "public"."referesh_tokens" to "service_role";

grant insert on table "public"."referesh_tokens" to "service_role";

grant references on table "public"."referesh_tokens" to "service_role";

grant select on table "public"."referesh_tokens" to "service_role";

grant trigger on table "public"."referesh_tokens" to "service_role";

grant truncate on table "public"."referesh_tokens" to "service_role";

grant update on table "public"."referesh_tokens" to "service_role";


