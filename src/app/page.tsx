import { getDashboardData } from "@/lib/data";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { SetupBanner } from "@/components/setup-banner";

export default async function HomePage() {
  const { metrics, entriesByMetric, periodTargetsByMetric, isDemo, error } = await getDashboardData();

  return (
    <>
      {isDemo && <SetupBanner error={error} />}
      {!isDemo && error && <SetupBanner error={error} isDemo={false} />}
      <DashboardView
        metrics={metrics}
        entriesByMetric={entriesByMetric}
        periodTargetsByMetric={periodTargetsByMetric}
      />
    </>
  );
}
