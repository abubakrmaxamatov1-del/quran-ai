import fs from 'fs';
import readline from 'readline';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importData() {
  const filePath = 'data.sql';
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let currentTable = '';
  let batch = [];
  const BATCH_SIZE = 500;
  let totalInserted = 0;

  console.log('Starting import from data.sql...');

  for await (const line of rl) {
    // Detect Table Start
    if (line.includes('INSERT INTO "public"."quran_arabic"')) {
      currentTable = 'quran_arabic';
      continue;
    } else if (line.includes('INSERT INTO "public"."quran_mansour"')) {
      // Flush previous table batch if any
      if (batch.length > 0) {
        await insertBatch(currentTable, batch);
        batch = [];
      }
      currentTable = 'quran_mansour';
      continue;
    }

    // Process Values line
    // Format: (1, 1, 1, 'text'),
    // Format: (1, 1, 1, 'text');
    if (currentTable && line.trim().startsWith('(')) {
      const row = parseRow(line, currentTable);
      if (row) {
        batch.push(row);
      }

      if (batch.length >= BATCH_SIZE) {
        await insertBatch(currentTable, batch);
        totalInserted += batch.length;
        console.log(`Inserted ${totalInserted} rows into ${currentTable}...`);
        batch = [];
      }
    }
  }

  // Final flush
  if (batch.length > 0) {
    await insertBatch(currentTable, batch);
    totalInserted += batch.length;
    console.log(`Final batch inserted. Total rows: ${totalInserted}`);
  }

  console.log('Import completed successfully!');
}

function parseRow(line, table) {
  try {
    // Clean line: remove leading '(' and trailing '),' or ');'
    let clean = line.trim();
    if (clean.endsWith(',') || clean.endsWith(';')) {
      clean = clean.slice(0, -1);
    }
    if (clean.startsWith('(')) {
      clean = clean.slice(1, -1);
    }

    // Split by comma BUT handle quoted strings
    // Simple regex for our specific SQL dump format
    // Format: id, sura_number, aya_number, 'text'
    // Or for mansour: id, sura_number, aya_number, 'translation', 'footnotes', 'created_at', 'arabic_text'
    
    // We can use a more robust split that respects single quotes
    const values = [];
    let current = '';
    let inQuote = false;
    for (let i = 0; i < clean.length; i++) {
        const char = clean[i];
        if (char === "'" && (i === 0 || clean[i-1] !== '\\')) {
            inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current.trim());

    if (table === 'quran_arabic') {
      return {
        id: parseInt(values[0]),
        sura_number: parseInt(values[1]),
        aya_number: parseInt(values[2]),
        arabic_text: unescapeSql(values[3])
      };
    } else if (table === 'quran_mansour') {
      return {
        id: parseInt(values[0]),
        sura_number: parseInt(values[1]),
        aya_number: parseInt(values[2]),
        translation: unescapeSql(values[3]),
        footnotes: unescapeSql(values[4]),
        created_at: unescapeSql(values[5]),
        arabic_text: unescapeSql(values[6])
      };
    }
  } catch (e) {
    console.error('Error parsing row:', line, e);
    return null;
  }
}

function unescapeSql(val) {
  if (!val || val === 'NULL') return null;
  if (val.startsWith("'") && val.endsWith("'")) {
    val = val.slice(1, -1);
  }
  // Remove SQL escaping ('' -> ')
  return val.replace(/''/g, "'");
}

async function insertBatch(table, data) {
  const { error } = await supabase.from(table).insert(data);
  if (error) {
    console.error(`Error inserting into ${table}:`, error.message);
  }
}

importData().catch(console.error);
