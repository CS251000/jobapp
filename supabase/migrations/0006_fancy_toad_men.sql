CREATE TABLE "categories" (
	"category_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_name" varchar(100) NOT NULL,
	CONSTRAINT "categories_category_name_unique" UNIQUE("category_name")
);
--> statement-breakpoint
CREATE TABLE "job_posting_categories" (
	"job_posting_category_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_posting_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_seeker_categories" (
	"job_seeker_category_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_seeker_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_postings" ALTER COLUMN "status" SET DEFAULT 'Open';--> statement-breakpoint
ALTER TABLE "job_posting_categories" ADD CONSTRAINT "job_posting_categories_job_posting_id_job_postings_job_posting_id_fk" FOREIGN KEY ("job_posting_id") REFERENCES "public"."job_postings"("job_posting_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posting_categories" ADD CONSTRAINT "job_posting_categories_category_id_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("category_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_seeker_categories" ADD CONSTRAINT "job_seeker_categories_job_seeker_id_job_seeker_profiles_job_seeker_profile_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker_profiles"("job_seeker_profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_seeker_categories" ADD CONSTRAINT "job_seeker_categories_category_id_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("category_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "job_posting_categories_category_idx" ON "job_posting_categories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "job_posting_categories_posting_idx" ON "job_posting_categories" USING btree ("job_posting_id");--> statement-breakpoint
CREATE INDEX "idx_jobseeker_categories_category" ON "job_seeker_categories" USING btree ("category_id");