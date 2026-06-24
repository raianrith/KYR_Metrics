-- Period-specific targets (per month, quarter, or year)

CREATE TABLE metric_period_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_id UUID NOT NULL REFERENCES metrics(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  target_value NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(metric_id, period_start, period_end)
);

CREATE INDEX idx_metric_period_targets_metric ON metric_period_targets(metric_id);
CREATE INDEX idx_metric_period_targets_period ON metric_period_targets(period_start, period_end);

CREATE TRIGGER metric_period_targets_updated_at
  BEFORE UPDATE ON metric_period_targets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE metric_period_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read period targets" ON metric_period_targets FOR SELECT USING (true);
CREATE POLICY "Allow public insert period targets" ON metric_period_targets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update period targets" ON metric_period_targets FOR UPDATE USING (true);
CREATE POLICY "Allow public delete period targets" ON metric_period_targets FOR DELETE USING (true);
