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
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "director", "student"]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull(),
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

// Internships table
export const internships = pgTable("internships", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").references(() => students.id),
  companyId: uuid("company_id").references(() => companies.id),
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
  studentId: uuid("student_id").references(() => students.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  student: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  director: one(directors, {
    fields: [users.id],
    references: [directors.userId],
  }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
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
}));

export const directorsRelations = relations(directors, ({ one }) => ({
  user: one(users, {
    fields: [directors.userId],
    references: [users.id],
  }),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  address: one(addresses, {
    fields: [companies.addressId],
    references: [addresses.id],
  }),
  internships: many(internships),
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
  coInternships: many(coInternships),
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
}));
