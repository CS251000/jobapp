CREATE TYPE "public"."application_status" AS ENUM('Submitted', 'Viewed', 'Under Review', 'Interviewing', 'Offered', 'Hired', 'Rejected', 'Withdrawn');--> statement-breakpoint
CREATE TYPE "public"."job_location_type" AS ENUM('Onsite', 'Remote', 'Hybrid');--> statement-breakpoint
CREATE TYPE "public"."job_posting_status" AS ENUM('Open', 'Closed', 'Filled', 'Draft', 'Paused');--> statement-breakpoint
CREATE TYPE "public"."job_type" AS ENUM('Full-Time', 'Part-Time', 'Contract', 'Internship', 'Temporary');--> statement-breakpoint
CREATE TYPE "public"."proficiency_level" AS ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert');--> statement-breakpoint
CREATE TYPE "public"."skill_type" AS ENUM('Required', 'Preferred');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('JobSeeker', 'JobGiver', 'Admin');--> statement-breakpoint
CREATE TABLE "company_profiles" (
	"company_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" varchar(255) NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"contact_person" varchar(255),
	"phone" varchar(50),
	"website" varchar(255),
	"address" text,
	"city" varchar(100),
	"state" varchar(100),
	"zip_code" varchar(20),
	"company_logo_url" text,
	"about_company" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_applications" (
	"job_application_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_posting_id" uuid NOT NULL,
	"job_seeker_profile_id" uuid NOT NULL,
	"application_date" timestamp with time zone DEFAULT now() NOT NULL,
	"status" "application_status" DEFAULT 'Submitted' NOT NULL,
	"cover_letter_text" text,
	"seeker_resume_url_at_application" text,
	"notes_by_seeker" text,
	"notes_by_giver" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_posting_skills" (
	"job_posting_skill_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_posting_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"skill_type" "skill_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_postings" (
	"job_posting_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"posted_by_clerk_user_id" varchar(255) NOT NULL,
	"job_title" varchar(255) NOT NULL,
	"job_category" varchar(100),
	"job_type" "job_type" NOT NULL,
	"job_location_type" "job_location_type" NOT NULL,
	"job_location_address" text,
	"job_location_city" varchar(100),
	"job_location_state" varchar(100),
	"application_deadline" date NOT NULL,
	"job_description" text,
	"key_responsibilities" text,
	"required_qualifications" text,
	"experience_level_required" varchar(50),
	"salary_min" integer,
	"salary_max" integer,
	"how_to_apply" text,
	"status" "job_posting_status" DEFAULT 'Draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_seeker_profiles" (
	"job_seeker_profile_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" varchar(255) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"phone" varchar(50),
	"profile_picture_url" text,
	"location_city" varchar(100),
	"location_state" varchar(100),
	"zip_code" varchar(20),
	"linkedin_profile_url" text,
	"portfolio_website_url" text,
	"professional_headline" varchar(255),
	"about_me" text,
	"resume_file_url" text,
	"desired_job_titles" jsonb,
	"desired_job_types" jsonb NOT NULL,
	"preferred_job_location_types" jsonb NOT NULL,
	"willing_to_relocate" boolean DEFAULT false,
	"expected_salary_min" integer,
	"expected_salary_max" integer,
	"availability_start_date" date,
	"total_years_of_experience" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "job_seeker_profiles_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
--> statement-breakpoint
CREATE TABLE "job_seeker_skills" (
	"job_seeker_skill_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_seeker_profile_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT false,
	"years_of_experience_with_skill" integer,
	"proficiency_level" "proficiency_level",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"skill_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"skill_name" varchar(100) NOT NULL,
	"skill_category" varchar(100),
	CONSTRAINT "skills_skill_name_unique" UNIQUE("skill_name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"clerk_user_id" varchar(255) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "user_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "company_profiles" ADD CONSTRAINT "company_profiles_clerk_user_id_users_clerk_user_id_fk" FOREIGN KEY ("clerk_user_id") REFERENCES "public"."users"("clerk_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_posting_id_job_postings_job_posting_id_fk" FOREIGN KEY ("job_posting_id") REFERENCES "public"."job_postings"("job_posting_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_seeker_profile_id_job_seeker_profiles_job_seeker_profile_id_fk" FOREIGN KEY ("job_seeker_profile_id") REFERENCES "public"."job_seeker_profiles"("job_seeker_profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posting_skills" ADD CONSTRAINT "job_posting_skills_job_posting_id_job_postings_job_posting_id_fk" FOREIGN KEY ("job_posting_id") REFERENCES "public"."job_postings"("job_posting_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posting_skills" ADD CONSTRAINT "job_posting_skills_skill_id_skills_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("skill_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_company_id_company_profiles_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company_profiles"("company_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_posted_by_clerk_user_id_users_clerk_user_id_fk" FOREIGN KEY ("posted_by_clerk_user_id") REFERENCES "public"."users"("clerk_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_seeker_profiles" ADD CONSTRAINT "job_seeker_profiles_clerk_user_id_users_clerk_user_id_fk" FOREIGN KEY ("clerk_user_id") REFERENCES "public"."users"("clerk_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_seeker_skills" ADD CONSTRAINT "job_seeker_skills_job_seeker_profile_id_job_seeker_profiles_job_seeker_profile_id_fk" FOREIGN KEY ("job_seeker_profile_id") REFERENCES "public"."job_seeker_profiles"("job_seeker_profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_seeker_skills" ADD CONSTRAINT "job_seeker_skills_skill_id_skills_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("skill_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "clerk_user_index" ON "company_profiles" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "job_posting_seeker_unique_idx" ON "job_applications" USING btree ("job_posting_id","job_seeker_profile_id");--> statement-breakpoint
CREATE INDEX "job_applications_job_posting_id_idx" ON "job_applications" USING btree ("job_posting_id");--> statement-breakpoint
CREATE INDEX "job_applications_job_seeker_profile_id_idx" ON "job_applications" USING btree ("job_seeker_profile_id");--> statement-breakpoint
CREATE INDEX "job_applications_status_idx" ON "job_applications" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "job_posting_skill_type_unique_idx" ON "job_posting_skills" USING btree ("job_posting_id","skill_id","skill_type");--> statement-breakpoint
CREATE INDEX "job_posting_skills_job_posting_id_idx" ON "job_posting_skills" USING btree ("job_posting_id");--> statement-breakpoint
CREATE INDEX "job_posting_skills_skill_id_idx" ON "job_posting_skills" USING btree ("skill_id");--> statement-breakpoint
CREATE INDEX "job_postings_company_id_idx" ON "job_postings" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "job_postings_posted_by_clerk_user_id_idx" ON "job_postings" USING btree ("posted_by_clerk_user_id");--> statement-breakpoint
CREATE INDEX "job_postings_status_idx" ON "job_postings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "job_postings_job_type_idx" ON "job_postings" USING btree ("job_type");--> statement-breakpoint
CREATE INDEX "job_postings_job_location_type_idx" ON "job_postings" USING btree ("job_location_type");--> statement-breakpoint
CREATE INDEX "job_seeker_clerk_id" ON "job_seeker_profiles" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "idx_desired_job_types_gin" ON "job_seeker_profiles" USING gin ("desired_job_titles");--> statement-breakpoint
CREATE UNIQUE INDEX "job_seeker_profile_skill_unique_idx" ON "job_seeker_skills" USING btree ("job_seeker_profile_id","skill_id");--> statement-breakpoint
CREATE INDEX "job_seeker_skills_job_seeker_profile_id_idx" ON "job_seeker_skills" USING btree ("job_seeker_profile_id");--> statement-breakpoint
CREATE INDEX "job_seeker_skills_skill_id_idx" ON "job_seeker_skills" USING btree ("skill_id");