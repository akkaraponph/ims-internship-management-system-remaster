import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { DirectorDashboard } from "@/components/dashboard/DirectorDashboard";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { role } = session.user;

  if (role === "admin") {
    return <AdminDashboard />;
  }

  if (role === "director") {
    return <DirectorDashboard />;
  }

  return <StudentDashboard />;
}
