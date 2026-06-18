import { METRICS_CATALOG } from "../src/lib/metrics-catalog";
import { writeFileSync } from "fs";
import { join } from "path";

function esc(s: string | null): string {
  if (s === null) return "NULL";
  return `'${s.replace(/'/g, "''")}'`;
}

const supervisors = new Set(["Michelle", "Nicole", "Chelsea", "Jo"]);

const teams = [...new Set(METRICS_CATALOG.map((r) => r.team))];
const people = [...new Set(METRICS_CATALOG.flatMap((r) => [r.employee, r.departmentOwner]).filter(Boolean) as string[])];
const roles = [...new Set(METRICS_CATALOG.map((r) => `${r.team}|||${r.role}`))];

const metricInserts = METRICS_CATALOG.map(
  (r) =>
    `  (t_${slug(r.team)}, r_${slug(r.team)}_${slug(r.role)}, ${esc(r.metric)}, ${esc(r.definition)}, ${r.employee ? `p_${slug(r.employee)}` : "NULL"}, p_${slug(r.departmentOwner)}, ${esc(r.tier)}, '${r.cadence}'::cadence_type, '${r.valueType}'::metric_value_type, ${r.targetValue ?? "NULL"}, '${r.targetDirection}'::target_direction, ${r.targetLabel ? esc(r.targetLabel) : "NULL"}, ${r.sortOrder})`
);

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

const sql = `-- Updated KYR metrics catalog (${METRICS_CATALOG.length} employee-metric rows)
-- Run after 001_schema.sql. Replaces prior metric definitions from 002/003.

INSERT INTO teams (name) VALUES
  ('Operations'),
  ('Design'),
  ('Paid Ads')
ON CONFLICT (name) DO NOTHING;

INSERT INTO people (name, is_supervisor) VALUES
${people.map((p) => `  (${esc(p)}, ${supervisors.has(p)})`).join(",\n")}
ON CONFLICT (name) DO NOTHING;

DELETE FROM metric_entries;
DELETE FROM metrics;

DO $$
DECLARE
${teams.map((t) => `  t_${slug(t)} UUID;`).join("\n")}
${roles.map((tr) => {
  const [team, role] = tr.split("|||");
  return `  r_${slug(team)}_${slug(role)} UUID;`;
}).join("\n")}
${people.map((p) => `  p_${slug(p)} UUID;`).join("\n")}
BEGIN
${teams.map((t) => `  SELECT id INTO t_${slug(t)} FROM teams WHERE name = ${esc(t)};`).join("\n")}

${roles
  .map((tr) => {
    const [team, role] = tr.split("|||");
    return `  INSERT INTO roles (team_id, name) VALUES (t_${slug(team)}, ${esc(role)}) ON CONFLICT (team_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO r_${slug(team)}_${slug(role)};`;
  })
  .join("\n")}

${people.map((p) => `  SELECT id INTO p_${slug(p)} FROM people WHERE name = ${esc(p)};`).join("\n")}

  INSERT INTO metrics (team_id, role_id, name, definition, owner_id, department_owner_id, tier, cadence, value_type, target_value, target_direction, target_label, sort_order) VALUES
${metricInserts.join(",\n")};
END $$;
`;

const out = join(process.cwd(), "supabase/migrations/004_updated_kyr_metrics.sql");
writeFileSync(out, sql);
console.log(`Wrote ${METRICS_CATALOG.length} metrics to ${out}`);
