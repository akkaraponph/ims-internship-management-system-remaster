/**
 * Seed users script
 * 
 * Creates demo users from SEED_USERS environment variable
 * Run: bun run seed:users
 * 
 * The script is idempotent - safe to run multiple times
 */

import { db } from "../lib/db";
import { users, students, directors, universities } from "../lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

interface SeedUser {
  username: string;
  password: string;
  role: "admin" | "director" | "student" | "super-admin";
  universityCode?: string;
  // Director fields
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  // Student fields
  idCard?: string;
  program?: string;
  department?: string;
  [key: string]: any; // Allow additional fields
}

async function seedUsers() {
  try {
    console.log("Starting user seed...");

    const seedUsersEnv = process.env.SEED_USERS;
    if (!seedUsersEnv) {
      console.log("No SEED_USERS found in environment variables. Skipping seed.");
      return;
    }

    let seedUsers: SeedUser[];
    try {
      seedUsers = JSON.parse(seedUsersEnv);
    } catch (error) {
      console.error("Failed to parse SEED_USERS JSON:", error);
      return;
    }

    if (!Array.isArray(seedUsers)) {
      console.error("SEED_USERS must be a JSON array");
      return;
    }

    if (seedUsers.length === 0) {
      console.log("No users to seed.");
      return;
    }

    console.log(`Found ${seedUsers.length} user(s) to seed`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const seedUser of seedUsers) {
      try {
        // Validate required fields
        if (!seedUser.username || !seedUser.password || !seedUser.role) {
          console.error(`Skipping user: missing required fields (username, password, role)`);
          errors++;
          continue;
        }

        // Check if user already exists
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.username, seedUser.username))
          .limit(1);

        if (existingUser.length > 0) {
          console.log(`⏭️  Skipping ${seedUser.username} - already exists`);
          skipped++;
          continue;
        }

        // Resolve university
        let universityId: string | null = null;
        if (seedUser.role !== "super-admin") {
          const universityCode = seedUser.universityCode || "DEFAULT";
          const university = await db
            .select()
            .from(universities)
            .where(eq(universities.code, universityCode))
            .limit(1);

          if (university.length === 0) {
            console.warn(`⚠️  Warning: University with code "${universityCode}" not found for user ${seedUser.username}. Skipping.`);
            errors++;
            continue;
          }

          universityId = university[0].id;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(seedUser.password, 10);

        // Create user
        const [newUser] = await db
          .insert(users)
          .values({
            username: seedUser.username,
            password: hashedPassword,
            role: seedUser.role,
            universityId,
            isActive: true,
          })
          .returning();

        console.log(`✅ Created user: ${seedUser.username} (${seedUser.role})`);
        created++;

        // Create director record if role is director
        if (seedUser.role === "director" && universityId) {
          try {
            await db
              .insert(directors)
              .values({
                userId: newUser.id,
                universityId,
                firstName: seedUser.firstName || "Director",
                lastName: seedUser.lastName || "User",
                email: seedUser.email || null,
                phone: seedUser.phone || null,
              })
              .returning();
            console.log(`   └─ Created director record for ${seedUser.username}`);
          } catch (error: any) {
            console.warn(`   ⚠️  Warning: Failed to create director record: ${error.message}`);
          }
        }

        // Create student record if role is student
        if (seedUser.role === "student" && universityId) {
          // Validate required student fields
          if (!seedUser.email || !seedUser.idCard || !seedUser.firstName || !seedUser.lastName) {
            console.warn(`   ⚠️  Warning: Missing required student fields (email, idCard, firstName, lastName) for ${seedUser.username}. Skipping student record.`);
          } else {
            try {
              // Check if email or idCard already exists
              const existingByEmail = await db
                .select()
                .from(students)
                .where(eq(students.email, seedUser.email))
                .limit(1);
              
              const existingByIdCard = await db
                .select()
                .from(students)
                .where(eq(students.idCard, seedUser.idCard))
                .limit(1);
              
              const existingStudent = existingByEmail.length > 0 ? existingByEmail : existingByIdCard;

              if (existingStudent.length === 0) {
                await db
                  .insert(students)
                  .values({
                    userId: newUser.id,
                    universityId,
                    email: seedUser.email,
                    idCard: seedUser.idCard,
                    firstName: seedUser.firstName,
                    lastName: seedUser.lastName,
                    phone: seedUser.phone || null,
                    program: seedUser.program || null,
                    department: seedUser.department || null,
                  })
                  .returning();
                console.log(`   └─ Created student record for ${seedUser.username}`);
              } else {
                console.warn(`   ⚠️  Warning: Student with email ${seedUser.email} or idCard ${seedUser.idCard} already exists. Skipping student record.`);
              }
            } catch (error: any) {
              console.warn(`   ⚠️  Warning: Failed to create student record: ${error.message}`);
            }
          }
        }
      } catch (error: any) {
        console.error(`❌ Error creating user ${seedUser.username}:`, error.message);
        errors++;
      }
    }

    console.log("\n📊 Seed Summary:");
    console.log(`   Created: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Errors: ${errors}`);
    console.log("\n✅ User seed completed!");
  } catch (error) {
    console.error("Seed script failed:", error);
    throw error;
  }
}

// Run seed
seedUsers()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed script error:", error);
    process.exit(1);
  });
