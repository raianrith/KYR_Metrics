import type { EntryStatus, MetricEntry } from "./types";
import { catalogSortOrder } from "./metrics-catalog";

const id = (n: number) =>
  `00000000-0000-0000-0000-${String(n).padStart(12, "0")}`;
const eid = (n: number) =>
  `10000000-0000-0000-0000-${String(n).padStart(12, "0")}`;

function M(
  team: string,
  role: string,
  metric: string,
  employee?: string | null
): number {
  const sort = catalogSortOrder(team, role, metric, employee);
  if (!sort) throw new Error(`Missing catalog metric: ${team} / ${role} / ${metric}`);
  return sort;
}

let counter = 1;

function row(
  metricId: number,
  start: string,
  end: string,
  actual: number,
  target: number | null,
  status: EntryStatus
): MetricEntry {
  return {
    id: eid(counter++),
    metric_id: id(metricId),
    period_start: start,
    period_end: end,
    actual_value: actual,
    target_value: target,
    status,
    notes: "Sample seed data",
    entered_by: "System",
    created_at: end,
    updated_at: end,
  };
}

function monthly(
  metricId: number,
  year: number,
  months: { m: number; actual: number; target?: number | null; status: EntryStatus }[]
) {
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return months.map(({ m, actual, target = null, status }) => {
    const mm = String(m).padStart(2, "0");
    const end = `${year}-${mm}-${days[m - 1]}`;
    return row(metricId, `${year}-${mm}-01`, end, actual, target, status);
  });
}

function quarterly(
  metricId: number,
  year: number,
  q: number,
  actual: number,
  status: EntryStatus,
  target: number | null = null
) {
  const starts = ["01-01", "04-01", "07-01", "10-01"];
  const ends = ["03-31", "06-30", "09-30", "12-31"];
  return row(
    metricId,
    `${year}-${starts[q - 1]}`,
    `${year}-${ends[q - 1]}`,
    actual,
    target,
    status
  );
}

export function generateDemoEntries(): MetricEntry[] {
  counter = 1;
  const entries: MetricEntry[] = [];
  const year = 2026;

  const overhead = M("Administration", "VP Admin", "Overhead", "Michelle");
  const csatVp = M(
    "Business Development",
    "VP Sales/Client Services",
    "CSAT",
    "Nicole"
  );
  const csatStrategist = M("Client Services", "Strategist", "CSAT", "Reid");
  const closeRate = M("Business Development", "Dir Biz Dev", "Close rate", "Frank");
  const projectSuccess = M(
    "Client Services",
    "HubSpot Consultant",
    "Project success",
    "Brian L"
  );
  const leads = M("Marketing Solutions", "Dir Marketing", "Leads", "Kelly");
  const rework = M("Creative Services", "Creative Director", "Rework", null);
  const utilization = M("Web Dev", "Web Developer", "Utilization", "Robert");
  const reporting = M("Administration", "VP Admin", "Reporting accuracy", "Michelle");
  const freeCashFlow = M("Pinnacle", "President & Visionary", "Free Cash Flow", "Greg");
  const esop = M("Pinnacle", "President & Visionary", "ESOP Share Value", "Greg");
  const agi = M("Business Development", "VP Sales/Client Services", "AGI", "Nicole");
  const newAgi = M("Business Development", "Dir Biz Dev", "New AGI", "Frank");
  const clientAgi = M("Client Services", "Strategist", "Client AGI", "Reid");
  const brandedSearch = M(
    "Marketing Solutions",
    "Dir Marketing",
    "Branded search",
    "Kelly"
  );
  const aiVisibility = M(
    "Marketing Solutions",
    "Dir Marketing",
    "AI visibility",
    "Kelly"
  );
  const throughput = M("Creative Services", "Content Manager", "Throughput", "Meg");
  const growth = M("Pinnacle", "COO & Integrator", "Growth milestones", "Nicole");
  const meeting = M("Pinnacle", "COO & Integrator", "Meeting effectiveness", "Nicole");
  const timeToFill = M("Administration", "VP Admin", "Time-to-fill", "Michelle");
  const methodAdoption = M(
    "Marketing Solutions",
    "VP Marketing & Sales Solutions",
    "Method adoption",
    "Chelsea"
  );
  const sals = M("Marketing Solutions", "Dir Marketing", "SALs", "Kelly");

  entries.push(
    ...monthly(overhead, year, [
      { m: 1, actual: 56.8, target: 60, status: "met" },
      { m: 2, actual: 59.4, target: 60, status: "met" },
      { m: 3, actual: 58.1, target: 60, status: "met" },
      { m: 4, actual: 57.5, target: 60, status: "met" },
      { m: 5, actual: 60.5, target: 60, status: "not_met" },
      { m: 6, actual: 58.0, target: 60, status: "met" },
    ])
  );

  const csatMonths = (metricId: number, values: [number, EntryStatus][]) =>
    monthly(
      metricId,
      year,
      values.map(([actual, status], i) => ({
        m: i + 1,
        actual,
        target: 1.75,
        status,
      }))
    );

  entries.push(
    ...csatMonths(csatVp, [
      [1.85, "met"], [1.80, "met"], [1.88, "met"], [1.82, "met"],
      [1.79, "met"], [1.86, "met"],
    ]),
    ...csatMonths(csatStrategist, [
      [1.84, "met"], [1.79, "met"], [1.86, "met"], [1.82, "met"],
      [1.80, "met"], [1.85, "met"],
    ])
  );

  entries.push(
    ...monthly(closeRate, year, [
      { m: 1, actual: 58, target: 50, status: "met" },
      { m: 2, actual: 52, target: 50, status: "met" },
      { m: 3, actual: 55, target: 50, status: "met" },
      { m: 4, actual: 56, target: 50, status: "met" },
      { m: 5, actual: 53, target: 50, status: "met" },
      { m: 6, actual: 57, target: 50, status: "met" },
    ])
  );

  entries.push(
    ...monthly(projectSuccess, year, [
      { m: 1, actual: 98.5, target: 95, status: "met" },
      { m: 2, actual: 97, target: 95, status: "met" },
      { m: 3, actual: 99, target: 95, status: "met" },
      { m: 4, actual: 98, target: 95, status: "met" },
      { m: 5, actual: 97.5, target: 95, status: "met" },
      { m: 6, actual: 99.5, target: 95, status: "met" },
    ])
  );

  entries.push(
    ...monthly(leads, year, [
      { m: 1, actual: 175, status: "met" },
      { m: 2, actual: 168, status: "met" },
      { m: 3, actual: 182, status: "met" },
      { m: 4, actual: 188, status: "met" },
      { m: 5, actual: 192, status: "met" },
      { m: 6, actual: 185, status: "met" },
    ])
  );

  entries.push(
    ...monthly(rework, year, [
      { m: 1, actual: 3.4, target: 5, status: "met" },
      { m: 2, actual: 4.0, target: 5, status: "met" },
      { m: 3, actual: 3.1, target: 5, status: "met" },
      { m: 4, actual: 3.6, target: 5, status: "met" },
      { m: 5, actual: 4.2, target: 5, status: "met" },
      { m: 6, actual: 3.3, target: 5, status: "met" },
    ])
  );

  entries.push(
    ...monthly(utilization, year, [
      { m: 1, actual: 84, status: "met" },
      { m: 2, actual: 82, status: "met" },
      { m: 3, actual: 86, status: "met" },
      { m: 4, actual: 85, status: "met" },
      { m: 5, actual: 83, status: "met" },
      { m: 6, actual: 87, status: "met" },
    ])
  );

  entries.push(
    ...monthly(reporting, year, [
      { m: 1, actual: 100, target: 100, status: "met" },
      { m: 2, actual: 100, target: 100, status: "met" },
      { m: 3, actual: 100, target: 100, status: "met" },
      { m: 4, actual: 100, target: 100, status: "met" },
      { m: 5, actual: 100, target: 100, status: "met" },
      { m: 6, actual: 100, target: 100, status: "met" },
    ])
  );

  entries.push(
    ...monthly(freeCashFlow, year, [
      { m: 1, actual: 595000, status: "met" },
      { m: 2, actual: 570000, status: "met" },
      { m: 3, actual: 620000, status: "met" },
      { m: 4, actual: 640000, status: "met" },
      { m: 5, actual: 615000, status: "met" },
      { m: 6, actual: 665000, status: "met" },
    ])
  );

  entries.push(
    row(esop, `${year}-01-01`, `${year}-12-31`, 148.2, null, "met"),
    ...monthly(agi, year, [
      { m: 1, actual: 1005000, status: "met" },
      { m: 2, actual: 985000, status: "on_track" },
      { m: 3, actual: 1020000, status: "met" },
      { m: 4, actual: 1045000, status: "met" },
      { m: 5, actual: 1030000, status: "met" },
      { m: 6, actual: 1065000, status: "met" },
    ])
  );

  entries.push(
    ...monthly(newAgi, year, [
      { m: 1, actual: 178000, status: "met" },
      { m: 2, actual: 165000, status: "met" },
      { m: 3, actual: 185000, status: "met" },
      { m: 4, actual: 192000, status: "met" },
      { m: 5, actual: 180000, status: "met" },
      { m: 6, actual: 198000, status: "met" },
    ])
  );

  entries.push(
    ...monthly(clientAgi, year, [
      { m: 1, actual: 378000, status: "met" },
      { m: 2, actual: 365000, status: "met" },
      { m: 3, actual: 390000, status: "met" },
      { m: 4, actual: 402000, status: "met" },
      { m: 5, actual: 395000, status: "met" },
      { m: 6, actual: 415000, status: "met" },
    ])
  );

  entries.push(
    ...monthly(brandedSearch, year, [
      { m: 1, actual: 3820, status: "met" },
      { m: 2, actual: 3910, status: "met" },
      { m: 3, actual: 4050, status: "met" },
      { m: 4, actual: 4120, status: "met" },
      { m: 5, actual: 4200, status: "met" },
      { m: 6, actual: 4280, status: "met" },
    ])
  );

  entries.push(
    ...monthly(aiVisibility, year, [
      { m: 1, actual: 64, status: "met" },
      { m: 2, actual: 66, status: "met" },
      { m: 3, actual: 68, status: "met" },
      { m: 4, actual: 70, status: "met" },
      { m: 5, actual: 72, status: "met" },
      { m: 6, actual: 74, status: "met" },
    ])
  );

  entries.push(
    ...monthly(throughput, year, [
      { m: 1, actual: 54, status: "met" },
      { m: 2, actual: 51, status: "met" },
      { m: 3, actual: 56, status: "met" },
      { m: 4, actual: 55, status: "met" },
      { m: 5, actual: 58, status: "met" },
      { m: 6, actual: 60, status: "met" },
    ])
  );

  const quarterlyData: [number, number, number, EntryStatus][] = [
    [growth, 1, 94, "met"], [growth, 2, 96, "met"],
    [meeting, 1, 96, "met"], [meeting, 2, 94, "met"],
    [timeToFill, 1, 30, "met"], [timeToFill, 2, 28, "met"],
    [methodAdoption, 1, 92, "met"], [methodAdoption, 2, 94, "met"],
    [sals, 1, 38, "met"], [sals, 2, 42, "met"],
  ];

  for (const [metricId, q, actual, status] of quarterlyData) {
    entries.push(quarterly(metricId, year, q, actual, status));
  }

  return entries;
}
