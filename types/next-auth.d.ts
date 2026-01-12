import "next-auth";
import type { UserRole } from "./index";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: UserRole;
      isActive: boolean;
      universityId: string | null;
      companyId: string | null;
      customRoleId: string | null;
      customRolePermissions: string[] | null;
    };
  }

  interface User {
    id: string;
    username: string;
    role: UserRole;
    isActive: boolean;
    universityId: string | null;
    companyId: string | null;
    customRoleId: string | null;
    customRolePermissions: string[] | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    username: string;
    isActive: boolean;
    universityId: string | null;
    companyId: string | null;
    customRoleId: string | null;
    customRolePermissions: string[] | null;
  }
}
