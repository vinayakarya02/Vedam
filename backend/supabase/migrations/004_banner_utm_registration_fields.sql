-- UTM tracking on events (replaces WhatsApp group link usage)
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

-- Per-registration fields + user-level UTM snapshot
ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS passout_year_12th TEXT,
  ADD COLUMN IF NOT EXISTS stream_12th TEXT,
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS utm_content TEXT;
