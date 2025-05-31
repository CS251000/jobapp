CREATE TABLE "desired_job_roles" (
	"desired_job_role_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_name" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "desired_job_roles_role_name_unique" UNIQUE("role_name")
);
--> statement-breakpoint
CREATE TABLE "job_seeker_desired_job_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_seeker_profile_id" uuid NOT NULL,
	"desired_job_role_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_seeker_desired_job_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_seeker_profile_id" uuid NOT NULL,
	"job_type" "job_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_seeker_preferred_job_location_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_seeker_profile_id" uuid NOT NULL,
	"job_location_type" "job_location_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "job_seeker_clerk_id";--> statement-breakpoint
DROP INDEX "idx_desired_job_types_gin";--> statement-breakpoint
ALTER TABLE "job_seeker_profiles" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "job_seeker_desired_job_roles" ADD CONSTRAINT "job_seeker_desired_job_roles_job_seeker_profile_id_job_seeker_profiles_job_seeker_profile_id_fk" FOREIGN KEY ("job_seeker_profile_id") REFERENCES "public"."job_seeker_profiles"("job_seeker_profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_seeker_desired_job_roles" ADD CONSTRAINT "job_seeker_desired_job_roles_desired_job_role_id_desired_job_roles_desired_job_role_id_fk" FOREIGN KEY ("desired_job_role_id") REFERENCES "public"."desired_job_roles"("desired_job_role_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_seeker_desired_job_types" ADD CONSTRAINT "job_seeker_desired_job_types_job_seeker_profile_id_job_seeker_profiles_job_seeker_profile_id_fk" FOREIGN KEY ("job_seeker_profile_id") REFERENCES "public"."job_seeker_profiles"("job_seeker_profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_seeker_preferred_job_location_types" ADD CONSTRAINT "job_seeker_preferred_job_location_types_job_seeker_profile_id_job_seeker_profiles_job_seeker_profile_id_fk" FOREIGN KEY ("job_seeker_profile_id") REFERENCES "public"."job_seeker_profiles"("job_seeker_profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "job_seeker_role_unique_idx" ON "job_seeker_desired_job_roles" USING btree ("job_seeker_profile_id","desired_job_role_id");--> statement-breakpoint
CREATE INDEX "js_djr_profile_idx" ON "job_seeker_desired_job_roles" USING btree ("job_seeker_profile_id");--> statement-breakpoint
CREATE INDEX "js_djr_role_idx" ON "job_seeker_desired_job_roles" USING btree ("desired_job_role_id");--> statement-breakpoint
CREATE UNIQUE INDEX "js_desired_job_type_unique_idx" ON "job_seeker_desired_job_types" USING btree ("job_seeker_profile_id","job_type");--> statement-breakpoint
CREATE INDEX "js_desired_job_types_profile_idx" ON "job_seeker_desired_job_types" USING btree ("job_seeker_profile_id");--> statement-breakpoint
CREATE INDEX "js_desired_job_types_type_idx" ON "job_seeker_desired_job_types" USING btree ("job_type");--> statement-breakpoint
CREATE UNIQUE INDEX "js_pref_loc_type_unique_idx" ON "job_seeker_preferred_job_location_types" USING btree ("job_seeker_profile_id","job_location_type");--> statement-breakpoint
CREATE INDEX "js_pref_loc_types_profile_idx" ON "job_seeker_preferred_job_location_types" USING btree ("job_seeker_profile_id");--> statement-breakpoint
CREATE INDEX "js_pref_loc_types_type_idx" ON "job_seeker_preferred_job_location_types" USING btree ("job_location_type");--> statement-breakpoint
CREATE INDEX "job_seeker_clerk_id_idx" ON "job_seeker_profiles" USING btree ("clerk_user_id");--> statement-breakpoint
ALTER TABLE "job_seeker_profiles" DROP COLUMN "desired_job_titles";--> statement-breakpoint
ALTER TABLE "job_seeker_profiles" DROP COLUMN "desired_job_types";--> statement-breakpoint
ALTER TABLE "job_seeker_profiles" DROP COLUMN "preferred_job_location_types";