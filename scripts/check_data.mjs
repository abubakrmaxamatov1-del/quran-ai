import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkData() {
  const { count: arabicCount, error: err1 } = await supabase.from('quran_arabic').select('*', { count: 'exact', head: true });
  const { count: mansourCount, error: err2 } = await supabase.from('quran_mansour').select('*', { count: 'exact', head: true });
  const { count: surahsCount, error: err3 } = await supabase.from('surahs').select('*', { count: 'exact', head: true });
  const { count: usersCount, error: err4 } = await supabase.from('telegram_users').select('*', { count: 'exact', head: true });

  console.log('--- Verification ---');
  console.log('quran_arabic rows:', arabicCount);
  console.log('quran_mansour rows:', mansourCount);
  console.log('surahs rows:', surahsCount);
  console.log('telegram_users rows:', usersCount);

  if (err1) console.error('Error quran_arabic:', err1.message);
  if (err2) console.error('Error quran_mansour:', err2.message);
  if (err3) console.error('Error surahs:', err3.message);
  if (err4) console.error('Error telegram_users:', err4.message);
}

checkData();
