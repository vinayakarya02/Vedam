-- Event types catalog (admin-managed)
CREATE TABLE event_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_event_types_slug ON event_types(slug);
CREATE INDEX idx_event_types_active ON event_types(is_active);

CREATE TRIGGER event_types_updated_at
  BEFORE UPDATE ON event_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Per-event custom registration questions (JSON array)
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS registration_form_fields JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Custom answers + legacy field overflow
ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS form_responses JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Seed default event types
INSERT INTO event_types (slug, label, sort_order) VALUES
  ('webinar', 'Webinar', 1),
  ('bootcamp', 'AI Bootcamp', 2),
  ('masterclass', 'Masterclass', 3),
  ('meetup', 'Seek your Seniors', 4),
  ('founder-talk', 'Founder Talk', 5),
  ('campus-event', 'Campus Event', 6)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active event types" ON event_types
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins manage event types" ON event_types
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );
