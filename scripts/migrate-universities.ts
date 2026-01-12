/**
 * Migration script to add universities and migrate existing data
 * 
 * Run this script after pushing the schema changes:
 * bun run scripts/migrate-universities.ts
 */

import { db } from "../lib/db";
import { universities, users, students, directors, companies } from "../lib/db/schema";
import { eq } from "drizzle-orm";
import { generateInviteCode } from "../lib/utils/invite-code";

async function migrate() {
  try {
    console.log("Starting university migration...");

    // 1. Create default university if it doesn't exist
    console.log("Creating default university...");
    let defaultUniversity = await db
      .select()
      .from(universities)
      .where(eq(universities.code, "DEFAULT"))
      .limit(1);

    if (defaultUniversity.length === 0) {
      let inviteCode = generateInviteCode();
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;

      while (!isUnique && attempts < maxAttempts) {
        const existing = await db
          .select()
          .from(universities)
          .where(eq(universities.inviteCode, inviteCode))
          .limit(1);
        
        if (existing.length === 0) {
          isUnique = true;
        } else {
          inviteCode = generateInviteCode();
          attempts++;
        }
      }

      const [newUniversity] = await db
        .insert(universities)
        .values({
          name: "มหาวิทยาลัยเริ่มต้น",
          code: "DEFAULT",
          inviteCode,
          isActive: true,
        })
        .returning();

      defaultUniversity = [newUniversity];
      console.log(`Created default university with ID: ${newUniversity.id}`);
    } else {
      console.log(`Default university already exists: ${defaultUniversity[0].id}`);
    }

    const defaultUniId = defaultUniversity[0].id;

    // 2. Update users without universityId (except super-admin)
    console.log("Updating users without universityId...");
    const allUsers = await db.select().from(users);
    const usersWithoutUni = allUsers.filter(u => !u.universityId);

    for (const user of usersWithoutUni) {
      // Don't assign university to super-admin
      if (user.role !== "super-admin") {
        await db
          .update(users)
          .set({ universityId: defaultUniId })
          .where(eq(users.id, user.id));
        console.log(`Updated user ${user.id} with university`);
      }
    }

    // 3. Update students without universityId
    console.log("Updating students without universityId...");
    const allStudents = await db.select().from(students);
    const studentsWithoutUni = allStudents.filter(s => !s.universityId);

    for (const student of studentsWithoutUni) {
      // Try to get university from user
      if (student.userId) {
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, student.userId))
          .limit(1);
        
        if (user.length > 0 && user[0].universityId) {
          await db
            .update(students)
            .set({ universityId: user[0].universityId })
            .where(eq(students.id, student.id));
          console.log(`Updated student ${student.id} with university from user`);
        } else {
          await db
            .update(students)
            .set({ universityId: defaultUniId })
            .where(eq(students.id, student.id));
          console.log(`Updated student ${student.id} with default university`);
        }
      } else {
        await db
          .update(students)
          .set({ universityId: defaultUniId })
          .where(eq(students.id, student.id));
        console.log(`Updated student ${student.id} with default university`);
      }
    }

    // 4. Update directors without universityId
    console.log("Updating directors without universityId...");
    const allDirectors = await db.select().from(directors);
    const directorsWithoutUni = allDirectors.filter(d => !d.universityId);

    for (const director of directorsWithoutUni) {
      // Try to get university from user
      if (director.userId) {
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, director.userId))
          .limit(1);
        
        if (user.length > 0 && user[0].universityId) {
          await db
            .update(directors)
            .set({ universityId: user[0].universityId })
            .where(eq(directors.id, director.id));
          console.log(`Updated director ${director.id} with university from user`);
        } else {
          await db
            .update(directors)
            .set({ universityId: defaultUniId })
            .where(eq(directors.id, director.id));
          console.log(`Updated director ${director.id} with default university`);
        }
      } else {
        await db
          .update(directors)
          .set({ universityId: defaultUniId })
          .where(eq(directors.id, director.id));
        console.log(`Updated director ${director.id} with default university`);
      }
    }

    // 5. Update companies without universityId
    console.log("Updating companies without universityId...");
    const allCompanies = await db.select().from(companies);
    const companiesWithoutUni = allCompanies.filter(c => !c.universityId);

    for (const company of companiesWithoutUni) {
      await db
        .update(companies)
        .set({ universityId: defaultUniId })
        .where(eq(companies.id, company.id));
      console.log(`Updated company ${company.id} with default university`);
    }

    // 6. Generate invite codes for universities without them
    console.log("Generating invite codes for universities...");
    const allUnis = await db.select().from(universities);
    const unisWithoutCode = allUnis.filter(u => !u.inviteCode);

    for (const uni of unisWithoutCode) {
      let inviteCode = generateInviteCode();
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;

      while (!isUnique && attempts < maxAttempts) {
        const existing = await db
          .select()
          .from(universities)
          .where(eq(universities.inviteCode, inviteCode))
          .limit(1);
        
        if (existing.length === 0) {
          isUnique = true;
        } else {
          inviteCode = generateInviteCode();
          attempts++;
        }
      }

      await db
        .update(universities)
        .set({ inviteCode })
        .where(eq(universities.id, uni.id));
      console.log(`Generated invite code for university ${uni.id}`);
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run migration
migrate()
  .then(() => {
    console.log("Migration script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration script error:", error);
    process.exit(1);
  });
