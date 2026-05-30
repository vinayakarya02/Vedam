import { getAccessToken } from "@/lib/api-auth";
import { getAdminDashboard } from "@/lib/api";
import { AdminDashboard } from "@/features/admin/admin-dashboard";

export default async function AdminPage() {
  const token = await getAccessToken();
  const data = token
    ? await getAdminDashboard(token)
    : {
        stats: {
          totalEvents: 0,
          activeEvents: 0,
          totalRegistrations: 0,
          attendanceRate: 0,
          whatsappJoinRate: 0,
        },
        registrationsPerDay: [],
        eventPerformance: [],
        attendanceData: [],
      };

  return (
    <AdminDashboard
      stats={data.stats}
      registrationsPerDay={data.registrationsPerDay}
      eventPerformance={data.eventPerformance}
      attendanceData={data.attendanceData}
    />
  );
}
