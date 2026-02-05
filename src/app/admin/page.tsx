import {
  getAdmin,
  getDashboardKPIs,
  getEmployeePerformance,
  getPendingFollowUps,
  getUpcomingSlots,
} from "@/app/actions/admin";
import { getAllEmployeesSummary } from "@/app/actions/admin";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";
import { redirect } from "next/navigation";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const admin = await getAdmin();
  if (!admin) redirect("/login");

  const params = await searchParams;
  // Use local timezone for today's date
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const selectedDate = params.date || today;

  const kpis = await getDashboardKPIs(selectedDate);
  const employeePerformance = await getEmployeePerformance(selectedDate);
  const allEmployees = await getAllEmployeesSummary();
  const pendingFollowUps = await getPendingFollowUps();
  const upcomingSlots = await getUpcomingSlots();

  return (
    <AdminDashboardClient
      admin={{
        id: admin.id,
        name: admin.name,
        email: admin.email,
      }}
      selectedDate={selectedDate}
      kpis={kpis}
      employeePerformance={employeePerformance}
      allEmployees={allEmployees}
      pendingFollowUps={pendingFollowUps}
      upcomingSlots={upcomingSlots}
    />
  );
}
