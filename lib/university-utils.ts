import { auth } from "./auth";
import { db } from "./db";
import { universities } from "./db/schema";
import { eq } from "drizzle-orm";

export async function getUserUniversity() {
  const session = await auth();
  if (!session?.user?.universityId) {
    return null;
  }

  const university = await db
    .select()
    .from(universities)
    .where(eq(universities.id, session.user.universityId))
    .limit(1);

  return university.length > 0 ? university[0] : null;
}

export async function requireUniversity() {
  const university = await getUserUniversity();
  if (!university) {
    throw new Error("University context required");
  }
  return university;
}

export async function canAccessUniversity(universityId: string | null): Promise<boolean> {
  const session = await auth();
  
  // Super-admin can access all universities
  if (session?.user?.role === "super-admin") {
    return true;
  }

  // Users can only access their own university
  return session?.user?.universityId === universityId;
}
