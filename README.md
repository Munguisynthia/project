# Voting System — Full Stack

Next.js 14 (App Router) + Supabase + Brevo. Covers all four roles: System Admin,
School Admin, Candidates, and Students.

## Setup

1. `npm install`
2. Run these SQL files in the Supabase SQL editor, in order:
   - your original schema
   - `scripts/extra-tables.sql` (verification tokens)
   - `scripts/otp-table.sql` (student OTP codes)
   - `scripts/votes-rls.sql` (enables the real-time results chart)
3. Copy `.env.example` to `.env.local` and fill in real values.
4. Seed your system admin: `npm run seed:admin -- you@example.com yourpassword`
5. In Supabase Dashboard, Database, Replication, turn on Realtime for the `votes` table.
6. `npm run dev`

## Full page map

### System admin (you)
- `/sysadmin/login`, `/sysadmin/dashboard`, `/sysadmin/schools/new`, `/sysadmin/schools/[id]`

### School admin
- `/admin/setup?token=...` — consumes the email link, sets a password, activates the school
- `/admin/login`, `/admin/dashboard`
- `/admin/students` — add students (sends them a login link email)
- `/admin/candidates` — add candidates (sends them a pitch-submission link)
- `/admin/sessions`, `/admin/sessions/new`, `/admin/sessions/[id]/edit`, `/admin/sessions/[id]/results`

### Candidate (no login — token link only)
- `/candidate/verify/[token]` — submit pitch + photo URL

### Student
- `/login` — email + student ID, then OTP, then dashboard
- `/dashboard` — ongoing / upcoming / completed sessions
- `/sessions/[id]/vote` — pick candidate, review, confirm, congratulations email
- `/sessions/[id]/results` — real-time bar chart (Supabase Realtime, grouped by position)
- `/account` — profile + voting history

### Shared
- `/` — landing page with all three login entry points
- `/unauthorized` — generic access-denied page

## How the pieces connect

- Tokens: `verification_tokens` table is reused for `school_setup`, `student_login_link`,
  and `candidate_pitch`, all expire and are single-use (`consumeToken` in `lib/tokens.ts`).
- OTP: separate `otp_codes` table, 10-minute expiry, single-use, tied to a student.
- Sessions: three independent JWT cookies (`sysadmin_session`, `school_admin_session`,
  `student_session`), built from the same factory in `lib/sessionFactory.ts`.
  `middleware.ts` checks the right cookie per route prefix.
- Real-time results: the browser uses the anon key (`lib/supabaseBrowser.ts`) to subscribe
  to new rows in `votes`, never to write. All writes go through API routes using the
  service role key, which bypasses RLS. That's why `scripts/votes-rls.sql` only grants
  public read access.
- Emails (`lib/email.ts`): school activation, candidate pitch invite, student login link,
  OTP code, and the post-vote congratulations email with the candidate's name attached.

## If something doesn't work

Use `scripts/debug-login.js` for system-admin login issues. For other 401/403s, check
the server terminal first, every API route logs context rather than failing silently.
