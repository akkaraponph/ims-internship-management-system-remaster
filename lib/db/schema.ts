import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  integer,
  decimal,
  uuid,
  pgEnum,
  jsonb,
  bigint,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "director", "student", "super-admin", "company"]);
export const announcementTypeEnum = pgEnum("announcement_type", ["info", "warning", "success", "error"]);
export const announcementPriorityEnum = pgEnum("announcement_priority", ["low", "medium", "high"]);
export const notificationTypeEnum = pgEnum("notification_type", ["system", "internship", "student", "company", "announcement"]);
export const backupTypeEnum = pgEnum("backup_type", ["full", "partial"]);

// Universities table
export const universities = pgTable("universities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  inviteCode: varchar("invite_code", { length: 20 }).notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull(),
  universityId: uuid("university_id").references(() => universities.id),
  customRoleId: uuid("custom_role_id").references(() => roles.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Provinces table
export const provinces = pgTable("provinces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Districts table
export const districts = pgTable("districts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  provinceId: uuid("province_id").references(() => provinces.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sub-districts table
export const subDistricts = pgTable("sub_districts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  districtId: uuid("district_id").references(() => districts.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Addresses table
export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  addressLine: text("address_line"),
  provinceId: uuid("province_id").references(() => provinces.id),
  districtId: uuid("district_id").references(() => districts.id),
  subDistrictId: uuid("sub_district_id").references(() => subDistricts.id),
  postalCode: varchar("postal_code", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Students table
export const students = pgTable("students", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).unique(),
  universityId: uuid("university_id").references(() => universities.id).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  idCard: varchar("id_card", { length: 20 }).notNull().unique(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  program: varchar("program", { length: 255 }),
  department: varchar("department", { length: 255 }),
  skill: text("skill"),
  interest: text("interest"),
  projectTopic: text("project_topic"),
  dateOfBirth: timestamp("date_of_birth"),
  experience: text("experience"),
  religion: varchar("religion", { length: 100 }),
  fatherName: varchar("father_name", { length: 255 }),
  fatherJob: varchar("father_job", { length: 255 }),
  motherName: varchar("mother_name", { length: 255 }),
  motherJob: varchar("mother_job", { length: 255 }),
  presentGpa: decimal("present_gpa", { precision: 3, scale: 2 }),
  image: text("image"),
  resumeStatus: boolean("resume_status").default(false),
  isCoInternship: boolean("is_cointernship").default(false),
  presentAddressId: uuid("present_address_id").references(() => addresses.id),
  permanentAddressId: uuid("permanent_address_id").references(() => addresses.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Directors table
export const directors = pgTable("directors", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).unique(),
  universityId: uuid("university_id").references(() => universities.id).notNull(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Companies table
export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  universityId: uuid("university_id").references(() => universities.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }),
  activities: text("activities"),
  proposeTo: varchar("propose_to", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  addressId: uuid("address_id").references(() => addresses.id),
  contactPersonName: varchar("contact_person_name", { length: 255 }),
  contactPersonPosition: varchar("contact_person_position", { length: 255 }),
  contactPersonPhone: varchar("contact_person_phone", { length: 20 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Job Positions table
export const jobPositions = pgTable("job_positions", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  requirements: text("requirements"),
  location: varchar("location", { length: 255 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  maxApplicants: integer("max_applicants"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Company Users table
export const companyUsers = pgTable("company_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).unique().notNull(),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  position: varchar("position", { length: 255 }),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Internships table
export const internships = pgTable("internships", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").references(() => students.id),
  companyId: uuid("company_id").references(() => companies.id),
  jobPositionId: uuid("job_position_id").references(() => jobPositions.id),
  isSend: varchar("is_send", { length: 50 }),
  isConfirm: varchar("is_confirm", { length: 50 }),
  status: varchar("status", { length: 50 }).default("pending"), // pending, approved, rejected
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Co-internships table (for students doing internships together)
export const coInternships = pgTable("co_internships", {
  id: uuid("id").primaryKey().defaultRandom(),
  internshipId: uuid("internship_id").references(() => internships.id).notNull(),
  studentId: uuid("student_id").references(() => students.id), // Optional - may not be registered
  firstName: varchar("first_name", { length: 255 }), // For non-registered students
  lastName: varchar("last_name", { length: 255 }), // For non-registered students
  studentIdString: varchar("student_id_string", { length: 50 }), // Student ID as string for non-registered
  phone: varchar("phone", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Educations table (education history for students)
export const educations = pgTable("educations", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").references(() => students.id).notNull(),
  level: varchar("level", { length: 255 }), // e.g., "มัธยมศึกษาตอนต้น", "มัธยมศึกษาตอนปลาย", "ปริญญาตรี"
  academy: varchar("academy", { length: 255 }), // School/University name
  gpa: decimal("gpa", { precision: 4, scale: 2 }), // GPA for this level
  order: integer("order").default(1), // Order of education (1, 2, 3)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Contact Persons table (emergency contact for students)
export const contactPersons = pgTable("contact_persons", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").references(() => students.id).notNull().unique(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  relationship: varchar("relationship", { length: 100 }), // e.g., "ผู้ปกครอง", "พ่อ", "แม่"
  phone: varchar("phone", { length: 20 }),
  addressId: uuid("address_id").references(() => addresses.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const universitiesRelations = relations(universities, ({ many }) => ({
  users: many(users),
  students: many(students),
  directors: many(directors),
  companies: many(companies),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  university: one(universities, {
    fields: [users.universityId],
    references: [universities.id],
  }),
  student: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  director: one(directors, {
    fields: [users.id],
    references: [directors.userId],
  }),
  companyUser: one(companyUsers, {
    fields: [users.id],
    references: [companyUsers.userId],
  }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  university: one(universities, {
    fields: [students.universityId],
    references: [universities.id],
  }),
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  presentAddress: one(addresses, {
    fields: [students.presentAddressId],
    references: [addresses.id],
  }),
  permanentAddress: one(addresses, {
    fields: [students.permanentAddressId],
    references: [addresses.id],
  }),
  internships: many(internships),
  coInternships: many(coInternships),
  educations: many(educations),
  contactPerson: one(contactPersons, {
    fields: [students.id],
    references: [contactPersons.studentId],
  }),
}));

export const directorsRelations = relations(directors, ({ one }) => ({
  university: one(universities, {
    fields: [directors.universityId],
    references: [universities.id],
  }),
  user: one(users, {
    fields: [directors.userId],
    references: [users.id],
  }),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  university: one(universities, {
    fields: [companies.universityId],
    references: [universities.id],
  }),
  address: one(addresses, {
    fields: [companies.addressId],
    references: [addresses.id],
  }),
  internships: many(internships),
  jobPositions: many(jobPositions),
  companyUsers: many(companyUsers),
}));

export const internshipsRelations = relations(internships, ({ one, many }) => ({
  student: one(students, {
    fields: [internships.studentId],
    references: [students.id],
  }),
  company: one(companies, {
    fields: [internships.companyId],
    references: [companies.id],
  }),
  jobPosition: one(jobPositions, {
    fields: [internships.jobPositionId],
    references: [jobPositions.id],
  }),
  coInternships: many(coInternships),
}));

export const jobPositionsRelations = relations(jobPositions, ({ one, many }) => ({
  company: one(companies, {
    fields: [jobPositions.companyId],
    references: [companies.id],
  }),
  internships: many(internships),
}));

export const companyUsersRelations = relations(companyUsers, ({ one }) => ({
  user: one(users, {
    fields: [companyUsers.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [companyUsers.companyId],
    references: [companies.id],
  }),
}));

export const coInternshipsRelations = relations(coInternships, ({ one }) => ({
  internship: one(internships, {
    fields: [coInternships.internshipId],
    references: [internships.id],
  }),
  student: one(students, {
    fields: [coInternships.studentId],
    references: [students.id],
  }),
}));

export const educationsRelations = relations(educations, ({ one }) => ({
  student: one(students, {
    fields: [educations.studentId],
    references: [students.id],
  }),
}));

export const contactPersonsRelations = relations(contactPersons, ({ one }) => ({
  student: one(students, {
    fields: [contactPersons.studentId],
    references: [students.id],
  }),
  address: one(addresses, {
    fields: [contactPersons.addressId],
    references: [addresses.id],
  }),
}));

export const provincesRelations = relations(provinces, ({ many }) => ({
  districts: many(districts),
}));

export const districtsRelations = relations(districts, ({ one, many }) => ({
  province: one(provinces, {
    fields: [districts.provinceId],
    references: [provinces.id],
  }),
  subDistricts: many(subDistricts),
}));

export const subDistrictsRelations = relations(subDistricts, ({ one }) => ({
  district: one(districts, {
    fields: [subDistricts.districtId],
    references: [districts.id],
  }),
}));

export const addressesRelations = relations(addresses, ({ one, many }) => ({
  province: one(provinces, {
    fields: [addresses.provinceId],
    references: [provinces.id],
  }),
  district: one(districts, {
    fields: [addresses.districtId],
    references: [districts.id],
  }),
  subDistrict: one(subDistricts, {
    fields: [addresses.subDistrictId],
    references: [subDistricts.id],
  }),
  students: many(students),
  companies: many(companies),
  contactPersons: many(contactPersons),
}));

// Email Templates table
export const emailTemplates = pgTable("email_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  subject: varchar("subject", { length: 500 }).notNull(),
  body: text("body").notNull(),
  variables: jsonb("variables").$type<string[]>().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Email Settings table
export const emailSettings = pgTable("email_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  host: varchar("host", { length: 255 }).notNull(),
  port: integer("port").notNull(),
  secure: boolean("secure").notNull().default(false),
  username: varchar("username", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  fromEmail: varchar("from_email", { length: 255 }).notNull(),
  fromName: varchar("from_name", { length: 255 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Announcements table
export const announcements = pgTable("announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: announcementTypeEnum("type").notNull().default("info"),
  priority: announcementPriorityEnum("priority").notNull().default("medium"),
  isActive: boolean("is_active").notNull().default(true),
  targetRoles: jsonb("target_roles").$type<string[]>().default([]),
  targetUniversities: jsonb("target_universities").$type<string[] | null>(),
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

// Announcement Reads table
export const announcementReads = pgTable("announcement_reads", {
  id: uuid("id").primaryKey().defaultRandom(),
  announcementId: uuid("announcement_id").references(() => announcements.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  readAt: timestamp("read_at").defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  type: notificationTypeEnum("type").notNull().default("system"),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  link: varchar("link", { length: 500 }),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notification Settings table
export const notificationSettings = pgTable("notification_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull().unique(),
  emailEnabled: boolean("email_enabled").notNull().default(true),
  pushEnabled: boolean("push_enabled").notNull().default(false),
  inAppEnabled: boolean("in_app_enabled").notNull().default(true),
  types: jsonb("types").$type<Record<string, { email: boolean; push: boolean; inApp: boolean }>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Roles table
export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  permissions: jsonb("permissions").$type<string[]>().default([]),
  isSystemRole: boolean("is_system_role").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Role Permissions table (for future granular permissions)
export const rolePermissions = pgTable("role_permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  roleId: uuid("role_id").references(() => roles.id).notNull(),
  permission: varchar("permission", { length: 100 }).notNull(),
  resource: varchar("resource", { length: 100 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Backups table
export const backups = pgTable("backups", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: varchar("filename", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  fileSize: bigint("file_size", { mode: "number" }).notNull(),
  type: backupTypeEnum("type").notNull().default("full"),
  tables: jsonb("tables").$type<string[]>(),
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

// Relations for new tables
export const usersCustomRoleRelation = relations(users, ({ one }) => ({
  customRole: one(roles, {
    fields: [users.customRoleId],
    references: [roles.id],
  }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
  permissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
}));

export const announcementsRelations = relations(announcements, ({ one, many }) => ({
  creator: one(users, {
    fields: [announcements.createdBy],
    references: [users.id],
  }),
  reads: many(announcementReads),
}));

export const announcementReadsRelations = relations(announcementReads, ({ one }) => ({
  announcement: one(announcements, {
    fields: [announcementReads.announcementId],
    references: [announcements.id],
  }),
  user: one(users, {
    fields: [announcementReads.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const notificationSettingsRelations = relations(notificationSettings, ({ one }) => ({
  user: one(users, {
    fields: [notificationSettings.userId],
    references: [users.id],
  }),
}));

export const backupsRelations = relations(backups, ({ one }) => ({
  creator: one(users, {
    fields: [backups.createdBy],
    references: [users.id],
  }),
}));
