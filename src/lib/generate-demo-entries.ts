import type { EntryStatus, MetricEntry } from "./types";

const id = (n: number) =>
  `00000000-0000-0000-0000-${String(n).padStart(12, "0")}`;
const eid = (n: number) =>
  `10000000-0000-0000-0000-${String(n).padStart(12, "0")}`;

const M = {
  freeCashFlow: 1,
  esop: 2,
  growth: 3,
  meeting: 4,
  overhead: 5,
  timeToFill: 6,
  reporting: 7,
  methodAdoption: 8,
  agi: 9,
  csatVpSales: 10,
  newAgi: 11,
  closeRate: 12,
  clientAgi: 13,
  csatStrategist: 14,
  projectSuccess: 15,
  sals: 16,
  leads: 17,
  brandedSearch: 18,
  aiVisibility: 19,
  rework: 20,
  throughput: 21,
  utilization: 22,
} as const;

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

  // Overhead (target 60, lower is better)
  entries.push(
    ...monthly(M.overhead, 2025, [
      { m: 1, actual: 58.2, target: 60, status: "met" },
      { m: 2, actual: 61.5, target: 60, status: "not_met" },
      { m: 3, actual: 57.8, target: 60, status: "met" },
      { m: 4, actual: 59.1, target: 60, status: "met" },
      { m: 5, actual: 62.0, target: 60, status: "not_met" },
      { m: 6, actual: 58.5, target: 60, status: "met" },
      { m: 7, actual: 57.2, target: 60, status: "met" },
      { m: 8, actual: 60.1, target: 60, status: "not_met" },
      { m: 9, actual: 59.8, target: 60, status: "met" },
      { m: 10, actual: 58.9, target: 60, status: "met" },
      { m: 11, actual: 61.2, target: 60, status: "not_met" },
      { m: 12, actual: 57.5, target: 60, status: "met" },
    ]),
    ...monthly(M.overhead, 2026, [
      { m: 1, actual: 56.8, target: 60, status: "met" },
      { m: 2, actual: 59.4, target: 60, status: "met" },
      { m: 3, actual: 58.1, target: 60, status: "met" },
      { m: 4, actual: 57.5, target: 60, status: "met" },
      { m: 5, actual: 60.5, target: 60, status: "not_met" },
      { m: 6, actual: 58.0, target: 60, status: "met" },
    ])
  );

  const csatMonths = (year: number, values: [number, EntryStatus][]) =>
    monthly(M.csatVpSales, year, values.map(([actual, status], i) => ({
      m: i + 1,
      actual,
      target: 1.75,
      status,
    })));

  entries.push(
    ...csatMonths(2025, [
      [1.82, "met"], [1.68, "not_met"], [1.79, "met"], [1.76, "met"],
      [1.81, "met"], [1.73, "not_met"], [1.80, "met"], [1.77, "met"],
      [1.84, "met"], [1.78, "met"], [1.83, "met"], [1.81, "met"],
    ]),
    ...csatMonths(2026, [
      [1.85, "met"], [1.80, "met"], [1.88, "met"], [1.82, "met"],
      [1.79, "met"], [1.86, "met"],
    ])
  );

  const csatStrat = (year: number, vals: [number, EntryStatus][]) =>
    monthly(M.csatStrategist, year, vals.map(([actual, status], i) => ({
      m: i + 1,
      actual,
      target: 1.75,
      status,
    })));

  entries.push(
    ...csatStrat(2025, [
      [1.80, "met"], [1.72, "not_met"], [1.78, "met"], [1.76, "met"],
      [1.81, "met"], [1.74, "not_met"], [1.79, "met"], [1.77, "met"],
      [1.82, "met"], [1.80, "met"], [1.83, "met"], [1.81, "met"],
    ]),
    ...csatStrat(2026, [
      [1.84, "met"], [1.79, "met"], [1.86, "met"], [1.82, "met"],
      [1.80, "met"], [1.85, "met"],
    ])
  );

  const closeMonths = (year: number, vals: [number, EntryStatus][]) =>
    monthly(M.closeRate, year, vals.map(([actual, status], i) => ({
      m: i + 1,
      actual,
      target: 50,
      status,
    })));

  entries.push(
    ...closeMonths(2025, [
      [54, "met"], [47, "not_met"], [52, "met"], [51, "met"],
      [55, "met"], [48, "not_met"], [53, "met"], [49, "not_met"],
      [56, "met"], [57, "met"], [51, "met"], [54, "met"],
    ]),
    ...closeMonths(2026, [
      [58, "met"], [52, "met"], [55, "met"], [56, "met"],
      [53, "met"], [57, "met"],
    ])
  );

  const projMonths = (year: number, vals: [number, EntryStatus][]) =>
    monthly(M.projectSuccess, year, vals.map(([actual, status], i) => ({
      m: i + 1,
      actual,
      target: 95,
      status,
    })));

  entries.push(
    ...projMonths(2025, [
      [96.5, "met"], [93, "at_risk"], [97, "met"], [95.5, "met"],
      [96, "met"], [94.5, "at_risk"], [97.5, "met"], [95, "met"],
      [96.5, "met"], [98, "met"], [96.5, "met"], [97.5, "met"],
    ]),
    ...projMonths(2026, [
      [98.5, "met"], [97, "met"], [99, "met"], [98, "met"],
      [97.5, "met"], [99.5, "met"],
    ])
  );

  entries.push(
    ...monthly(M.leads, 2025, [
      { m: 1, actual: 142, status: "on_track" }, { m: 2, actual: 118, status: "on_track" },
      { m: 3, actual: 156, status: "met" }, { m: 4, actual: 148, status: "met" },
      { m: 5, actual: 162, status: "met" }, { m: 6, actual: 139, status: "on_track" },
      { m: 7, actual: 165, status: "met" }, { m: 8, actual: 152, status: "met" },
      { m: 9, actual: 171, status: "met" }, { m: 10, actual: 158, status: "met" },
      { m: 11, actual: 145, status: "on_track" }, { m: 12, actual: 168, status: "met" },
    ]),
    ...monthly(M.leads, 2026, [
      { m: 1, actual: 175, status: "met" }, { m: 2, actual: 168, status: "met" },
      { m: 3, actual: 182, status: "met" }, { m: 4, actual: 188, status: "met" },
      { m: 5, actual: 192, status: "met" }, { m: 6, actual: 185, status: "met" },
    ])
  );

  const reworkMonths = (year: number, vals: [number, EntryStatus][]) =>
    monthly(M.rework, year, vals.map(([actual, status], i) => ({
      m: i + 1,
      actual,
      target: 5,
      status,
    })));

  entries.push(
    ...reworkMonths(2025, [
      [4.1, "met"], [6.2, "not_met"], [3.8, "met"], [4.5, "met"],
      [3.9, "met"], [5.1, "not_met"], [3.5, "met"], [4.8, "met"],
      [4.2, "met"], [3.7, "met"], [4.4, "met"], [3.2, "met"],
    ]),
    ...reworkMonths(2026, [
      [3.4, "met"], [4.0, "met"], [3.1, "met"], [3.6, "met"],
      [4.2, "met"], [3.3, "met"],
    ])
  );

  entries.push(
    ...monthly(M.utilization, 2025, [
      { m: 1, actual: 78, status: "on_track" }, { m: 2, actual: 72, status: "at_risk" },
      { m: 3, actual: 81, status: "met" }, { m: 4, actual: 79, status: "met" },
      { m: 5, actual: 83, status: "met" }, { m: 6, actual: 77, status: "on_track" },
      { m: 7, actual: 82, status: "met" }, { m: 8, actual: 80, status: "met" },
      { m: 9, actual: 84, status: "met" }, { m: 10, actual: 79, status: "met" },
      { m: 11, actual: 81, status: "met" }, { m: 12, actual: 85, status: "met" },
    ]),
    ...monthly(M.utilization, 2026, [
      { m: 1, actual: 84, status: "met" }, { m: 2, actual: 82, status: "met" },
      { m: 3, actual: 86, status: "met" }, { m: 4, actual: 85, status: "met" },
      { m: 5, actual: 83, status: "met" }, { m: 6, actual: 87, status: "met" },
    ])
  );

  const reportingMonths = (year: number, count: number) =>
    monthly(
      M.reporting,
      year,
      Array.from({ length: count }, (_, i) => ({
        m: i + 1,
        actual: 100,
        target: 100,
        status: "met" as EntryStatus,
      }))
    );

  entries.push(...reportingMonths(2025, 12), ...reportingMonths(2026, 6));

  entries.push(
    ...monthly(M.freeCashFlow, 2025, [
      { m: 1, actual: 420000, status: "on_track" }, { m: 2, actual: 385000, status: "on_track" },
      { m: 3, actual: 510000, status: "met" }, { m: 4, actual: 445000, status: "met" },
      { m: 5, actual: 468000, status: "met" }, { m: 6, actual: 432000, status: "on_track" },
      { m: 7, actual: 490000, status: "met" }, { m: 8, actual: 475000, status: "on_track" },
      { m: 9, actual: 520000, status: "met" }, { m: 10, actual: 535000, status: "met" },
      { m: 11, actual: 510000, status: "met" }, { m: 12, actual: 580000, status: "met" },
    ]),
    ...monthly(M.freeCashFlow, 2026, [
      { m: 1, actual: 595000, status: "met" }, { m: 2, actual: 570000, status: "met" },
      { m: 3, actual: 620000, status: "met" }, { m: 4, actual: 640000, status: "met" },
      { m: 5, actual: 615000, status: "met" }, { m: 6, actual: 665000, status: "met" },
    ])
  );

  entries.push(
    row(M.esop, "2025-01-01", "2025-12-31", 142.5, null, "met"),
    ...monthly(M.agi, 2025, [
      { m: 1, actual: 892000, status: "on_track" }, { m: 2, actual: 875000, status: "on_track" },
      { m: 3, actual: 920000, status: "met" }, { m: 4, actual: 905000, status: "met" },
      { m: 5, actual: 918000, status: "met" }, { m: 6, actual: 890000, status: "on_track" },
      { m: 7, actual: 935000, status: "met" }, { m: 8, actual: 910000, status: "on_track" },
      { m: 9, actual: 945000, status: "met" }, { m: 10, actual: 960000, status: "met" },
      { m: 11, actual: 940000, status: "on_track" }, { m: 12, actual: 985000, status: "met" },
    ]),
    ...monthly(M.agi, 2026, [
      { m: 1, actual: 1005000, status: "met" }, { m: 2, actual: 985000, status: "on_track" },
      { m: 3, actual: 1020000, status: "met" }, { m: 4, actual: 1045000, status: "met" },
      { m: 5, actual: 1030000, status: "met" }, { m: 6, actual: 1065000, status: "met" },
    ])
  );

  entries.push(
    ...monthly(M.newAgi, 2025, [
      { m: 1, actual: 125000, status: "met" }, { m: 2, actual: 98000, status: "at_risk" },
      { m: 3, actual: 142000, status: "met" }, { m: 4, actual: 135000, status: "met" },
      { m: 5, actual: 128000, status: "met" }, { m: 6, actual: 115000, status: "at_risk" },
      { m: 7, actual: 148000, status: "met" }, { m: 8, actual: 132000, status: "met" },
      { m: 9, actual: 155000, status: "met" }, { m: 10, actual: 160000, status: "met" },
      { m: 11, actual: 145000, status: "met" }, { m: 12, actual: 172000, status: "met" },
    ]),
    ...monthly(M.newAgi, 2026, [
      { m: 1, actual: 178000, status: "met" }, { m: 2, actual: 165000, status: "met" },
      { m: 3, actual: 185000, status: "met" }, { m: 4, actual: 192000, status: "met" },
      { m: 5, actual: 180000, status: "met" }, { m: 6, actual: 198000, status: "met" },
    ])
  );

  entries.push(
    ...monthly(M.clientAgi, 2025, [
      { m: 1, actual: 310000, status: "on_track" }, { m: 2, actual: 295000, status: "on_track" },
      { m: 3, actual: 328000, status: "met" }, { m: 4, actual: 315000, status: "met" },
      { m: 5, actual: 322000, status: "met" }, { m: 6, actual: 308000, status: "on_track" },
      { m: 7, actual: 335000, status: "met" }, { m: 8, actual: 318000, status: "on_track" },
      { m: 9, actual: 342000, status: "met" }, { m: 10, actual: 350000, status: "met" },
      { m: 11, actual: 338000, status: "met" }, { m: 12, actual: 365000, status: "met" },
    ]),
    ...monthly(M.clientAgi, 2026, [
      { m: 1, actual: 378000, status: "met" }, { m: 2, actual: 365000, status: "met" },
      { m: 3, actual: 390000, status: "met" }, { m: 4, actual: 402000, status: "met" },
      { m: 5, actual: 395000, status: "met" }, { m: 6, actual: 415000, status: "met" },
    ])
  );

  entries.push(
    ...monthly(M.brandedSearch, 2025, [
      { m: 1, actual: 2840, status: "on_track" }, { m: 2, actual: 2910, status: "on_track" },
      { m: 3, actual: 3050, status: "met" }, { m: 4, actual: 3120, status: "met" },
      { m: 5, actual: 3280, status: "met" }, { m: 6, actual: 3190, status: "met" },
      { m: 7, actual: 3350, status: "met" }, { m: 8, actual: 3420, status: "met" },
      { m: 9, actual: 3510, status: "met" }, { m: 10, actual: 3580, status: "met" },
      { m: 11, actual: 3620, status: "met" }, { m: 12, actual: 3710, status: "met" },
    ]),
    ...monthly(M.brandedSearch, 2026, [
      { m: 1, actual: 3820, status: "met" }, { m: 2, actual: 3910, status: "met" },
      { m: 3, actual: 4050, status: "met" }, { m: 4, actual: 4120, status: "met" },
      { m: 5, actual: 4200, status: "met" }, { m: 6, actual: 4280, status: "met" },
    ])
  );

  entries.push(
    ...monthly(M.aiVisibility, 2025, [
      { m: 1, actual: 42, status: "on_track" }, { m: 2, actual: 45, status: "on_track" },
      { m: 3, actual: 48, status: "met" }, { m: 4, actual: 50, status: "met" },
      { m: 5, actual: 52, status: "met" }, { m: 6, actual: 51, status: "met" },
      { m: 7, actual: 54, status: "met" }, { m: 8, actual: 55, status: "met" },
      { m: 9, actual: 57, status: "met" }, { m: 10, actual: 58, status: "met" },
      { m: 11, actual: 60, status: "met" }, { m: 12, actual: 62, status: "met" },
    ]),
    ...monthly(M.aiVisibility, 2026, [
      { m: 1, actual: 64, status: "met" }, { m: 2, actual: 66, status: "met" },
      { m: 3, actual: 68, status: "met" }, { m: 4, actual: 70, status: "met" },
      { m: 5, actual: 72, status: "met" }, { m: 6, actual: 74, status: "met" },
    ])
  );

  entries.push(
    ...monthly(M.throughput, 2025, [
      { m: 1, actual: 38, status: "on_track" }, { m: 2, actual: 42, status: "met" },
      { m: 3, actual: 45, status: "met" }, { m: 4, actual: 44, status: "met" },
      { m: 5, actual: 41, status: "on_track" }, { m: 6, actual: 47, status: "met" },
      { m: 7, actual: 46, status: "met" }, { m: 8, actual: 43, status: "on_track" },
      { m: 9, actual: 49, status: "met" }, { m: 10, actual: 48, status: "met" },
      { m: 11, actual: 50, status: "met" }, { m: 12, actual: 52, status: "met" },
    ]),
    ...monthly(M.throughput, 2026, [
      { m: 1, actual: 54, status: "met" }, { m: 2, actual: 51, status: "met" },
      { m: 3, actual: 56, status: "met" }, { m: 4, actual: 55, status: "met" },
      { m: 5, actual: 58, status: "met" }, { m: 6, actual: 60, status: "met" },
    ])
  );

  // Quarterly metrics 2025 Q1-Q4 + 2026 Q1-Q2
  const quarterlyData: [number, number, number, number, EntryStatus][] = [
    [M.growth, 2025, 1, 85, "on_track"], [M.growth, 2025, 2, 90, "met"],
    [M.growth, 2025, 3, 88, "on_track"], [M.growth, 2025, 4, 93, "met"],
    [M.growth, 2026, 1, 94, "met"], [M.growth, 2026, 2, 96, "met"],
    [M.meeting, 2025, 1, 92, "met"], [M.meeting, 2025, 2, 88, "on_track"],
    [M.meeting, 2025, 3, 95, "met"], [M.meeting, 2025, 4, 91, "met"],
    [M.meeting, 2026, 1, 96, "met"], [M.meeting, 2026, 2, 94, "met"],
    [M.timeToFill, 2025, 1, 38, "met"], [M.timeToFill, 2025, 2, 42, "at_risk"],
    [M.timeToFill, 2025, 3, 35, "met"], [M.timeToFill, 2025, 4, 32, "met"],
    [M.timeToFill, 2026, 1, 30, "met"], [M.timeToFill, 2026, 2, 28, "met"],
    [M.methodAdoption, 2025, 1, 78, "at_risk"], [M.methodAdoption, 2025, 2, 82, "met"],
    [M.methodAdoption, 2025, 3, 86, "met"], [M.methodAdoption, 2025, 4, 90, "met"],
    [M.methodAdoption, 2026, 1, 92, "met"], [M.methodAdoption, 2026, 2, 94, "met"],
    [M.sals, 2025, 1, 24, "met"], [M.sals, 2025, 2, 28, "met"],
    [M.sals, 2025, 3, 31, "met"], [M.sals, 2025, 4, 35, "met"],
    [M.sals, 2026, 1, 38, "met"], [M.sals, 2026, 2, 42, "met"],
  ];

  for (const [metricId, year, q, actual, status] of quarterlyData) {
    entries.push(quarterly(metricId, year, q, actual, status));
  }

  return entries;
}
