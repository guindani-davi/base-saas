
  create table "public"."refresh_tokens" (
    "id" uuid not null,
    "user_id" uuid not null,
    "hashed_token" text not null,
    "expires_at" timestamp with time zone not null,
    "revoked_at" timestamp with time zone,
    "created_at" timestamp with time zone not null
      );


alter table "public"."refresh_tokens" enable row level security;

CREATE UNIQUE INDEX refresh_tokens_pkey ON public.refresh_tokens USING btree (id);

CREATE UNIQUE INDEX refresh_tokens_hashed_token_key ON public.refresh_tokens USING btree (hashed_token);

alter table "public"."refresh_tokens" add constraint "refresh_tokens_pkey" PRIMARY KEY using index "refresh_tokens_pkey";

alter table "public"."refresh_tokens" add constraint "refresh_tokens_hashed_token_key" UNIQUE using index "refresh_tokens_hashed_token_key";

alter table "public"."refresh_tokens" add constraint "refresh_tokens_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) not valid;

alter table "public"."refresh_tokens" validate constraint "refresh_tokens_user_id_fkey";

grant delete on table "public"."refresh_tokens" to "anon";

grant insert on table "public"."refresh_tokens" to "anon";

grant references on table "public"."refresh_tokens" to "anon";

grant select on table "public"."refresh_tokens" to "anon";

grant trigger on table "public"."refresh_tokens" to "anon";

grant truncate on table "public"."refresh_tokens" to "anon";

grant update on table "public"."refresh_tokens" to "anon";

grant delete on table "public"."refresh_tokens" to "authenticated";

grant insert on table "public"."refresh_tokens" to "authenticated";

grant references on table "public"."refresh_tokens" to "authenticated";

grant select on table "public"."refresh_tokens" to "authenticated";

grant trigger on table "public"."refresh_tokens" to "authenticated";

grant truncate on table "public"."refresh_tokens" to "authenticated";

grant update on table "public"."refresh_tokens" to "authenticated";

grant delete on table "public"."refresh_tokens" to "service_role";

grant insert on table "public"."refresh_tokens" to "service_role";

grant references on table "public"."refresh_tokens" to "service_role";

grant select on table "public"."refresh_tokens" to "service_role";

grant trigger on table "public"."refresh_tokens" to "service_role";

grant truncate on table "public"."refresh_tokens" to "service_role";

grant update on table "public"."refresh_tokens" to "service_role";


