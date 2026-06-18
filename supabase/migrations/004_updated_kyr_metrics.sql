-- Updated KYR metrics catalog (87 employee-metric rows)
-- Run after 001_schema.sql. Replaces prior metric definitions from 002/003.

INSERT INTO teams (name) VALUES
  ('Operations'),
  ('Design'),
  ('Paid Ads')
ON CONFLICT (name) DO NOTHING;

INSERT INTO people (name, is_supervisor) VALUES
  ('Greg', false),
  ('Michelle', true),
  ('Nicole', true),
  ('Chelsea', true),
  ('Jo', true),
  ('Frank', false),
  ('Reid', false),
  ('Amanda', false),
  ('Mary', false),
  ('Megan', false),
  ('Raian', false),
  ('Laura', false),
  ('Kelly', false),
  ('Brian L', false),
  ('Brent', false),
  ('Alice', false),
  ('Meg', false),
  ('Ana', false),
  ('Tim', false),
  ('Robert', false),
  ('Matt', false),
  ('Charles', false)
ON CONFLICT (name) DO NOTHING;

DELETE FROM metric_entries;
DELETE FROM metrics;

DO $$
DECLARE
  t_pinnacle UUID;
  t_administration UUID;
  t_marketing_solutions UUID;
  t_business_development UUID;
  t_creative_services UUID;
  t_client_services UUID;
  t_operations UUID;
  t_design UUID;
  t_web_dev UUID;
  t_paid_ads UUID;
  r_pinnacle_president_visionary UUID;
  r_pinnacle_coo_integrator UUID;
  r_administration_vp_admin UUID;
  r_marketing_solutions_vp_marketing_sales_solutions UUID;
  r_business_development_vp_sales_client_services UUID;
  r_creative_services_vp_creative_ops UUID;
  r_business_development_dir_biz_dev UUID;
  r_client_services_strategist UUID;
  r_client_services_csm UUID;
  r_marketing_solutions_dir_marketing UUID;
  r_marketing_solutions_data_analyst UUID;
  r_client_services_hubspot_consultant UUID;
  r_operations_dir_operations UUID;
  r_creative_services_creative_director UUID;
  r_design_dir_design_tech UUID;
  r_design_visual_designer UUID;
  r_creative_services_content_manager UUID;
  r_web_dev_web_dev_manager UUID;
  r_web_dev_web_pm UUID;
  r_web_dev_web_developer UUID;
  r_design_video_producer UUID;
  r_paid_ads_paid_ads_manager UUID;
  p_greg UUID;
  p_michelle UUID;
  p_nicole UUID;
  p_chelsea UUID;
  p_jo UUID;
  p_frank UUID;
  p_reid UUID;
  p_amanda UUID;
  p_mary UUID;
  p_megan UUID;
  p_raian UUID;
  p_laura UUID;
  p_kelly UUID;
  p_brian_l UUID;
  p_brent UUID;
  p_alice UUID;
  p_meg UUID;
  p_ana UUID;
  p_tim UUID;
  p_robert UUID;
  p_matt UUID;
  p_charles UUID;
BEGIN
  SELECT id INTO t_pinnacle FROM teams WHERE name = 'Pinnacle';
  SELECT id INTO t_administration FROM teams WHERE name = 'Administration';
  SELECT id INTO t_marketing_solutions FROM teams WHERE name = 'Marketing Solutions';
  SELECT id INTO t_business_development FROM teams WHERE name = 'Business Development';
  SELECT id INTO t_creative_services FROM teams WHERE name = 'Creative Services';
  SELECT id INTO t_client_services FROM teams WHERE name = 'Client Services';
  SELECT id INTO t_operations FROM teams WHERE name = 'Operations';
  SELECT id INTO t_design FROM teams WHERE name = 'Design';
  SELECT id INTO t_web_dev FROM teams WHERE name = 'Web Dev';
  SELECT id INTO t_paid_ads FROM teams WHERE name = 'Paid Ads';

  INSERT INTO roles (team_id, name) VALUES (t_pinnacle, 'President & Visionary') ON CONFLICT (team_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO r_pinnacle_president_visionary;
  INSERT INTO roles (team_id, name) VALUES (t_pinnacle, 'COO & Integrator') ON CONFLICT (team_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO r_pinnacle_coo_integrator;
  INSERT INTO roles (team_id, name) VALUES (t_administration, 'VP Admin') ON CONFLICT (team_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO r_administration_vp_admin;
  INSERT INTO roles (team_id, name) VALUES (t_marketing_solutions, 'VP Marketing & Sales Solutions') ON CONFLICT (team_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO r_marketing_solutions_vp_marketing_sales_solutions;
  INSERT INTO roles (team_id, name) VALUES (t_business_development, 'VP Sales/Client Services') ON CONFLICT (team_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO r_business_development_vp_sales_client_services;
  INSERT INTO roles (team_id, name) VALUES (t_creative_services, 'VP Creative Ops') ON CONFLICT (team_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO r_creative_services_vp_creative_ops;
  INSERT INTO roles (team_id, name) VALUES (t_business_development, 'Dir Biz Dev') ON CONFLICT (team_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO r_business_development_dir_biz_dev;
  INSERT INTO roles (team_id, name) VALUES (t_client_services, 'Strategist') ON CONFLICT (team_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO r_client_services_strategist;
  INSERT INTO roles (team_id, name) VALUES (t_client_services, 'CSM') ON CONFLICT (team_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO r_client_services_csm;
  INSERT INTO roles (team_id, name) VALUES (t_marketing_solutions, 'Dir Marketing') ON CONFLICT (team_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO r_marketing_solutions_dir_marketing;
  INSERT INTO roles (team_id, name) VALUES (t_marketing_solutions, 'Data Analyst') ON CONFLICT (team_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO r_marketing_solutions_data_analyst;
  INSERT INTO roles (team_id, name) VALUES (t_client_services, 'HubSpot Consultant') ON CONFLICT (team_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO r_client_services_hubspot_consultant;
  INSERT INTO roles (team_id, name) VALUES (t_operations, 'Dir Operations') ON CONFLICT (team_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO r_operations_dir_operations;
  INSERT INTO roles (team_id, name) VALUES (t_creative_services, 'Creative Director') ON CONFLICT (team_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO r_creative_services_creative_director;
  INSERT INTO roles (team_id, name) VALUES (t_design, 'Dir Design & Tech') ON CONFLICT (team_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO r_design_dir_design_tech;
  INSERT INTO roles (team_id, name) VALUES (t_design, 'Visual Designer') ON CONFLICT (team_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO r_design_visual_designer;
  INSERT INTO roles (team_id, name) VALUES (t_creative_services, 'Content Manager') ON CONFLICT (team_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO r_creative_services_content_manager;
  INSERT INTO roles (team_id, name) VALUES (t_web_dev, 'Web Dev Manager') ON CONFLICT (team_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO r_web_dev_web_dev_manager;
  INSERT INTO roles (team_id, name) VALUES (t_web_dev, 'Web PM') ON CONFLICT (team_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO r_web_dev_web_pm;
  INSERT INTO roles (team_id, name) VALUES (t_web_dev, 'Web Developer') ON CONFLICT (team_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO r_web_dev_web_developer;
  INSERT INTO roles (team_id, name) VALUES (t_design, 'Video Producer') ON CONFLICT (team_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO r_design_video_producer;
  INSERT INTO roles (team_id, name) VALUES (t_paid_ads, 'Paid Ads Manager') ON CONFLICT (team_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO r_paid_ads_paid_ads_manager;

  SELECT id INTO p_greg FROM people WHERE name = 'Greg';
  SELECT id INTO p_michelle FROM people WHERE name = 'Michelle';
  SELECT id INTO p_nicole FROM people WHERE name = 'Nicole';
  SELECT id INTO p_chelsea FROM people WHERE name = 'Chelsea';
  SELECT id INTO p_jo FROM people WHERE name = 'Jo';
  SELECT id INTO p_frank FROM people WHERE name = 'Frank';
  SELECT id INTO p_reid FROM people WHERE name = 'Reid';
  SELECT id INTO p_amanda FROM people WHERE name = 'Amanda';
  SELECT id INTO p_mary FROM people WHERE name = 'Mary';
  SELECT id INTO p_megan FROM people WHERE name = 'Megan';
  SELECT id INTO p_raian FROM people WHERE name = 'Raian';
  SELECT id INTO p_laura FROM people WHERE name = 'Laura';
  SELECT id INTO p_kelly FROM people WHERE name = 'Kelly';
  SELECT id INTO p_brian_l FROM people WHERE name = 'Brian L';
  SELECT id INTO p_brent FROM people WHERE name = 'Brent';
  SELECT id INTO p_alice FROM people WHERE name = 'Alice';
  SELECT id INTO p_meg FROM people WHERE name = 'Meg';
  SELECT id INTO p_ana FROM people WHERE name = 'Ana';
  SELECT id INTO p_tim FROM people WHERE name = 'Tim';
  SELECT id INTO p_robert FROM people WHERE name = 'Robert';
  SELECT id INTO p_matt FROM people WHERE name = 'Matt';
  SELECT id INTO p_charles FROM people WHERE name = 'Charles';

  INSERT INTO metrics (team_id, role_id, name, definition, owner_id, department_owner_id, tier, cadence, value_type, target_value, target_direction, target_label, sort_order) VALUES
  (t_pinnacle, r_pinnacle_president_visionary, 'Free Cash Flow', 'Success = Free Cash Flow meets or exceeds target', p_greg, p_michelle, 'Tier 1', 'monthly'::cadence_type, 'currency'::metric_value_type, NULL, 'higher_is_better'::target_direction, 'Meets or exceeds target', 1),
  (t_pinnacle, r_pinnacle_president_visionary, 'ESOP Share Value', 'Annual ESOP valuation from 3rd-party firm; success = share value meets or exceeds target', p_greg, p_michelle, 'Tier 1', 'annual'::cadence_type, 'currency'::metric_value_type, NULL, 'higher_is_better'::target_direction, 'Meets or exceeds target', 2),
  (t_pinnacle, r_pinnacle_coo_integrator, 'Growth milestones', '% of agency-wide rocks completed on time, calculated quarterly', p_nicole, p_nicole, 'Tier 1', 'quarterly'::cadence_type, 'percentage'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 3),
  (t_pinnacle, r_pinnacle_coo_integrator, 'Meeting effectiveness', '% of Pinnacle (L10) meetings ending with clear decisions and assigned owners (tracked via meeting close-out check)', p_nicole, p_nicole, 'Tier 1', 'quarterly'::cadence_type, 'percentage'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 4),
  (t_administration, r_administration_vp_admin, 'Overhead', 'Agency overhead as % of AGI, measured monthly and averaged quarterly (target ≤ 60%)', p_michelle, p_michelle, 'Tier 1', 'monthly'::cadence_type, 'percentage'::metric_value_type, 60, 'lower_is_better'::target_direction, '≤ 60%', 5),
  (t_administration, r_administration_vp_admin, 'Time-to-fill', 'Average number of days to fill priority roles, tracked in ELT workbook', p_michelle, p_michelle, 'Tier 1', 'quarterly'::cadence_type, 'days'::metric_value_type, NULL, 'lower_is_better'::target_direction, NULL, 6),
  (t_administration, r_administration_vp_admin, 'Reporting accuracy', '% of payroll, billing, and financial reporting completed on time with no material errors (quarterly yes/no)', p_michelle, p_michelle, 'Tier 1', 'monthly'::cadence_type, 'percentage'::metric_value_type, 100, 'higher_is_better'::target_direction, '100%', 7),
  (t_marketing_solutions, r_marketing_solutions_vp_marketing_sales_solutions, 'Method adoption', '% of client engagements using defined methodology, based on quarterly roadmap/project audits', p_chelsea, p_chelsea, 'Tier 1', 'quarterly'::cadence_type, 'percentage'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 8),
  (t_marketing_solutions, r_marketing_solutions_vp_marketing_sales_solutions, 'Revenue via solutions', '% of new revenue sold using approved solutions, scopes, and pricing models (measured at closed-won)', p_chelsea, p_chelsea, 'Tier 2', 'monthly'::cadence_type, 'percentage'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 9),
  (t_marketing_solutions, r_marketing_solutions_vp_marketing_sales_solutions, 'Client KPI success', '% of clients achieving defined performance KPIs based on internal dashboards (measured quarterly)', p_chelsea, p_chelsea, 'Tier 3', 'quarterly'::cadence_type, 'percentage'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 10),
  (t_business_development, r_business_development_vp_sales_client_services, 'AGI', 'Actual Gross Income vs. projection targets for new and existing clients', p_nicole, p_nicole, 'Tier 1', 'monthly'::cadence_type, 'currency'::metric_value_type, NULL, 'higher_is_better'::target_direction, 'Meets projection', 11),
  (t_business_development, r_business_development_vp_sales_client_services, 'CSAT', 'Average client satisfaction score from HubSpot surveys (target >1.75)', p_nicole, p_nicole, 'Tier 1', 'monthly'::cadence_type, 'score'::metric_value_type, 1.75, 'higher_is_better'::target_direction, '> 1.75', 12),
  (t_creative_services, r_creative_services_vp_creative_ops, 'On-time', '% of creative and implementation work delivered on or before deadline (target ≥ 90%)', p_jo, p_jo, 'Tier 3', 'monthly'::cadence_type, 'percentage'::metric_value_type, 90, 'higher_is_better'::target_direction, '≥ 90%', 13),
  (t_creative_services, r_creative_services_vp_creative_ops, 'Scope adherence', '% of projects completed within scoped hours, excluding approved change orders (target ≥ 90%)', p_jo, p_jo, 'Tier 3', 'monthly'::cadence_type, 'percentage'::metric_value_type, 90, 'higher_is_better'::target_direction, '≥ 90%', 14),
  (t_creative_services, r_creative_services_vp_creative_ops, 'Rework', '% of client rework attributable to system/process failure (target ≤ 5%)', p_jo, p_jo, 'Tier 3', 'monthly'::cadence_type, 'percentage'::metric_value_type, 5, 'lower_is_better'::target_direction, '≤ 5%', 15),
  (t_creative_services, r_creative_services_vp_creative_ops, 'Margin variance', 'Variance between actual and target margin across Creative, Web, and Paid services', p_jo, p_jo, 'Tier 3', 'quarterly'::cadence_type, 'percentage'::metric_value_type, NULL, 'lower_is_better'::target_direction, NULL, 16),
  (t_business_development, r_business_development_dir_biz_dev, 'New AGI', 'New business AGI generated vs. budget', p_frank, p_nicole, 'Tier 1', 'monthly'::cadence_type, 'currency'::metric_value_type, NULL, 'higher_is_better'::target_direction, 'Meets budget', 17),
  (t_business_development, r_business_development_dir_biz_dev, 'Close rate', 'Program deal closing ratio from HubSpot Sales Dashboard (target >50%)', p_frank, p_nicole, 'Tier 1', 'monthly'::cadence_type, 'percentage'::metric_value_type, 50, 'higher_is_better'::target_direction, '> 50%', 18),
  (t_client_services, r_client_services_strategist, 'Client AGI', 'AGI from assigned clients vs. projections', p_reid, p_nicole, 'Tier 1', 'monthly'::cadence_type, 'currency'::metric_value_type, NULL, 'higher_is_better'::target_direction, 'Meets projection', 19),
  (t_client_services, r_client_services_strategist, 'Client success', '% of assigned clients achieving defined strategic success metrics', p_reid, p_nicole, 'Tier 3', 'quarterly'::cadence_type, 'percentage'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 20),
  (t_client_services, r_client_services_strategist, 'CSAT', 'Average HubSpot satisfaction score for assigned clients (target >1.75)', p_reid, p_nicole, 'Tier 1', 'monthly'::cadence_type, 'score'::metric_value_type, 1.75, 'higher_is_better'::target_direction, '> 1.75', 21),
  (t_client_services, r_client_services_strategist, 'Client AGI', 'AGI from assigned clients vs. projections', p_amanda, p_nicole, 'Tier 1', 'monthly'::cadence_type, 'currency'::metric_value_type, NULL, 'higher_is_better'::target_direction, 'Meets projection', 22),
  (t_client_services, r_client_services_strategist, 'Client success', '% of assigned clients achieving defined strategic success metrics', p_amanda, p_nicole, 'Tier 3', 'quarterly'::cadence_type, 'percentage'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 23),
  (t_client_services, r_client_services_strategist, 'CSAT', 'Average HubSpot satisfaction score for assigned clients (target >1.75)', p_amanda, p_nicole, 'Tier 1', 'monthly'::cadence_type, 'score'::metric_value_type, 1.75, 'higher_is_better'::target_direction, '> 1.75', 24),
  (t_client_services, r_client_services_strategist, 'Client AGI', 'AGI from assigned clients vs. projections', p_chelsea, p_nicole, 'Tier 1', 'monthly'::cadence_type, 'currency'::metric_value_type, NULL, 'higher_is_better'::target_direction, 'Meets projection', 25),
  (t_client_services, r_client_services_strategist, 'Client success', '% of assigned clients achieving defined strategic success metrics', p_chelsea, p_nicole, 'Tier 3', 'quarterly'::cadence_type, 'percentage'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 26),
  (t_client_services, r_client_services_strategist, 'CSAT', 'Average HubSpot satisfaction score for assigned clients (target >1.75)', p_chelsea, p_nicole, 'Tier 1', 'monthly'::cadence_type, 'score'::metric_value_type, 1.75, 'higher_is_better'::target_direction, '> 1.75', 27),
  (t_client_services, r_client_services_strategist, 'Client AGI', 'AGI from assigned clients vs. projections', p_nicole, p_nicole, 'Tier 1', 'monthly'::cadence_type, 'currency'::metric_value_type, NULL, 'higher_is_better'::target_direction, 'Meets projection', 28),
  (t_client_services, r_client_services_strategist, 'Client success', '% of assigned clients achieving defined strategic success metrics', p_nicole, p_nicole, 'Tier 3', 'quarterly'::cadence_type, 'percentage'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 29),
  (t_client_services, r_client_services_strategist, 'CSAT', 'Average HubSpot satisfaction score for assigned clients (target >1.75)', p_nicole, p_nicole, 'Tier 1', 'monthly'::cadence_type, 'score'::metric_value_type, 1.75, 'higher_is_better'::target_direction, '> 1.75', 30),
  (t_client_services, r_client_services_strategist, 'Client AGI', 'AGI from assigned clients vs. projections', p_frank, p_nicole, 'Tier 1', 'monthly'::cadence_type, 'currency'::metric_value_type, NULL, 'higher_is_better'::target_direction, 'Meets projection', 31),
  (t_client_services, r_client_services_strategist, 'Client success', '% of assigned clients achieving defined strategic success metrics', p_frank, p_nicole, 'Tier 3', 'quarterly'::cadence_type, 'percentage'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 32),
  (t_client_services, r_client_services_strategist, 'CSAT', 'Average HubSpot satisfaction score for assigned clients (target >1.75)', p_frank, p_nicole, 'Tier 1', 'monthly'::cadence_type, 'score'::metric_value_type, 1.75, 'higher_is_better'::target_direction, '> 1.75', 33),
  (t_client_services, r_client_services_strategist, 'Client AGI', 'AGI from assigned clients vs. projections', p_mary, p_nicole, 'Tier 1', 'monthly'::cadence_type, 'currency'::metric_value_type, NULL, 'higher_is_better'::target_direction, 'Meets projection', 34),
  (t_client_services, r_client_services_strategist, 'Client success', '% of assigned clients achieving defined strategic success metrics', p_mary, p_nicole, 'Tier 3', 'quarterly'::cadence_type, 'percentage'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 35),
  (t_client_services, r_client_services_strategist, 'CSAT', 'Average HubSpot satisfaction score for assigned clients (target >1.75)', p_mary, p_nicole, 'Tier 1', 'monthly'::cadence_type, 'score'::metric_value_type, 1.75, 'higher_is_better'::target_direction, '> 1.75', 36),
  (t_client_services, r_client_services_csm, 'Delivery', '% of work delivered on time and within approved scope/budget (based on closed projects)', p_megan, p_nicole, 'Tier 2', 'monthly'::cadence_type, 'percentage'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 37),
  (t_client_services, r_client_services_csm, 'Inputs readiness', '% of work released to implementation with complete inputs and required lead time', p_megan, p_nicole, 'Tier 3', 'monthly'::cadence_type, 'percentage'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 38),
  (t_client_services, r_client_services_csm, 'Delivery', '% of work delivered on time and within approved scope/budget (based on closed projects)', p_mary, p_nicole, 'Tier 2', 'monthly'::cadence_type, 'percentage'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 39),
  (t_client_services, r_client_services_csm, 'Inputs readiness', '% of work released to implementation with complete inputs and required lead time', p_mary, p_nicole, 'Tier 3', 'monthly'::cadence_type, 'percentage'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 40),
  (t_client_services, r_client_services_csm, 'Delivery', '% of work delivered on time and within approved scope/budget (based on closed projects)', p_raian, p_nicole, 'Tier 2', 'monthly'::cadence_type, 'percentage'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 41),
  (t_client_services, r_client_services_csm, 'Inputs readiness', '% of work released to implementation with complete inputs and required lead time', p_raian, p_nicole, 'Tier 3', 'monthly'::cadence_type, 'percentage'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 42),
  (t_client_services, r_client_services_csm, 'Delivery', '% of work delivered on time and within approved scope/budget (based on closed projects)', p_laura, p_nicole, 'Tier 2', 'monthly'::cadence_type, 'percentage'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 43),
  (t_client_services, r_client_services_csm, 'Inputs readiness', '% of work released to implementation with complete inputs and required lead time', p_laura, p_nicole, 'Tier 3', 'monthly'::cadence_type, 'percentage'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 44),
  (t_marketing_solutions, r_marketing_solutions_dir_marketing, 'SALs', 'Number of Sales Accepted Leads per quarter (HubSpot)', p_kelly, p_chelsea, 'Tier 1', 'quarterly'::cadence_type, 'number'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 45),
  (t_marketing_solutions, r_marketing_solutions_dir_marketing, 'Leads', 'Number of inbound leads per month (HubSpot)', p_kelly, p_chelsea, 'Tier 1', 'monthly'::cadence_type, 'number'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 46),
  (t_marketing_solutions, r_marketing_solutions_dir_marketing, 'Branded search', 'Branded keyword search volume (Semrush)', p_kelly, p_chelsea, 'Tier 1', 'monthly'::cadence_type, 'number'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 47),
  (t_marketing_solutions, r_marketing_solutions_dir_marketing, 'AI visibility', 'AI visibility score from Semrush', p_kelly, p_chelsea, 'Tier 1', 'monthly'::cadence_type, 'score'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 48),
  (t_marketing_solutions, r_marketing_solutions_data_analyst, 'Dashboards', '% of clients with internal health dashboards fully set up (tracked monthly toward 100%)', p_raian, p_chelsea, 'Tier 3', 'monthly'::cadence_type, 'percentage'::metric_value_type, 100, 'higher_is_better'::target_direction, '100%', 49),
  (t_marketing_solutions, r_marketing_solutions_data_analyst, 'Labor reduction', 'Reduction in human labor hours from automation, based on workflow/template hour changes', p_raian, p_chelsea, 'Tier 2', 'quarterly'::cadence_type, 'percentage'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 50),
  (t_client_services, r_client_services_hubspot_consultant, 'Project success', '% of HubSpot projects delivered on time and within budget (target ≥ 95%)', p_brian_l, p_chelsea, 'Tier 1', 'monthly'::cadence_type, 'percentage'::metric_value_type, 95, 'higher_is_better'::target_direction, '≥ 95%', 51),
  (t_client_services, r_client_services_hubspot_consultant, 'Knowledge adoption', 'Level of HubSpot knowledge adoption across team (measured via survey or usage metrics)', p_brian_l, p_chelsea, 'Tier 3', 'quarterly'::cadence_type, 'score'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 52),
  (t_operations, r_operations_dir_operations, 'Intake speed', '% of work moving from intake → assigned → scheduled within 2 business days (target ≥ 95%)', p_laura, p_jo, 'Tier 3', 'monthly'::cadence_type, 'percentage'::metric_value_type, 95, 'higher_is_better'::target_direction, '≥ 95%', 53),
  (t_operations, r_operations_dir_operations, 'Capacity utilization', '% alignment of production capacity to target utilization ranges across teams', p_laura, p_jo, 'Tier 3', 'monthly'::cadence_type, 'percentage'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 54),
  (t_operations, r_operations_dir_operations, 'Task completion', '% of scheduled production tasks completed per sprint/month (target ≥ 95%)', p_laura, p_jo, 'Tier 2', 'monthly'::cadence_type, 'percentage'::metric_value_type, 95, 'higher_is_better'::target_direction, '≥ 95%', 55),
  (t_operations, r_operations_dir_operations, 'Forecast accuracy', 'Variance between planned vs. actual capacity utilization', p_laura, p_jo, 'Tier 2', 'quarterly'::cadence_type, 'percentage'::metric_value_type, NULL, 'lower_is_better'::target_direction, NULL, 56),
  (t_creative_services, r_creative_services_creative_director, 'Rework', '% of revisions beyond scope attributable to creative quality (target ≤ 5%)', NULL, p_jo, 'Tier 1', 'monthly'::cadence_type, 'percentage'::metric_value_type, 5, 'lower_is_better'::target_direction, '≤ 5%', 57),
  (t_creative_services, r_creative_services_creative_director, 'On-time', '% of design and video work delivered on time and within budget (target ≥ 95%)', NULL, p_jo, 'Tier 2', 'monthly'::cadence_type, 'percentage'::metric_value_type, 95, 'higher_is_better'::target_direction, '≥ 95%', 58),
  (t_creative_services, r_creative_services_creative_director, 'Margin', 'Variance between actual and target margin for design and video work', NULL, p_jo, 'Tier 3', 'quarterly'::cadence_type, 'percentage'::metric_value_type, NULL, 'lower_is_better'::target_direction, NULL, 59),
  (t_creative_services, r_creative_services_creative_director, 'Skill growth', 'Documented improvement in team capabilities against defined annual goals', NULL, p_jo, 'NA', 'annual'::cadence_type, 'boolean'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 60),
  (t_design, r_design_dir_design_tech, 'Rework', '% of revision rounds beyond scoped work (target ≤ 5%)', p_brent, p_jo, 'Unassigned', 'monthly'::cadence_type, 'percentage'::metric_value_type, 5, 'lower_is_better'::target_direction, '≤ 5%', 61),
  (t_design, r_design_dir_design_tech, 'On-time', '% of production art and web build work delivered on time (target ≥ 95%)', p_brent, p_jo, 'Unassigned', 'monthly'::cadence_type, 'percentage'::metric_value_type, 95, 'higher_is_better'::target_direction, '≥ 95%', 62),
  (t_design, r_design_visual_designer, 'On-time', '% of deliverables completed by deadline (target ≥ 95%)', p_alice, p_jo, 'Unassigned', 'monthly'::cadence_type, 'percentage'::metric_value_type, 95, 'higher_is_better'::target_direction, '≥ 95%', 63),
  (t_design, r_design_visual_designer, 'Hours adherence', '% of work completed within scoped hours (target ≥ 95%)', p_alice, p_jo, 'Unassigned', 'monthly'::cadence_type, 'percentage'::metric_value_type, 95, 'higher_is_better'::target_direction, '≥ 95%', 64),
  (t_creative_services, r_creative_services_content_manager, 'On-time', '% of content delivered on time (target ≥ 95%)', p_meg, p_jo, 'Unassigned', 'monthly'::cadence_type, 'percentage'::metric_value_type, 95, 'higher_is_better'::target_direction, '≥ 95%', 65),
  (t_creative_services, r_creative_services_content_manager, 'Rework', '% of revision cycles beyond scope (target ≤ 5%)', p_meg, p_jo, 'Unassigned', 'monthly'::cadence_type, 'percentage'::metric_value_type, 5, 'lower_is_better'::target_direction, '≤ 5%', 66),
  (t_creative_services, r_creative_services_content_manager, 'Throughput', 'Volume of content produced per period (tracked monthly)', p_meg, p_jo, 'Tier 1', 'monthly'::cadence_type, 'number'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 67),
  (t_creative_services, r_creative_services_content_manager, 'On-time', '% of content delivered on time (target ≥ 95%)', p_jo, p_jo, 'Unassigned', 'monthly'::cadence_type, 'percentage'::metric_value_type, 95, 'higher_is_better'::target_direction, '≥ 95%', 68),
  (t_creative_services, r_creative_services_content_manager, 'Rework', '% of revision cycles beyond scope (target ≤ 5%)', p_jo, p_jo, 'Unassigned', 'monthly'::cadence_type, 'percentage'::metric_value_type, 5, 'lower_is_better'::target_direction, '≤ 5%', 69),
  (t_creative_services, r_creative_services_content_manager, 'Throughput', 'Volume of content produced per period (tracked monthly)', p_jo, p_jo, 'Tier 1', 'monthly'::cadence_type, 'number'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 70),
  (t_web_dev, r_web_dev_web_dev_manager, 'Budget', '% of projects completed within budget (excluding approved change orders) (target ≥ 90%)', p_ana, p_jo, 'Unassigned', 'monthly'::cadence_type, 'percentage'::metric_value_type, 90, 'higher_is_better'::target_direction, '≥ 90%', 71),
  (t_web_dev, r_web_dev_web_dev_manager, 'Rework', '% of revisions beyond scope due to technical issues (target ≤ 5%)', p_ana, p_jo, 'Unassigned', 'monthly'::cadence_type, 'percentage'::metric_value_type, 5, 'lower_is_better'::target_direction, '≤ 5%', 72),
  (t_web_dev, r_web_dev_web_pm, 'On-time', '% of projects delivered on schedule (target ≥ 85%)', p_tim, p_jo, 'Tier 2', 'monthly'::cadence_type, 'percentage'::metric_value_type, 85, 'higher_is_better'::target_direction, '≥ 85%', 73),
  (t_web_dev, r_web_dev_web_pm, 'Change control', '% of scope changes properly documented and approved (target ≥ 95%)', p_tim, p_jo, 'Tier 2', 'monthly'::cadence_type, 'percentage'::metric_value_type, 95, 'higher_is_better'::target_direction, '≥ 95%', 74),
  (t_web_dev, r_web_dev_web_pm, 'Phase readiness', '% of projects meeting defined phase gate requirements (target ≥ 95%)', p_tim, p_jo, 'Tier 2', 'monthly'::cadence_type, 'percentage'::metric_value_type, 95, 'higher_is_better'::target_direction, '≥ 95%', 75),
  (t_web_dev, r_web_dev_web_developer, 'Utilization', 'Billable utilization rate vs. target', p_robert, p_jo, 'Tier 1', 'monthly'::cadence_type, 'percentage'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 76),
  (t_web_dev, r_web_dev_web_developer, 'On-time', '% of tasks completed on time (target ≥ 90%)', p_robert, p_jo, 'Unassigned', 'monthly'::cadence_type, 'percentage'::metric_value_type, 90, 'higher_is_better'::target_direction, '≥ 90%', 77),
  (t_web_dev, r_web_dev_web_developer, 'Defects', '% of work requiring fixes/rework (target ≤ 5%)', p_robert, p_jo, 'Unassigned', 'monthly'::cadence_type, 'percentage'::metric_value_type, 5, 'lower_is_better'::target_direction, '≤ 5%', 78),
  (t_web_dev, r_web_dev_web_developer, 'Utilization', 'Billable utilization rate vs. target', p_ana, p_jo, 'Tier 1', 'monthly'::cadence_type, 'percentage'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 79),
  (t_web_dev, r_web_dev_web_developer, 'On-time', '% of tasks completed on time (target ≥ 90%)', p_ana, p_jo, 'Unassigned', 'monthly'::cadence_type, 'percentage'::metric_value_type, 90, 'higher_is_better'::target_direction, '≥ 90%', 80),
  (t_web_dev, r_web_dev_web_developer, 'Defects', '% of work requiring fixes/rework (target ≤ 5%)', p_ana, p_jo, 'Unassigned', 'monthly'::cadence_type, 'percentage'::metric_value_type, 5, 'lower_is_better'::target_direction, '≤ 5%', 81),
  (t_design, r_design_video_producer, 'On-time', '% of video assets delivered on time (target ≥ 95%)', p_matt, p_jo, 'Unassigned', 'monthly'::cadence_type, 'percentage'::metric_value_type, 95, 'higher_is_better'::target_direction, '≥ 95%', 82),
  (t_design, r_design_video_producer, 'Hours', '% of videos completed within scoped hours', p_matt, p_jo, 'Unassigned', 'monthly'::cadence_type, 'percentage'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 83),
  (t_design, r_design_video_producer, 'Revisions', '% of revision cycles beyond scope (target ≤ 5%)', p_matt, p_jo, 'Unassigned', 'monthly'::cadence_type, 'percentage'::metric_value_type, 5, 'lower_is_better'::target_direction, '≤ 5%', 84),
  (t_paid_ads, r_paid_ads_paid_ads_manager, 'Performance', '% of accounts meeting or exceeding defined performance benchmarks', p_charles, p_jo, 'Unassigned', 'monthly'::cadence_type, 'percentage'::metric_value_type, NULL, 'higher_is_better'::target_direction, NULL, 85),
  (t_paid_ads, r_paid_ads_paid_ads_manager, 'Delivery', '% of paid ads work delivered on time and within scope (target ≥ 95%)', p_charles, p_jo, 'Unassigned', 'monthly'::cadence_type, 'percentage'::metric_value_type, 95, 'higher_is_better'::target_direction, '≥ 95%', 86),
  (t_paid_ads, r_paid_ads_paid_ads_manager, 'Margin', 'Variance between actual and target margin for paid media services', p_charles, p_jo, 'Unassigned', 'quarterly'::cadence_type, 'percentage'::metric_value_type, NULL, 'lower_is_better'::target_direction, NULL, 87);
END $$;
