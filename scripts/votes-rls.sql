-- Required for the real-time results chart to work.
-- The browser uses the Supabase ANON key (never the service key) to subscribe to
-- new rows in `votes` via Realtime. Anon key requests are governed by RLS, so:

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read vote rows (only candidate_id/session_id are exposed in the UI,
-- never which student cast which vote — the chart only aggregates counts).
CREATE POLICY "Public read access for vote counts"
  ON votes FOR SELECT
  USING (true);

-- No insert/update/delete policy is created for the anon role, so direct writes from
-- the browser are blocked. All vote writes go through the server API route using the
-- service role key, which bypasses RLS entirely.

-- Also enable Realtime broadcast for this table (run once per project):
-- In Supabase Dashboard: Database > Replication > toggle "votes" table ON.
