import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import { users, students, directors, roles } from "./db/schema";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import type { UserRole } from "@/types";

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await db
          .select()
          .from(users)
          .where(eq(users.username, credentials.username))
          .limit(1);

        if (user.length === 0) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user[0].password
        );

        if (!isValidPassword) {
          return null;
        }

        if (!user[0].isActive) {
          return null;
        }

        // Get universityId based on user role
        let universityId: string | null = null;
        
        if (user[0].role === "super-admin") {
          // Super-admin has no university
          universityId = null;
        } else if (user[0].role === "student") {
          // Get university from students table
          const student = await db
            .select({ universityId: students.universityId })
            .from(students)
            .where(eq(students.userId, user[0].id))
            .limit(1);
          if (student.length > 0) {
            universityId = student[0].universityId;
          }
        } else if (user[0].role === "director") {
          // Get university from directors table
          const director = await db
            .select({ universityId: directors.universityId })
            .from(directors)
            .where(eq(directors.userId, user[0].id))
            .limit(1);
          if (director.length > 0) {
            universityId = director[0].universityId;
          }
        } else if (user[0].role === "admin") {
          // Admin uses universityId from users table
          universityId = user[0].universityId || null;
        }

        // Get custom role and permissions if exists
        let customRolePermissions: string[] | null = null;
        if (user[0].customRoleId) {
          const customRole = await db
            .select()
            .from(roles)
            .where(eq(roles.id, user[0].customRoleId))
            .limit(1);
          
          if (customRole.length > 0) {
            customRolePermissions = customRole[0].permissions || [];
          }
        }

        return {
          id: user[0].id,
          username: user[0].username,
          role: user[0].role as UserRole,
          isActive: user[0].isActive,
          universityId: universityId,
          customRoleId: user[0].customRoleId || null,
          customRolePermissions: customRolePermissions,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.isActive = user.isActive;
        token.universityId = (user as any).universityId || null;
        token.customRoleId = (user as any).customRoleId || null;
        token.customRolePermissions = (user as any).customRolePermissions || null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.username = token.username as string;
        session.user.isActive = token.isActive as boolean;
        session.user.universityId = (token.universityId as string) || null;
        session.user.customRoleId = (token.customRoleId as string) || null;
        session.user.customRolePermissions = (token.customRolePermissions as string[]) || null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// Export config for backward compatibility with getServerSession
export const authOptions = authConfig;
