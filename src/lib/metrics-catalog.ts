import type {
  CadenceType,
  MetricValueType,
  TargetDirection,
} from "./types";

export interface CatalogMetricDef {
  name: string;
  definition: string;
  tier: string;
  cadence: CadenceType;
  valueType: MetricValueType;
  targetValue?: number | null;
  targetDirection?: TargetDirection;
  targetLabel?: string;
}

export interface CatalogRow {
  team: string;
  role: string;
  employee: string | null;
  metric: string;
  definition: string;
  departmentOwner: string;
  tier: string;
  cadence: CadenceType;
  valueType: MetricValueType;
  targetValue: number | null;
  targetDirection: TargetDirection;
  targetLabel: string | null;
  sortOrder: number;
}

interface Template {
  team: string;
  role: string;
  employees: (string | null)[];
  departmentOwner: string;
  metrics: CatalogMetricDef[];
}

function tierLabel(raw: string): string {
  const t = raw.trim();
  if (!t) return "Unassigned";
  if (t.toUpperCase() === "NA") return "NA";
  if (t.startsWith("Tier")) return t;
  return `Tier ${t}`;
}

function expand(templates: Template[]): CatalogRow[] {
  const rows: CatalogRow[] = [];
  let sort = 0;

  for (const t of templates) {
    for (const employee of t.employees) {
      for (const m of t.metrics) {
        sort += 1;
        rows.push({
          team: t.team,
          role: t.role,
          employee,
          metric: m.name,
          definition: m.definition,
          departmentOwner: t.departmentOwner,
          tier: tierLabel(m.tier),
          cadence: m.cadence,
          valueType: m.valueType,
          targetValue: m.targetValue ?? null,
          targetDirection: m.targetDirection ?? "higher_is_better",
          targetLabel: m.targetLabel ?? null,
          sortOrder: sort,
        });
      }
    }
  }

  return rows;
}

const pct = (
  name: string,
  definition: string,
  tier: string,
  cadence: CadenceType = "monthly",
  targetValue?: number | null,
  targetDirection: TargetDirection = "higher_is_better",
  targetLabel?: string
): CatalogMetricDef => ({
  name,
  definition,
  tier,
  cadence,
  valueType: "percentage",
  targetValue,
  targetDirection,
  targetLabel,
});

const METRIC_TEMPLATES: Template[] = [
  {
    team: "Pinnacle",
    role: "President & Visionary",
    employees: ["Greg"],
    departmentOwner: "Michelle",
    metrics: [
      {
        name: "Free Cash Flow",
        definition:
          "Success = Free Cash Flow meets or exceeds target",
        tier: "Tier 1",
        cadence: "monthly",
        valueType: "currency",
        targetLabel: "Meets or exceeds target",
      },
      {
        name: "ESOP Share Value",
        definition:
          "Annual ESOP valuation from 3rd-party firm; success = share value meets or exceeds target",
        tier: "Tier 1",
        cadence: "annual",
        valueType: "currency",
        targetLabel: "Meets or exceeds target",
      },
    ],
  },
  {
    team: "Pinnacle",
    role: "COO & Integrator",
    employees: ["Nicole"],
    departmentOwner: "Nicole",
    metrics: [
      {
        name: "Growth milestones",
        definition:
          "% of agency-wide rocks completed on time, calculated quarterly",
        tier: "Tier 1",
        cadence: "quarterly",
        valueType: "percentage",
      },
      pct(
        "Meeting effectiveness",
        "% of Pinnacle (L10) meetings ending with clear decisions and assigned owners (tracked via meeting close-out check)",
        "Tier 1",
        "quarterly"
      ),
    ],
  },
  {
    team: "Administration",
    role: "VP Admin",
    employees: ["Michelle"],
    departmentOwner: "Michelle",
    metrics: [
      pct(
        "Overhead",
        "Agency overhead as % of AGI, measured monthly and averaged quarterly (target ≤ 60%)",
        "Tier 1",
        "monthly",
        60,
        "lower_is_better",
        "≤ 60%"
      ),
      {
        name: "Time-to-fill",
        definition:
          "Average number of days to fill priority roles, tracked in ELT workbook",
        tier: "Tier 1",
        cadence: "quarterly",
        valueType: "days",
        targetDirection: "lower_is_better",
      },
      pct(
        "Reporting accuracy",
        "% of payroll, billing, and financial reporting completed on time with no material errors (quarterly yes/no)",
        "Tier 1",
        "monthly",
        100,
        "higher_is_better",
        "100%"
      ),
    ],
  },
  {
    team: "Marketing Solutions",
    role: "VP Marketing & Sales Solutions",
    employees: ["Chelsea"],
    departmentOwner: "Chelsea",
    metrics: [
      pct(
        "Method adoption",
        "% of client engagements using defined methodology, based on quarterly roadmap/project audits",
        "Tier 1",
        "quarterly"
      ),
      pct(
        "Revenue via solutions",
        "% of new revenue sold using approved solutions, scopes, and pricing models (measured at closed-won)",
        "Tier 2",
        "monthly"
      ),
      pct(
        "Client KPI success",
        "% of clients achieving defined performance KPIs based on internal dashboards (measured quarterly)",
        "Tier 3",
        "quarterly"
      ),
    ],
  },
  {
    team: "Business Development",
    role: "VP Sales/Client Services",
    employees: ["Nicole"],
    departmentOwner: "Nicole",
    metrics: [
      {
        name: "AGI",
        definition:
          "Actual Gross Income vs. projection targets for new and existing clients",
        tier: "Tier 1",
        cadence: "monthly",
        valueType: "currency",
        targetLabel: "Meets projection",
      },
      {
        name: "CSAT",
        definition:
          "Average client satisfaction score from HubSpot surveys (target >1.75)",
        tier: "Tier 1",
        cadence: "monthly",
        valueType: "score",
        targetValue: 1.75,
        targetLabel: "> 1.75",
      },
    ],
  },
  {
    team: "Creative Services",
    role: "VP Creative Ops",
    employees: ["Jo"],
    departmentOwner: "Jo",
    metrics: [
      pct(
        "On-time",
        "% of creative and implementation work delivered on or before deadline (target ≥ 90%)",
        "Tier 3",
        "monthly",
        90,
        "higher_is_better",
        "≥ 90%"
      ),
      pct(
        "Scope adherence",
        "% of projects completed within scoped hours, excluding approved change orders (target ≥ 90%)",
        "Tier 3",
        "monthly",
        90,
        "higher_is_better",
        "≥ 90%"
      ),
      pct(
        "Rework",
        "% of client rework attributable to system/process failure (target ≤ 5%)",
        "Tier 3",
        "monthly",
        5,
        "lower_is_better",
        "≤ 5%"
      ),
      {
        name: "Margin variance",
        definition:
          "Variance between actual and target margin across Creative, Web, and Paid services",
        tier: "Tier 3",
        cadence: "quarterly",
        valueType: "percentage",
        targetDirection: "lower_is_better",
      },
    ],
  },
  {
    team: "Business Development",
    role: "Dir Biz Dev",
    employees: ["Frank"],
    departmentOwner: "Nicole",
    metrics: [
      {
        name: "New AGI",
        definition: "New business AGI generated vs. budget",
        tier: "Tier 1",
        cadence: "monthly",
        valueType: "currency",
        targetLabel: "Meets budget",
      },
      pct(
        "Close rate",
        "Program deal closing ratio from HubSpot Sales Dashboard (target >50%)",
        "Tier 1",
        "monthly",
        50,
        "higher_is_better",
        "> 50%"
      ),
    ],
  },
  {
    team: "Client Services",
    role: "Strategist",
    employees: ["Reid", "Amanda", "Chelsea", "Nicole", "Frank", "Mary"],
    departmentOwner: "Nicole",
    metrics: [
      {
        name: "Client AGI",
        definition: "AGI from assigned clients vs. projections",
        tier: "Tier 1",
        cadence: "monthly",
        valueType: "currency",
        targetLabel: "Meets projection",
      },
      pct(
        "Client success",
        "% of assigned clients achieving defined strategic success metrics",
        "Tier 3",
        "quarterly"
      ),
      {
        name: "CSAT",
        definition:
          "Average HubSpot satisfaction score for assigned clients (target >1.75)",
        tier: "Tier 1",
        cadence: "monthly",
        valueType: "score",
        targetValue: 1.75,
        targetLabel: "> 1.75",
      },
    ],
  },
  {
    team: "Client Services",
    role: "CSM",
    employees: ["Megan", "Mary", "Raian", "Laura"],
    departmentOwner: "Nicole",
    metrics: [
      pct(
        "Delivery",
        "% of work delivered on time and within approved scope/budget (based on closed projects)",
        "Tier 2"
      ),
      pct(
        "Inputs readiness",
        "% of work released to implementation with complete inputs and required lead time",
        "Tier 3"
      ),
    ],
  },
  {
    team: "Marketing Solutions",
    role: "Dir Marketing",
    employees: ["Kelly"],
    departmentOwner: "Chelsea",
    metrics: [
      {
        name: "SALs",
        definition: "Number of Sales Accepted Leads per quarter (HubSpot)",
        tier: "Tier 1",
        cadence: "quarterly",
        valueType: "number",
      },
      {
        name: "Leads",
        definition: "Number of inbound leads per month (HubSpot)",
        tier: "Tier 1",
        cadence: "monthly",
        valueType: "number",
      },
      {
        name: "Branded search",
        definition: "Branded keyword search volume (Semrush)",
        tier: "Tier 1",
        cadence: "monthly",
        valueType: "number",
      },
      {
        name: "AI visibility",
        definition: "AI visibility score from Semrush",
        tier: "Tier 1",
        cadence: "monthly",
        valueType: "score",
      },
    ],
  },
  {
    team: "Marketing Solutions",
    role: "Data Analyst",
    employees: ["Raian"],
    departmentOwner: "Chelsea",
    metrics: [
      pct(
        "Dashboards",
        "% of clients with internal health dashboards fully set up (tracked monthly toward 100%)",
        "Tier 3",
        "monthly",
        100,
        "higher_is_better",
        "100%"
      ),
      pct(
        "Labor reduction",
        "Reduction in human labor hours from automation, based on workflow/template hour changes",
        "Tier 2",
        "quarterly"
      ),
    ],
  },
  {
    team: "Client Services",
    role: "HubSpot Consultant",
    employees: ["Brian L"],
    departmentOwner: "Chelsea",
    metrics: [
      pct(
        "Project success",
        "% of HubSpot projects delivered on time and within budget (target ≥ 95%)",
        "Tier 1",
        "monthly",
        95,
        "higher_is_better",
        "≥ 95%"
      ),
      {
        name: "Knowledge adoption",
        definition:
          "Level of HubSpot knowledge adoption across team (measured via survey or usage metrics)",
        tier: "Tier 3",
        cadence: "quarterly",
        valueType: "score",
      },
    ],
  },
  {
    team: "Operations",
    role: "Dir Operations",
    employees: ["Laura"],
    departmentOwner: "Jo",
    metrics: [
      pct(
        "Intake speed",
        "% of work moving from intake → assigned → scheduled within 2 business days (target ≥ 95%)",
        "Tier 3",
        "monthly",
        95,
        "higher_is_better",
        "≥ 95%"
      ),
      pct(
        "Capacity utilization",
        "% alignment of production capacity to target utilization ranges across teams",
        "Tier 3"
      ),
      pct(
        "Task completion",
        "% of scheduled production tasks completed per sprint/month (target ≥ 95%)",
        "Tier 2",
        "monthly",
        95,
        "higher_is_better",
        "≥ 95%"
      ),
      {
        name: "Forecast accuracy",
        definition: "Variance between planned vs. actual capacity utilization",
        tier: "Tier 2",
        cadence: "quarterly",
        valueType: "percentage",
        targetDirection: "lower_is_better",
      },
    ],
  },
  {
    team: "Creative Services",
    role: "Creative Director",
    employees: [null],
    departmentOwner: "Jo",
    metrics: [
      pct(
        "Rework",
        "% of revisions beyond scope attributable to creative quality (target ≤ 5%)",
        "Tier 1",
        "monthly",
        5,
        "lower_is_better",
        "≤ 5%"
      ),
      pct(
        "On-time",
        "% of design and video work delivered on time and within budget (target ≥ 95%)",
        "Tier 2",
        "monthly",
        95,
        "higher_is_better",
        "≥ 95%"
      ),
      {
        name: "Margin",
        definition:
          "Variance between actual and target margin for design and video work",
        tier: "Tier 3",
        cadence: "quarterly",
        valueType: "percentage",
        targetDirection: "lower_is_better",
      },
      {
        name: "Skill growth",
        definition:
          "Documented improvement in team capabilities against defined annual goals",
        tier: "NA",
        cadence: "annual",
        valueType: "boolean",
      },
    ],
  },
  {
    team: "Design",
    role: "Dir Design & Tech",
    employees: ["Brent"],
    departmentOwner: "Jo",
    metrics: [
      pct(
        "Rework",
        "% of revision rounds beyond scoped work (target ≤ 5%)",
        "",
        "monthly",
        5,
        "lower_is_better",
        "≤ 5%"
      ),
      pct(
        "On-time",
        "% of production art and web build work delivered on time (target ≥ 95%)",
        "",
        "monthly",
        95,
        "higher_is_better",
        "≥ 95%"
      ),
    ],
  },
  {
    team: "Design",
    role: "Visual Designer",
    employees: ["Alice"],
    departmentOwner: "Jo",
    metrics: [
      pct(
        "On-time",
        "% of deliverables completed by deadline (target ≥ 95%)",
        "",
        "monthly",
        95,
        "higher_is_better",
        "≥ 95%"
      ),
      pct(
        "Hours adherence",
        "% of work completed within scoped hours (target ≥ 95%)",
        "",
        "monthly",
        95,
        "higher_is_better",
        "≥ 95%"
      ),
    ],
  },
  {
    team: "Creative Services",
    role: "Content Manager",
    employees: ["Meg", "Jo"],
    departmentOwner: "Jo",
    metrics: [
      pct(
        "On-time",
        "% of content delivered on time (target ≥ 95%)",
        "",
        "monthly",
        95,
        "higher_is_better",
        "≥ 95%"
      ),
      pct(
        "Rework",
        "% of revision cycles beyond scope (target ≤ 5%)",
        "",
        "monthly",
        5,
        "lower_is_better",
        "≤ 5%"
      ),
      {
        name: "Throughput",
        definition: "Volume of content produced per period (tracked monthly)",
        tier: "Tier 1",
        cadence: "monthly",
        valueType: "number",
      },
    ],
  },
  {
    team: "Web Dev",
    role: "Web Dev Manager",
    employees: ["Ana"],
    departmentOwner: "Jo",
    metrics: [
      pct(
        "Budget",
        "% of projects completed within budget (excluding approved change orders) (target ≥ 90%)",
        "",
        "monthly",
        90,
        "higher_is_better",
        "≥ 90%"
      ),
      pct(
        "Rework",
        "% of revisions beyond scope due to technical issues (target ≤ 5%)",
        "",
        "monthly",
        5,
        "lower_is_better",
        "≤ 5%"
      ),
    ],
  },
  {
    team: "Web Dev",
    role: "Web PM",
    employees: ["Tim"],
    departmentOwner: "Jo",
    metrics: [
      pct(
        "On-time",
        "% of projects delivered on schedule (target ≥ 85%)",
        "Tier 2",
        "monthly",
        85,
        "higher_is_better",
        "≥ 85%"
      ),
      pct(
        "Change control",
        "% of scope changes properly documented and approved (target ≥ 95%)",
        "Tier 2",
        "monthly",
        95,
        "higher_is_better",
        "≥ 95%"
      ),
      pct(
        "Phase readiness",
        "% of projects meeting defined phase gate requirements (target ≥ 95%)",
        "Tier 2",
        "monthly",
        95,
        "higher_is_better",
        "≥ 95%"
      ),
    ],
  },
  {
    team: "Web Dev",
    role: "Web Developer",
    employees: ["Robert", "Ana"],
    departmentOwner: "Jo",
    metrics: [
      pct(
        "Utilization",
        "Billable utilization rate vs. target",
        "Tier 1"
      ),
      pct(
        "On-time",
        "% of tasks completed on time (target ≥ 90%)",
        "",
        "monthly",
        90,
        "higher_is_better",
        "≥ 90%"
      ),
      pct(
        "Defects",
        "% of work requiring fixes/rework (target ≤ 5%)",
        "",
        "monthly",
        5,
        "lower_is_better",
        "≤ 5%"
      ),
    ],
  },
  {
    team: "Design",
    role: "Video Producer",
    employees: ["Matt"],
    departmentOwner: "Jo",
    metrics: [
      pct(
        "On-time",
        "% of video assets delivered on time (target ≥ 95%)",
        "",
        "monthly",
        95,
        "higher_is_better",
        "≥ 95%"
      ),
      pct("Hours", "% of videos completed within scoped hours", ""),
      pct(
        "Revisions",
        "% of revision cycles beyond scope (target ≤ 5%)",
        "",
        "monthly",
        5,
        "lower_is_better",
        "≤ 5%"
      ),
    ],
  },
  {
    team: "Paid Ads",
    role: "Paid Ads Manager",
    employees: ["Charles"],
    departmentOwner: "Jo",
    metrics: [
      pct(
        "Performance",
        "% of accounts meeting or exceeding defined performance benchmarks",
        ""
      ),
      pct(
        "Delivery",
        "% of paid ads work delivered on time and within scope (target ≥ 95%)",
        "",
        "monthly",
        95,
        "higher_is_better",
        "≥ 95%"
      ),
      {
        name: "Margin",
        definition: "Variance between actual and target margin for paid media services",
        tier: "",
        cadence: "quarterly",
        valueType: "percentage",
        targetDirection: "lower_is_better",
      },
    ],
  },
];

export const METRICS_CATALOG: CatalogRow[] = expand(METRIC_TEMPLATES);

export const CATALOG_TEAMS = [...new Set(METRICS_CATALOG.map((r) => r.team))].sort();
export const CATALOG_PEOPLE = [
  ...new Set(
    METRICS_CATALOG.flatMap((r) => [r.employee, r.departmentOwner]).filter(
      (n): n is string => Boolean(n)
    )
  ),
].sort();

export function formatMetricOptionLabel(row: {
  team: string;
  role: string;
  metric_name: string;
  owner?: string | null;
}): string {
  const parts = [row.team, row.role];
  if (row.owner) parts.push(row.owner);
  parts.push(row.metric_name);
  return parts.join(" · ");
}

export function catalogSortOrder(
  team: string,
  role: string,
  metric: string,
  employee?: string | null
): number | undefined {
  return METRICS_CATALOG.find(
    (r) =>
      r.team === team &&
      r.role === role &&
      r.metric === metric &&
      (employee === undefined || r.employee === employee)
  )?.sortOrder;
}
