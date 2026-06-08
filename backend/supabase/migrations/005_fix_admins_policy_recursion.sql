-- Fix: infinite recursion (Postgres 42P17) in RLS policy on "admins".
--
-- The original "Admins read admins" policy queried the admins table from
-- within its own USING clause:
--   EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
-- Evaluating the policy requires reading admins, which re-evaluates the
-- policy -> infinite recursion. This also broke unrelated reads (e.g. the
-- public /api/events query), because the events "Admins manage events"
-- FOR ALL policy is OR-evaluated on every read and itself probes admins.
--
-- Fix: let an admin read its own row by direct uid match, with no subquery
-- back into admins.

DROP POLICY IF EXISTS "Admins read admins" ON admins;

CREATE POLICY "Admins read own admin row" ON admins
  FOR SELECT USING (user_id = auth.uid());
