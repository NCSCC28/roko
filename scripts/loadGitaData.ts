import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables. Please ensure .env file exists with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface CSVRow {
  id: string;
  chapter: string;
  verse: string;
  shloka: string;
  transliteration: string;
  hinMeaning: string;
  engMeaning: string;
  wordMeaning: string;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function parseCSV(csvText: string): CSVRow[] {
  const rows: CSVRow[] = [];
  let currentLine = '';
  let inQuotes = false;
  let fieldCount = 0;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentLine += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      currentLine += char;
    } else if (char === '\n' && !inQuotes) {
      if (currentLine.trim()) {
        const values = parseCSVLine(currentLine);

        if (values.length >= 8 && values[0] !== 'ID') {
          const row: CSVRow = {
            id: values[0]?.replace(/^"|"$/g, '') || '',
            chapter: values[1]?.replace(/^"|"$/g, '') || '',
            verse: values[2]?.replace(/^"|"$/g, '') || '',
            shloka: values[3]?.replace(/^"|"$/g, '').replace(/""/g, '"') || '',
            transliteration: values[4]?.replace(/^"|"$/g, '').replace(/""/g, '"') || '',
            hinMeaning: values[5]?.replace(/^"|"$/g, '').replace(/""/g, '"') || '',
            engMeaning: values[6]?.replace(/^"|"$/g, '').replace(/""/g, '"') || '',
            wordMeaning: values[7]?.replace(/^"|"$/g, '').replace(/""/g, '"') || '',
          };
          rows.push(row);
        }
      }
      currentLine = '';
    } else {
      currentLine += char;
    }
  }

  if (currentLine.trim()) {
    const values = parseCSVLine(currentLine);
    if (values.length >= 8 && values[0] !== 'ID') {
      const row: CSVRow = {
        id: values[0]?.replace(/^"|"$/g, '') || '',
        chapter: values[1]?.replace(/^"|"$/g, '') || '',
        verse: values[2]?.replace(/^"|"$/g, '') || '',
        shloka: values[3]?.replace(/^"|"$/g, '').replace(/""/g, '"') || '',
        transliteration: values[4]?.replace(/^"|"$/g, '').replace(/""/g, '"') || '',
        hinMeaning: values[5]?.replace(/^"|"$/g, '').replace(/""/g, '"') || '',
        engMeaning: values[6]?.replace(/^"|"$/g, '').replace(/""/g, '"') || '',
        wordMeaning: values[7]?.replace(/^"|"$/g, '').replace(/""/g, '"') || '',
      };
      rows.push(row);
    }
  }

  return rows;
}

async function loadData() {
  try {
    console.log('Reading CSV file...');
    const csvPath = path.join(__dirname, '../src/lib/bhagwad_gita_data_set.txt');
    const csvText = fs.readFileSync(csvPath, 'utf-8');

    console.log('Parsing CSV data...');
    const rows = parseCSV(csvText);
    console.log(`Found ${rows.length} verses`);

    const versesToInsert = rows
      .map((row) => ({
        chapter: parseInt(row.chapter, 10),
        verse: parseInt(row.verse, 10),
        sanskrit: row.shloka,
        transliteration: row.transliteration,
        translation_en: row.engMeaning,
        translation_hi: row.hinMeaning,
        commentary: row.wordMeaning,
      }))
      .filter((v) => !isNaN(v.chapter) && !isNaN(v.verse) && v.chapter > 0 && v.verse > 0);

    console.log(`Valid verses to insert: ${versesToInsert.length}`);

    const batchSize = 100;
    for (let i = 0; i < versesToInsert.length; i += batchSize) {
      const batch = versesToInsert.slice(i, i + batchSize);

      console.log(`Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(versesToInsert.length / batchSize)}...`);

      const { error } = await supabase.from('gita_verses').upsert(batch, {
        onConflict: 'chapter,verse',
      });

      if (error) {
        console.error(`Error in batch ${Math.floor(i / batchSize) + 1}:`, error);
        throw error;
      }
    }

    console.log('Successfully loaded all Gita verses!');
  } catch (err) {
    console.error('Error loading data:', err);
    process.exit(1);
  }
}

loadData();
