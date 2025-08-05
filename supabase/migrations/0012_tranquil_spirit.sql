ALTER TABLE "job_postings" DROP CONSTRAINT "job_postings_job_category_id_categories_category_id_fk";
--> statement-breakpoint
ALTER TABLE "job_postings" ALTER COLUMN "job_category_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "job_postings" ALTER COLUMN "job_category_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_job_category_id_categories_category_id_fk" FOREIGN KEY ("job_category_id") REFERENCES "public"."categories"("category_id") ON DELETE cascade ON UPDATE no action;