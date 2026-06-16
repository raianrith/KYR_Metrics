-- Seed data for KYR Metrics

-- Teams
INSERT INTO teams (name) VALUES
  ('Pinnacle'),
  ('Administration'),
  ('Marketing Solutions'),
  ('Business Development'),
  ('Client Services'),
  ('Creative Services'),
  ('Web Dev');

-- People
INSERT INTO people (name, is_supervisor) VALUES
  ('Michelle', true),
  ('Nicole', true),
  ('Chelsea', true),
  ('Jo', true),
  ('Mike', false),
  ('Vicki', false),
  ('Robert', false);

-- Helper function to get IDs
DO $$
DECLARE
  t_pinnacle UUID;
  t_admin UUID;
  t_marketing UUID;
  t_bizdev UUID;
  t_clients UUID;
  t_creative UUID;
  t_webdev UUID;

  r_pres UUID;
  r_coo UUID;
  r_vp_admin UUID;
  r_vp_marketing UUID;
  r_vp_sales UUID;
  r_dir_bizdev UUID;
  r_strategist UUID;
  r_dir_marketing UUID;
  r_hubspot UUID;
  r_creative_dir UUID;
  r_content_mgr UUID;
  r_web_dev UUID;

  p_michelle UUID;
  p_nicole UUID;
  p_chelsea UUID;
  p_jo UUID;
  p_mike UUID;
  p_vicki UUID;
  p_robert UUID;
BEGIN
  SELECT id INTO t_pinnacle FROM teams WHERE name = 'Pinnacle';
  SELECT id INTO t_admin FROM teams WHERE name = 'Administration';
  SELECT id INTO t_marketing FROM teams WHERE name = 'Marketing Solutions';
  SELECT id INTO t_bizdev FROM teams WHERE name = 'Business Development';
  SELECT id INTO t_clients FROM teams WHERE name = 'Client Services';
  SELECT id INTO t_creative FROM teams WHERE name = 'Creative Services';
  SELECT id INTO t_webdev FROM teams WHERE name = 'Web Dev';

  SELECT id INTO p_michelle FROM people WHERE name = 'Michelle';
  SELECT id INTO p_nicole FROM people WHERE name = 'Nicole';
  SELECT id INTO p_chelsea FROM people WHERE name = 'Chelsea';
  SELECT id INTO p_jo FROM people WHERE name = 'Jo';
  SELECT id INTO p_mike FROM people WHERE name = 'Mike';
  SELECT id INTO p_vicki FROM people WHERE name = 'Vicki';
  SELECT id INTO p_robert FROM people WHERE name = 'Robert';

  -- Roles
  INSERT INTO roles (team_id, name) VALUES (t_pinnacle, 'President & Visionary') RETURNING id INTO r_pres;
  INSERT INTO roles (team_id, name) VALUES (t_pinnacle, 'COO & Integrator') RETURNING id INTO r_coo;
  INSERT INTO roles (team_id, name) VALUES (t_admin, 'VP Admin') RETURNING id INTO r_vp_admin;
  INSERT INTO roles (team_id, name) VALUES (t_marketing, 'VP Marketing') RETURNING id INTO r_vp_marketing;
  INSERT INTO roles (team_id, name) VALUES (t_bizdev, 'VP Sales') RETURNING id INTO r_vp_sales;
  INSERT INTO roles (team_id, name) VALUES (t_bizdev, 'Dir Biz Dev') RETURNING id INTO r_dir_bizdev;
  INSERT INTO roles (team_id, name) VALUES (t_clients, 'Strategist') RETURNING id INTO r_strategist;
  INSERT INTO roles (team_id, name) VALUES (t_marketing, 'Dir Marketing') RETURNING id INTO r_dir_marketing;
  INSERT INTO roles (team_id, name) VALUES (t_clients, 'HubSpot Consultant') RETURNING id INTO r_hubspot;
  INSERT INTO roles (team_id, name) VALUES (t_creative, 'Creative Director') RETURNING id INTO r_creative_dir;
  INSERT INTO roles (team_id, name) VALUES (t_creative, 'Content Manager') RETURNING id INTO r_content_mgr;
  INSERT INTO roles (team_id, name) VALUES (t_webdev, 'Web Developer') RETURNING id INTO r_web_dev;

  -- Metrics
  INSERT INTO metrics (team_id, role_id, name, definition, owner_id, department_owner_id, how_to_pull, tier, cadence, cadence_notes, value_type, target_value, target_direction, target_label, sort_order) VALUES
  -- Pinnacle
  (t_pinnacle, r_pres, 'Free Cash Flow', 'Success = Free Cash Flow meets or exceeds target', NULL, p_michelle, 'Found in WG Scorecard', 'Tier 1', 'monthly', 'Monthly, PNL', 'currency', NULL, 'higher_is_better', 'Meets or exceeds target', 1),
  (t_pinnacle, r_pres, 'ESOP Share Value', 'Annual ESOP valuation from 3rd-party firm; success = share value meets or exceeds target', NULL, p_michelle, 'Annual ESOP valuation from 3rd-party firm', 'Tier 1', 'annual', 'Once a year share price', 'currency', NULL, 'higher_is_better', 'Meets or exceeds target', 2),
  (t_pinnacle, r_coo, 'Growth milestones', '% of agency-wide rocks completed on time, calculated quarterly', NULL, p_nicole, 'Manual', 'Tier 1', 'quarterly', 'Manually done by Nicole', 'percentage', NULL, 'higher_is_better', '100% on time', 3),
  (t_pinnacle, r_coo, 'Meeting effectiveness', '% of Pinnacle (L10) meetings ending with clear decisions and assigned owners (tracked via meeting close-out check)', NULL, p_nicole, 'Tracked in L10 workbook', 'Tier 1', 'quarterly', 'ELT L10 Workbook manual by Nicole', 'percentage', NULL, 'higher_is_better', '100%', 4),

  -- Administration
  (t_admin, r_vp_admin, 'Overhead', 'Agency overhead as % of AGI, measured monthly and averaged quarterly (target ≤ 60%)', NULL, p_michelle, 'Manual', 'Tier 1', 'monthly', 'Quickbooks, quick math', 'percentage', 60, 'lower_is_better', '≤ 60%', 5),
  (t_admin, r_vp_admin, 'Time-to-fill', 'Average number of days to fill priority roles, tracked in ELT workbook', NULL, p_michelle, 'Manual', 'Tier 1', 'quarterly', 'Easy to calculate', 'days', NULL, 'lower_is_better', 'Minimize days', 6),
  (t_admin, r_vp_admin, 'Reporting accuracy', '% of payroll, billing, and financial reporting completed on time with no material errors (quarterly yes/no)', NULL, p_michelle, 'Manual', 'Tier 1', 'monthly', 'Manual, monthly, track in sheets', 'percentage', 100, 'higher_is_better', '100%', 7),

  -- Marketing Solutions - VP Marketing
  (t_marketing, r_vp_marketing, 'Method adoption', '% of client engagements using defined methodology, based on quarterly roadmap/project audits', NULL, p_chelsea, 'How will this be tracked?', 'Tier 1', 'quarterly', 'Look at roadmaps — manual audit', 'percentage', NULL, 'higher_is_better', '100% adoption', 8),

  -- Business Development
  (t_bizdev, r_vp_sales, 'AGI', 'Actual Gross Income vs. projection targets for new and existing clients', NULL, p_nicole, 'Automate from Projections', 'Tier 1', 'monthly', 'Pull from Projections Row 297 Budget and Target', 'currency', NULL, 'higher_is_better', 'Meets projection', 9),
  (t_bizdev, r_vp_sales, 'CSAT', 'Average client satisfaction score from HubSpot surveys (target >1.75)', NULL, p_nicole, 'From HubSpot (Manual?)', 'Tier 1', 'monthly', 'HubSpot Report — filter CSAT and custom survey, monthly rating', 'score', 1.75, 'higher_is_better', '> 1.75', 10),
  (t_bizdev, r_dir_bizdev, 'New AGI', 'New business AGI generated vs. budget', NULL, p_nicole, 'Automate from Projections', 'Tier 1', 'monthly', 'Projections New business budget row 299', 'currency', NULL, 'higher_is_better', 'Meets budget', 11),
  (t_bizdev, r_dir_bizdev, 'Close rate', 'Program deal closing ratio from HubSpot Sales Dashboard (target >50%)', NULL, p_nicole, 'HubSpot Sales Dashboard', 'Tier 1', 'monthly', 'Closing ratio: deals won / (won + lost), program pipeline only', 'percentage', 50, 'higher_is_better', '> 50%', 12),

  -- Client Services
  (t_clients, r_strategist, 'Client AGI', 'AGI from assigned clients vs. projections', NULL, p_nicole, 'Manual or automate from Projections', 'Tier 1', 'monthly', 'Projections client services breakdown tab', 'currency', NULL, 'higher_is_better', 'Meets projection', 13),
  (t_clients, r_strategist, 'CSAT', 'Average HubSpot satisfaction score for assigned clients (target >1.75)', NULL, p_nicole, 'HubSpot (manual)', 'Tier 1', 'monthly', 'Segregated by strategist — create report', 'score', 1.75, 'higher_is_better', '> 1.75', 14),
  (t_clients, r_hubspot, 'Project success', '% of HubSpot projects delivered on time and within budget (target ≥ 95%)', NULL, p_chelsea, 'Productive', 'Tier 1', 'monthly', 'Productive project tracking', 'percentage', 95, 'higher_is_better', '≥ 95%', 15),

  -- Marketing Solutions - Dir Marketing
  (t_marketing, r_dir_marketing, 'SALs', 'Number of Sales Accepted Leads per quarter (HubSpot)', NULL, p_chelsea, 'HubSpot Dashboard', 'Tier 1', 'quarterly', 'Weidert easy', 'number', NULL, 'higher_is_better', 'Per quarter target', 16),
  (t_marketing, r_dir_marketing, 'Leads', 'Number of inbound leads per month (HubSpot)', NULL, p_chelsea, 'HubSpot Dashboard', 'Tier 1', 'monthly', 'Weidert easy', 'number', NULL, 'higher_is_better', 'Monthly target', 17),
  (t_marketing, r_dir_marketing, 'Branded search', 'Branded keyword search volume (Semrush)', NULL, p_chelsea, 'SEMRush', 'Tier 1', 'monthly', 'Weidert easy', 'number', NULL, 'higher_is_better', 'Growth target', 18),
  (t_marketing, r_dir_marketing, 'AI visibility', 'AI visibility score from Semrush', NULL, p_chelsea, 'SEMRush', 'Tier 1', 'monthly', 'Weidert easy', 'score', NULL, 'higher_is_better', 'Improve score', 19),

  -- Creative Services
  (t_creative, r_creative_dir, 'Rework', '% of revisions beyond scope attributable to creative quality (target ≤ 5%)', p_mike, p_jo, 'Productive', 'Tier 1', 'monthly', 'Tag in Productive: within/outside scope', 'percentage', 5, 'lower_is_better', '≤ 5%', 20),
  (t_creative, r_content_mgr, 'Throughput', 'Volume of content produced per period (tracked monthly)', p_vicki, p_jo, 'Productive', 'Tier 1', 'monthly', 'Completed Hours Estimated for content work', 'number', NULL, 'higher_is_better', 'Monthly volume', 21),

  -- Web Dev
  (t_webdev, r_web_dev, 'Utilization', 'Billable utilization rate vs. target', p_robert, p_jo, 'Productive', 'Tier 1', 'monthly', 'Expected billable hours by person in Productive', 'percentage', NULL, 'higher_is_better', 'Meets utilization target', 22);

END $$;

-- Sample metric entries for demo/dashboard visualization
INSERT INTO metric_entries (metric_id, period_start, period_end, actual_value, target_value, status, notes, entered_by)
SELECT
  m.id,
  '2025-01-01'::DATE,
  '2025-01-31'::DATE,
  CASE m.name
    WHEN 'Overhead' THEN 58.2
    WHEN 'CSAT' THEN 1.82
    WHEN 'Close rate' THEN 54.0
    WHEN 'Project success' THEN 96.5
    WHEN 'Rework' THEN 4.1
    WHEN 'Utilization' THEN 78.0
    WHEN 'Leads' THEN 142
    WHEN 'Reporting accuracy' THEN 100
    ELSE NULL
  END,
  m.target_value,
  CASE
    WHEN m.name = 'Overhead' AND 58.2 <= COALESCE(m.target_value, 60) THEN 'met'
    WHEN m.name = 'CSAT' AND 1.82 > COALESCE(m.target_value, 1.75) THEN 'met'
    WHEN m.name = 'Close rate' AND 54.0 > COALESCE(m.target_value, 50) THEN 'met'
    WHEN m.name = 'Project success' AND 96.5 >= COALESCE(m.target_value, 95) THEN 'met'
    WHEN m.name = 'Rework' AND 4.1 <= COALESCE(m.target_value, 5) THEN 'met'
    WHEN m.name = 'Utilization' THEN 'on_track'
    WHEN m.name = 'Leads' THEN 'on_track'
    WHEN m.name = 'Reporting accuracy' THEN 'met'
    ELSE 'pending'
  END,
  'Sample seed data',
  'System'
FROM metrics m
WHERE m.name IN ('Overhead', 'CSAT', 'Close rate', 'Project success', 'Rework', 'Utilization', 'Leads', 'Reporting accuracy');

INSERT INTO metric_entries (metric_id, period_start, period_end, actual_value, target_value, status, notes, entered_by)
SELECT
  m.id,
  '2025-02-01'::DATE,
  '2025-02-28'::DATE,
  CASE m.name
    WHEN 'Overhead' THEN 61.5
    WHEN 'CSAT' THEN 1.68
    WHEN 'Close rate' THEN 47.0
    WHEN 'Project success' THEN 93.0
    WHEN 'Rework' THEN 6.2
    WHEN 'Utilization' THEN 72.0
    WHEN 'Leads' THEN 118
    ELSE NULL
  END,
  m.target_value,
  CASE
    WHEN m.name = 'Overhead' AND 61.5 > COALESCE(m.target_value, 60) THEN 'not_met'
    WHEN m.name = 'CSAT' AND 1.68 < COALESCE(m.target_value, 1.75) THEN 'not_met'
    WHEN m.name = 'Close rate' AND 47.0 < COALESCE(m.target_value, 50) THEN 'not_met'
    WHEN m.name = 'Project success' AND 93.0 < COALESCE(m.target_value, 95) THEN 'at_risk'
    WHEN m.name = 'Rework' AND 6.2 > COALESCE(m.target_value, 5) THEN 'not_met'
    WHEN m.name = 'Utilization' THEN 'at_risk'
    WHEN m.name = 'Leads' THEN 'on_track'
    ELSE 'pending'
  END,
  'Sample seed data',
  'System'
FROM metrics m
WHERE m.name IN ('Overhead', 'CSAT', 'Close rate', 'Project success', 'Rework', 'Utilization', 'Leads');

INSERT INTO metric_entries (metric_id, period_start, period_end, actual_value, target_value, status, notes, entered_by)
SELECT
  m.id,
  '2025-03-01'::DATE,
  '2025-03-31'::DATE,
  CASE m.name
    WHEN 'Overhead' THEN 57.8
    WHEN 'CSAT' THEN 1.79
    WHEN 'Close rate' THEN 52.0
    WHEN 'Project success' THEN 97.0
    WHEN 'Rework' THEN 3.8
    WHEN 'Utilization' THEN 81.0
    WHEN 'Leads' THEN 156
    ELSE NULL
  END,
  m.target_value,
  CASE
    WHEN m.name = 'Overhead' AND 57.8 <= COALESCE(m.target_value, 60) THEN 'met'
    WHEN m.name = 'CSAT' AND 1.79 > COALESCE(m.target_value, 1.75) THEN 'met'
    WHEN m.name = 'Close rate' AND 52.0 > COALESCE(m.target_value, 50) THEN 'met'
    WHEN m.name = 'Project success' AND 97.0 >= COALESCE(m.target_value, 95) THEN 'met'
    WHEN m.name = 'Rework' AND 3.8 <= COALESCE(m.target_value, 5) THEN 'met'
    WHEN m.name = 'Utilization' THEN 'met'
    WHEN m.name = 'Leads' THEN 'met'
    ELSE 'pending'
  END,
  'Sample seed data',
  'System'
FROM metrics m
WHERE m.name IN ('Overhead', 'CSAT', 'Close rate', 'Project success', 'Rework', 'Utilization', 'Leads');
