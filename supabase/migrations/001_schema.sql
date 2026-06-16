-- KYR Metrics Database Schema
-- Know Your Role performance tracking for Weidert Group

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teams
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Roles within teams
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, name)
);

-- People (metric owners and department owners)
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  email TEXT,
  is_supervisor BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Metric value types
CREATE TYPE metric_value_type AS ENUM (
  'percentage',
  'currency',
  'number',
  'ratio',
  'days',
  'score',
  'boolean'
);

-- Cadence types
CREATE TYPE cadence_type AS ENUM (
  'monthly',
  'quarterly',
  'annual',
  'ad_hoc'
);

-- Comparison direction for targets
CREATE TYPE target_direction AS ENUM (
  'higher_is_better',
  'lower_is_better',
  'equals'
);

-- Core metrics definition table
CREATE TABLE metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  definition TEXT NOT NULL,
  owner_id UUID REFERENCES people(id) ON DELETE SET NULL,
  department_owner_id UUID REFERENCES people(id) ON DELETE SET NULL,
  how_to_pull TEXT,
  tier TEXT NOT NULL DEFAULT 'Tier 1',
  cadence cadence_type NOT NULL DEFAULT 'monthly',
  cadence_notes TEXT,
  value_type metric_value_type NOT NULL DEFAULT 'number',
  target_value NUMERIC,
  target_direction target_direction NOT NULL DEFAULT 'higher_is_better',
  target_label TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tracked metric entries (actual performance data)
CREATE TABLE metric_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_id UUID NOT NULL REFERENCES metrics(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  actual_value NUMERIC,
  target_value NUMERIC,
  status TEXT CHECK (status IN ('on_track', 'at_risk', 'off_track', 'met', 'not_met', 'pending')),
  notes TEXT,
  entered_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(metric_id, period_start, period_end)
);

-- Indexes for dashboard queries
CREATE INDEX idx_metrics_team ON metrics(team_id);
CREATE INDEX idx_metrics_role ON metrics(role_id);
CREATE INDEX idx_metrics_owner ON metrics(owner_id);
CREATE INDEX idx_metrics_dept_owner ON metrics(department_owner_id);
CREATE INDEX idx_metrics_tier ON metrics(tier);
CREATE INDEX idx_metric_entries_metric ON metric_entries(metric_id);
CREATE INDEX idx_metric_entries_period ON metric_entries(period_start, period_end);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER metrics_updated_at
  BEFORE UPDATE ON metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER metric_entries_updated_at
  BEFORE UPDATE ON metric_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- View for dashboard with joined data
CREATE OR REPLACE VIEW metric_dashboard AS
SELECT
  m.id AS metric_id,
  t.name AS team,
  t.id AS team_id,
  r.name AS role,
  r.id AS role_id,
  m.name AS metric_name,
  m.definition,
  owner_p.name AS owner,
  owner_p.id AS owner_id,
  dept_p.name AS department_owner,
  dept_p.id AS department_owner_id,
  m.how_to_pull,
  m.tier,
  m.cadence,
  m.cadence_notes,
  m.value_type,
  m.target_value,
  m.target_direction,
  m.target_label,
  m.is_active,
  m.sort_order,
  (
    SELECT me.actual_value
    FROM metric_entries me
    WHERE me.metric_id = m.id
    ORDER BY me.period_end DESC
    LIMIT 1
  ) AS latest_actual,
  (
    SELECT me.period_end
    FROM metric_entries me
    WHERE me.metric_id = m.id
    ORDER BY me.period_end DESC
    LIMIT 1
  ) AS latest_period_end,
  (
    SELECT me.status
    FROM metric_entries me
    WHERE me.metric_id = m.id
    ORDER BY me.period_end DESC
    LIMIT 1
  ) AS latest_status
FROM metrics m
JOIN teams t ON m.team_id = t.id
JOIN roles r ON m.role_id = r.id
LEFT JOIN people owner_p ON m.owner_id = owner_p.id
LEFT JOIN people dept_p ON m.department_owner_id = dept_p.id
WHERE m.is_active = TRUE;

-- Row Level Security (permissive for internal tool; tighten with auth later)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public read roles" ON roles FOR SELECT USING (true);
CREATE POLICY "Allow public read people" ON people FOR SELECT USING (true);
CREATE POLICY "Allow public read metrics" ON metrics FOR SELECT USING (true);
CREATE POLICY "Allow public read entries" ON metric_entries FOR SELECT USING (true);

CREATE POLICY "Allow public insert entries" ON metric_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update entries" ON metric_entries FOR UPDATE USING (true);
CREATE POLICY "Allow public delete entries" ON metric_entries FOR DELETE USING (true);

CREATE POLICY "Allow public insert metrics" ON metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update metrics" ON metrics FOR UPDATE USING (true);
