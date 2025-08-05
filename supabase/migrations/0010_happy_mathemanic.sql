ALTER TABLE "desired_job_roles" RENAME COLUMN "job_role_category" TO "category_id";--> statement-breakpoint
ALTER TABLE "desired_job_roles" DROP CONSTRAINT "desired_job_roles_job_role_category_categories_category_id_fk";
--> statement-breakpoint
ALTER TABLE "desired_job_roles" ADD CONSTRAINT "desired_job_roles_category_id_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("category_id") ON DELETE cascade ON UPDATE no action;