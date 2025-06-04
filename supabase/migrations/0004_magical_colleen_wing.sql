ALTER TABLE "job_postings" ADD COLUMN "zip_code" varchar;--> statement-breakpoint
ALTER TABLE "company_profiles" ADD CONSTRAINT "company_profiles_clerk_user_id_unique" UNIQUE("clerk_user_id");