import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  console.log('Testing connection to Supabase...');
  console.log('URL:', supabaseUrl);
  
  try {
    const { data, error, status, statusText } = await supabase
      .from('telegram_users')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error connecting to telegram_users table:');
      console.error('Code:', error.code);
      console.error('Message:', error.message);
      console.error('Details:', error.details);
      console.error('Hint:', error.hint);
      console.error('Status:', status, statusText);
    } else {
      console.log('Successfully connected to telegram_users table.');
      console.log('Data sample:', data);
    }
  } catch (err) {
    console.error('Caught exception during Supabase call:', err);
  }
}

testConnection();
