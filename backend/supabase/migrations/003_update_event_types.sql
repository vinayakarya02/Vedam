-- Remove deprecated event types and rename meetup
DELETE FROM event_types
WHERE slug IN ('workshop', 'hackathon', 'demo-day', 'career-session');

UPDATE event_types
SET label = 'Seek your Seniors', sort_order = 4
WHERE slug = 'meetup';

UPDATE event_types SET sort_order = 1 WHERE slug = 'webinar';
UPDATE event_types SET sort_order = 2 WHERE slug = 'bootcamp';
UPDATE event_types SET sort_order = 3 WHERE slug = 'masterclass';
UPDATE event_types SET sort_order = 5 WHERE slug = 'founder-talk';
UPDATE event_types SET sort_order = 6 WHERE slug = 'campus-event';

ALTER TABLE events ALTER COLUMN event_type SET DEFAULT 'webinar';
