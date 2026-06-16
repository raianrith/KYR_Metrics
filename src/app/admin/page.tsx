import { AdminPanel } from "@/components/admin/admin-panel";
import { SetupBanner } from "@/components/setup-banner";
import { getDashboardData } from "@/lib/data";

export default async function AdminPage() {
  const { metrics, entriesByMetric, isDemo, error } = await getDashboardData();

  return (
    <>
      {isDemo && <SetupBanner error={error} />}
      <AdminPanel metrics={metrics} entriesByMetric={entriesByMetric} />
    </>
  );
}
