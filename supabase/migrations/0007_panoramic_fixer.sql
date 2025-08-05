ALTER TABLE "company_profiles" ADD COLUMN "size_of_organization" varchar(100);--> statement-breakpoint
ALTER TABLE "job_postings" ADD COLUMN "vacancies" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "job_postings" ADD COLUMN "min_age" integer;--> statement-breakpoint
ALTER TABLE "job_postings" ADD COLUMN "max_age" integer;--> statement-breakpoint
ALTER TABLE "job_postings" ADD COLUMN "languages" jsonb;--> statement-breakpoint
ALTER TABLE "job_postings" ADD COLUMN "job_timing_start_time" varchar(50);--> statement-breakpoint
ALTER TABLE "job_postings" ADD COLUMN "job_timing_end_time" varchar(50);--> statement-breakpoint
ALTER TABLE "job_postings" ADD COLUMN "job_timing_days" jsonb;