// workers/expiry-scan/test.ts

import 'dotenv/config';
import  scheduled  from './src/index';

// Ensure .env.local is loaded from absolute path
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

const envPath = path.resolve(
  '/Users/shivangschool/Desktop/papertrail-web/apps/web/.env.local'
);
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const SUPABASE_URL = envConfig['NEXT_PUBLIC_SUPABASE_URL'];
const SUPABASE_SERVICE_ROLE_KEY = envConfig['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
}

(async () => {
  console.log('🔧 Running expiry-scan scheduled() test...\n');
  try {
    await scheduled.scheduled({} as any, {
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
    });
    console.log('\n✅ scheduled() ran successfully');
  } catch (err) {
    console.error('❌ scheduled() failed:', err);
  }
})();
