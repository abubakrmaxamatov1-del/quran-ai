import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkColumns() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'telegram_users' });
  
  if (error) {
    // If RPC doesn't exist, try a simple query and check the returned object keys
    const { data: sample, error: err2 } = await supabase.from('telegram_users').select('*').limit(1);
    if (err2) {
      console.error('Error fetching table info:', err2.message);
    } else {
      console.log('Table exists. Columns in result:', sample.length > 0 ? Object.keys(sample[0]) : 'No rows to check columns');
    }
  } else {
    console.log('Columns:', data);
  }
}

checkColumns();
