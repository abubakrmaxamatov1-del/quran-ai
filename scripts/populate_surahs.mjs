import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateSurahs() {
  console.log('Fetching surahs from API...');
  const response = await fetch('https://api.alquran.cloud/v1/surah');
  const result = await response.json();

  if (result.code !== 200) {
    console.error('API Error:', result);
    return;
  }

  const surahs = result.data.map(s => ({
    number: s.number,
    name: s.name,
    englishname: s.englishName,
    englishnametranslation: s.englishNameTranslation,
    numberofayahs: s.numberOfAyahs,
    revelationtype: s.revelationType
  }));

  console.log(`Inserting ${surahs.length} surahs into Supabase...`);

  const { error } = await supabase
    .from('surahs')
    .upsert(surahs, { onConflict: 'number' });

  if (error) {
    console.error('Error inserting surahs:', error.message);
  } else {
    console.log('Surahs populated successfully!');
  }
}

populateSurahs().catch(console.error);
