/**
 * One-time script to create the first system admin account.
 * Run with: npm run seed:admin -- you@example.com yourpassword
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your env.
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error('Usage: npm run seed:admin -- you@example.com yourpassword');
    process.exit(1);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const password_hash = await bcrypt.hash(password, 10);

  const { error } = await supabase
    .from('system_admins')
    .insert({ email, password_hash });

  if (error) {
    console.error('Failed to create system admin:', error.message);
    process.exit(1);
  }

  console.log(`System admin created for ${email}`);
}

main();
