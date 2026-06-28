/**
 * Debug script — diagnoses system admin login issues step by step.
 * Run with: node scripts/debug-login.js you@example.com yourpassword
 *
 * Requires .env.local to exist with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

async function main() {
  const [emailArg, passwordArg] = process.argv.slice(2);

  console.log('--- Step 1: Environment variables ---');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  console.log('NEXT_PUBLIC_SUPABASE_URL:', url ? `set (${url})` : 'MISSING');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', key ? `set (length ${key.length})` : 'MISSING');

  if (!url || !key) {
    console.log('\n❌ Stop here — fix your .env.local first. Make sure it is in the project root');
    console.log('   and that you restarted `npm run dev` after creating/editing it.');
    process.exit(1);
  }

  if (!emailArg || !passwordArg) {
    console.log('\nUsage: node scripts/debug-login.js you@example.com yourpassword');
    process.exit(1);
  }

  const email = emailArg.toLowerCase().trim();
  const supabase = createClient(url, key);

  console.log('\n--- Step 2: Connecting to Supabase and listing ALL system_admins rows ---');
  const { data: allRows, error: allError } = await supabase
    .from('system_admins')
    .select('id, email, password_hash, created_at');

  if (allError) {
    console.log('❌ Could not query system_admins table:', allError.message);
    console.log('   This usually means the table does not exist, or the service role key is wrong/expired.');
    process.exit(1);
  }

  console.log(`Found ${allRows.length} row(s) in system_admins:`);
  allRows.forEach((r, i) => {
    console.log(
      `  [${i}] email="${r.email}" hash_length=${r.password_hash ? r.password_hash.length : 'NULL'} created_at=${r.created_at}`
    );
  });

  console.log(`\n--- Step 3: Looking for exact match on email "${email}" ---`);
  const match = allRows.find((r) => r.email === email);

  if (!match) {
    console.log(`❌ No row has email exactly equal to "${email}".`);
    console.log('   Compare carefully against the list above — look for hidden spaces, capitalization,');
    console.log('   or a different domain/typo. The login route does an exact match after lowercasing.');
    process.exit(1);
  }

  console.log('✅ Found matching row, id:', match.id);

  if (!match.password_hash || match.password_hash.length < 50) {
    console.log(`❌ password_hash looks invalid (length ${match.password_hash ? match.password_hash.length : 0}).`);
    console.log('   A real bcrypt hash is exactly 60 characters and starts with $2a$ or $2b$.');
    process.exit(1);
  }

  console.log('\n--- Step 4: Comparing password against stored hash ---');
  console.log('Hash:', match.password_hash);
  const valid = await bcrypt.compare(passwordArg, match.password_hash);
  console.log('bcrypt.compare result:', valid);

  if (valid) {
    console.log('\n✅ Password matches. Login SHOULD work with these exact credentials.');
    console.log('   If the web login still fails, the problem is in the running app');
    console.log('   (e.g. stale .env.local before a restart, or a different Supabase project URL).');
    console.log('   Restart `npm run dev` fully and try again.');
  } else {
    console.log('\n❌ Password does NOT match this hash.');
    console.log('   Generate a fresh hash and update it:');
    console.log(`   node -e "console.log(require('bcryptjs').hashSync('${passwordArg}', 10))"`);
    console.log('   Then run in Supabase SQL editor:');
    console.log(
      `   update system_admins set password_hash = 'PASTE_NEW_HASH' where email = '${email}';`
    );
  }
}

main();
