-- Vedam Events Platform Schema

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Event status enum
CREATE TYPE event_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE event_mode AS ENUM ('online', 'offline', 'hybrid');
CREATE TYPE registration_status AS ENUM ('registered', 'waitlisted', 'attended', 'cancelled');
CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'viewer');

-- Admins table
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role admin_role NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  banner_url TEXT,
  event_type TEXT NOT NULL DEFAULT 'workshop',
  mode event_mode NOT NULL DEFAULT 'online',
  venue TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  seats INTEGER NOT NULL DEFAULT 100,
  registrations_count INTEGER NOT NULL DEFAULT 0,
  speaker_data JSONB DEFAULT '[]'::jsonb,
  schedule_data JSONB DEFAULT '[]'::jsonb,
  page_config JSONB DEFAULT '[]'::jsonb,
  learning_outcomes JSONB DEFAULT '[]'::jsonb,
  benefits JSONB DEFAULT '[]'::jsonb,
  who_should_attend JSONB DEFAULT '[]'::jsonb,
  faq_data JSONB DEFAULT '[]'::jsonb,
  testimonials_data JSONB DEFAULT '[]'::jsonb,
  whatsapp_community_link TEXT,
  whatsapp_group_link TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  tagline TEXT,
  duration_minutes INTEGER,
  status event_status NOT NULL DEFAULT 'draft',
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Registrations table
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attendee_id TEXT NOT NULL UNIQUE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  college TEXT,
  role TEXT,
  linkedin TEXT,
  city TEXT,
  reason TEXT,
  qr_code TEXT,
  status registration_status NOT NULL DEFAULT 'registered',
  whatsapp_clicked BOOLEAN NOT NULL DEFAULT false,
  whatsapp_clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, email)
);

-- Analytics events table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_featured ON events(is_featured);
CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE INDEX idx_registrations_attendee_id ON registrations(attendee_id);
CREATE INDEX idx_registrations_email ON registrations(email);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_analytics_event_id ON analytics_events(event_id);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Increment registration count
CREATE OR REPLACE FUNCTION increment_registration_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE events SET registrations_count = registrations_count + 1
  WHERE id = NEW.event_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_registration_insert
  AFTER INSERT ON registrations
  FOR EACH ROW EXECUTE FUNCTION increment_registration_count();

-- Decrement on cancel
CREATE OR REPLACE FUNCTION decrement_registration_count()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
    UPDATE events SET registrations_count = GREATEST(0, registrations_count - 1)
    WHERE id = NEW.event_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_registration_cancel
  AFTER UPDATE ON registrations
  FOR EACH ROW EXECUTE FUNCTION decrement_registration_count();

-- RLS Policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Public can read published events
CREATE POLICY "Public read published events" ON events
  FOR SELECT USING (status = 'published');

-- Admins full access to events
CREATE POLICY "Admins manage events" ON events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- Public can insert registrations for published events
CREATE POLICY "Public register for events" ON registrations
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM events WHERE id = event_id AND status = 'published')
  );

-- Public can read own registration by attendee_id (via service role in API)
CREATE POLICY "Admins manage registrations" ON registrations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins read analytics" ON analytics_events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Public insert analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins read admins" ON admins
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- Storage bucket for event banners
INSERT INTO storage.buckets (id, name, public) VALUES ('event-banners', 'event-banners', true);

CREATE POLICY "Public read banners" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-banners');

CREATE POLICY "Admins upload banners" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'event-banners' AND
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins update banners" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'event-banners' AND
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins delete banners" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'event-banners' AND
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );
