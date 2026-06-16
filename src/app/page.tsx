import { getDashboardData } from "@/lib/data";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { SetupBanner } from "@/components/setup-banner";

export default async function HomePage() {
  const { metrics, entriesByMetric, isDemo, error } = await getDashboardData();

  return (
    <>
      {isDemo && <SetupBanner error={error} />}
      <DashboardView metrics={metrics} entriesByMetric={entriesByMetric} />
    </>
  );
}
