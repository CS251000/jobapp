import {
  pgTable,
  varchar,
  text,
  integer,
  boolean,
  date,
  timestamp,
  jsonb,
  uuid,
  primaryKey,
  uniqueIndex,
  pgEnum,
  index,
  PgTable,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';



export const userRoleEnum = pgEnum('user_role', ['JobSeeker', 'JobGiver', 'Admin']);
export const jobTypeEnum = pgEnum('job_type', ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Temporary']);
export const jobLocationTypeEnum = pgEnum('job_location_type', ['Onsite', 'Remote', 'Hybrid']);
export const jobPostingStatusEnum = pgEnum('job_posting_status', ['Open', 'Closed', 'Filled', 'Draft', 'Paused']);
export const applicationStatusEnum = pgEnum('application_status', ['Submitted', 'Viewed', 'Under Review', 'Interviewing', 'Offered', 'Hired', 'Rejected', 'Withdrawn']);
export const skillTypeEnum = pgEnum('skill_type', ['Required', 'Preferred']);
export const proficiencyLevelEnum = pgEnum('proficiency_level', ['Beginner', 'Intermediate', 'Advanced', 'Expert']);


export const users = pgTable('users', {
  clerkUserId: varchar('clerk_user_id', { length: 255 }).primaryKey(), 
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: userRoleEnum('role').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});


export const companyProfiles = pgTable('company_profiles', {
  companyId: uuid('company_id').defaultRandom().primaryKey(),
  clerkUserId: varchar('clerk_user_id', { length: 255 }).notNull().references(() => users.clerkUserId, { onDelete: 'cascade' }), 
  companyName: varchar('company_name', { length: 255 }).notNull(),
  contactPerson: varchar('contact_person', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  website: varchar('website', { length: 255 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  zipCode: varchar('zip_code', { length: 20 }),
  companyLogoUrl: text('company_logo_url'),
  aboutCompany: text('about_company'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("clerk_user_index").on(table.clerkUserId)
]

);

export const jobSeekerProfiles = pgTable('job_seeker_profiles', {
  jobSeekerProfileId: uuid('job_seeker_profile_id').defaultRandom().primaryKey(),
  clerkUserId: varchar('clerk_user_id', { length: 255 }).notNull().unique().references(() => users.clerkUserId, { onDelete: 'cascade' }),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  profilePictureUrl: text('profile_picture_url'),
  locationCity: varchar('location_city', { length: 100 }),
  locationState: varchar('location_state', { length: 100 }),
  zipCode:varchar('zip_code', { length: 20 }),
  linkedInProfileUrl: text('linkedin_profile_url'),
  portfolioWebsiteUrl: text('portfolio_website_url'),
  aboutMe: text('about_me'),
  resumeFileUrl: text('resume_file_url'),
  desiredJobTitles: jsonb('desired_job_titles').$type<string[]>(), 
  desiredJobTypes: jsonb('desired_job_types').$type<string[]>().notNull(), 
  preferredJobLocationTypes: jsonb('preferred_job_location_types').$type<string[]>().notNull(),
  willingToRelocate: boolean('willing_to_relocate').default(false),
  expectedSalaryMin: integer('expected_salary_min'),
  expectedSalaryMax: integer('expected_salary_max'),
  availabilityStartDate: date('availability_start_date'),
  totalYearsOfExperience: integer('total_years_of_experience'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('job_seeker_clerk_id').on(table.clerkUserId),
  index('idx_desired_job_types_gin').using('gin',table.desiredJobTitles)
]);

export const skills = pgTable('skills', {
  skillId: uuid('skill_id').defaultRandom().primaryKey(),
  skillName: varchar('skill_name', { length: 100 }).notNull().unique(),
  category: varchar('skill_category', { length: 100 }), 
});

// 7. Job Seeker Skills Table (Join Table)
// Links job seekers to skills, including proficiency and experience.
export const jobSeekerSkills = pgTable('job_seeker_skills', {
  jobSeekerSkillId: uuid('job_seeker_skill_id').defaultRandom().primaryKey(),
  jobSeekerProfileId: uuid('job_seeker_profile_id').notNull().references(() => jobSeekerProfiles.jobSeekerProfileId, { onDelete: 'cascade' }),
  skillId: uuid('skill_id').notNull().references(() => skills.skillId, { onDelete: 'cascade' }),
  isPrimary: boolean('is_primary').default(false),
  yearsOfExperience: integer('years_of_experience_with_skill'),
  proficiencyLevel: proficiencyLevelEnum('proficiency_level'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [

    uniqueIndex('job_seeker_profile_skill_unique_idx').on(table.jobSeekerProfileId, table.skillId),
    index('job_seeker_skills_job_seeker_profile_id_idx').on(table.jobSeekerProfileId),
    index('job_seeker_skills_skill_id_idx').on(table.skillId),

]);

// 8. Job Postings Table
// Stores information about job openings posted by Job Givers.
export const jobPostings = pgTable('job_postings', {
  jobPostingId: uuid('job_posting_id').defaultRandom().primaryKey(),
  companyId: uuid('company_id').notNull().references(() => companyProfiles.companyId, { onDelete: 'cascade' }),
  postedByClerkUserId: varchar('posted_by_clerk_user_id', { length: 255 }).notNull().references(() => users.clerkUserId, { onDelete: 'cascade'}),
  jobTitle: varchar('job_title', { length: 255 }).notNull(),
  jobCategory: varchar('job_category', { length: 100 }),
  jobType: jobTypeEnum('job_type').notNull(),
  jobLocationType: jobLocationTypeEnum('job_location_type').notNull(),
  jobLocationAddress: text('job_location_address'),
  jobLocationCity: varchar('job_location_city', { length: 100 }),
  jobLocationState: varchar('job_location_state', { length: 100 }),
  applicationDeadline: date('application_deadline').notNull(),
  jobDescription: text('job_description'),
  keyResponsibilities: text('key_responsibilities'),
  requiredQualifications: text('required_qualifications'),
  experienceLevelRequired: varchar('experience_level_required', { length: 50 }),
  salaryMin: integer('salary_min'),
  salaryMax: integer('salary_max'),

  howToApply: text('how_to_apply'),
  status: jobPostingStatusEnum('status').default('Draft').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) =>  [
    index('job_postings_company_id_idx').on(table.companyId),
    index('job_postings_posted_by_clerk_user_id_idx').on(table.postedByClerkUserId),
    index('job_postings_status_idx').on(table.status), 
    index('job_postings_job_type_idx').on(table.jobType),
    index('job_postings_job_location_type_idx').on(table.jobLocationType),
]);

// 9. Job Posting Skills Table (Join Table)
// Links job postings to required or preferred skills.
export const jobPostingSkills = pgTable('job_posting_skills', {
  jobPostingSkillId: uuid('job_posting_skill_id').defaultRandom().primaryKey(),
  jobPostingId: uuid('job_posting_id').notNull().references(() => jobPostings.jobPostingId, { onDelete: 'cascade' }),
  skillId: uuid('skill_id').notNull().references(() => skills.skillId, { onDelete: 'cascade' }),
  skillType: skillTypeEnum('skill_type').notNull(), // "Required" or "Preferred"
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    jobPostingSkillTypeUnique: uniqueIndex('job_posting_skill_type_unique_idx').on(table.jobPostingId, table.skillId, table.skillType),
    jobPostingIdIdx: index('job_posting_skills_job_posting_id_idx').on(table.jobPostingId),
    skillIdIdx: index('job_posting_skills_skill_id_idx').on(table.skillId),
  };
});

// 10. Job Applications Table
// Tracks applications made by job seekers to job postings.
export const jobApplications = pgTable('job_applications', {
  jobApplicationId: uuid('job_application_id').defaultRandom().primaryKey(),
  jobPostingId: uuid('job_posting_id').notNull().references(() => jobPostings.jobPostingId, { onDelete: 'cascade' }),
  jobSeekerProfileId: uuid('job_seeker_profile_id').notNull().references(() => jobSeekerProfiles.jobSeekerProfileId, { onDelete: 'cascade' }),
  applicationDate: timestamp('application_date', { withTimezone: true }).defaultNow().notNull(),
  status: applicationStatusEnum('status').default('Submitted').notNull(),
  coverLetterText: text('cover_letter_text'),
  seekerResumeUrlAtApplication: text('seeker_resume_url_at_application'),
  notesBySeeker: text('notes_by_seeker'),
  notesByGiver: text('notes_by_giver'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    uniqueIndex('job_posting_seeker_unique_idx').on(table.jobPostingId, table.jobSeekerProfileId), // Prevents duplicate applications
    index('job_applications_job_posting_id_idx').on(table.jobPostingId),
    index('job_applications_job_seeker_profile_id_idx').on(table.jobSeekerProfileId),
    index('job_applications_status_idx').on(table.status),

]);


// --- Relations ---
// Defining relations helps Drizzle ORM understand how tables are connected,
// making it easier to write queries that join data.

export const usersRelations = relations(users, ({ one, many }) => ({
  companyProfile: one(companyProfiles, { // A user (JobGiver) might have one company profile
    fields: [users.clerkUserId],
    references: [companyProfiles.clerkUserId],
  }),
  jobSeekerProfile: one(jobSeekerProfiles, { // A user (JobSeeker) has one job seeker profile
    fields: [users.clerkUserId],
    references: [jobSeekerProfiles.clerkUserId],
  }),
  jobPostingsAuthored: many(jobPostings), // A user (JobGiver) can author many job postings
}));

export const companyProfilesRelations = relations(companyProfiles, ({ one, many }) => ({
  user: one(users, { // The user who owns this company profile
    fields: [companyProfiles.clerkUserId],
    references: [users.clerkUserId],
  }),
  jobPostings: many(jobPostings), // A company can have many job postings
}));

export const jobSeekerProfilesRelations = relations(jobSeekerProfiles, ({ one, many }) => ({
  user: one(users, { // The user associated with this seeker profile
    fields: [jobSeekerProfiles.clerkUserId],
    references: [users.clerkUserId],
  }),
  jobApplications: many(jobApplications),
}));



export const skillsRelations = relations(skills, ({ many }) => ({
  jobPostingSkills: many(jobPostingSkills),
}));


export const jobPostingsRelations = relations(jobPostings, ({ one, many }) => ({
  companyProfile: one(companyProfiles, {
    fields: [jobPostings.companyId],
    references: [companyProfiles.companyId],
  }),
  author: one(users, { // The user who posted this job
    fields: [jobPostings.postedByClerkUserId],
    references: [users.clerkUserId],
  }),
  jobPostingSkills: many(jobPostingSkills),
  jobApplications: many(jobApplications),
}));

export const jobPostingSkillsRelations = relations(jobPostingSkills, ({ one }) => ({
  jobPosting: one(jobPostings, {
    fields: [jobPostingSkills.jobPostingId],
    references: [jobPostings.jobPostingId],
  }),
  skill: one(skills, {
    fields: [jobPostingSkills.skillId],
    references: [skills.skillId],
  }),
}));

export const jobApplicationsRelations = relations(jobApplications, ({ one }) => ({
  jobPosting: one(jobPostings, {
    fields: [jobApplications.jobPostingId],
    references: [jobPostings.jobPostingId],
  }),
  jobSeekerProfile: one(jobSeekerProfiles, {
    fields: [jobApplications.jobSeekerProfileId],
    references: [jobSeekerProfiles.jobSeekerProfileId],
  }),
}));
