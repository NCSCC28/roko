import { supabase } from '../lib/supabase';

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
  const lines = csvText.split('\n');
  const rows: CSVRow[] = [];
  parseCSVLine(lines[0]);

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const values = parseCSVLine(lines[i]);

    const row: CSVRow = {
      id: values[0] || '',
      chapter: values[1] || '',
      verse: values[2] || '',
      shloka: values[3] || '',
      transliteration: values[4] || '',
      hinMeaning: values[5] || '',
      engMeaning: values[6] || '',
      wordMeaning: values[7] || '',
    };

    rows.push(row);
  }

  return rows;
}

export async function loadGitaDataToDatabase(csvText: string): Promise<{
  success: boolean;
  message: string;
  count?: number;
}> {
  try {
    const rows = parseCSV(csvText);

    if (rows.length === 0) {
      return {
        success: false,
        message: 'No valid rows found in CSV data',
      };
    }

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

    if (versesToInsert.length === 0) {
      return {
        success: false,
        message: 'No valid verses could be extracted from CSV data',
      };
    }

    // Insert in batches to avoid payload size limits
    const batchSize = 100;
    for (let i = 0; i < versesToInsert.length; i += batchSize) {
      const batch = versesToInsert.slice(i, i + batchSize);

      const { error } = await supabase.from('gita_verses').upsert(batch, {
        onConflict: 'chapter,verse',
      });

      if (error) {
        return {
          success: false,
          message: `Database error at batch ${Math.floor(i / batchSize) + 1}: ${error.message}`,
        };
      }
    }

    return {
      success: true,
      message: `Successfully loaded ${versesToInsert.length} Gita verses`,
      count: versesToInsert.length,
    };
  } catch (err) {
    return {
      success: false,
      message: `Error parsing CSV: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}

export async function checkAndLoadGitaData(): Promise<boolean> {
  const { count, error } = await supabase
    .from('gita_verses')
    .select('id', { count: 'exact', head: true });

  if (error || !count || count === 0) {
    console.log('Gita verses not found in database. Attempting to load from CSV...');
    try {
      const response = await fetch('/src/lib/bhagwad_gita_data_set.txt');
      if (response.ok) {
        const csvText = await response.text();
        const result = await loadGitaDataToDatabase(csvText);
        console.log(result.message);
        return result.success;
      }
    } catch (err) {
      console.error('Failed to load Gita data:', err);
    }
    return false;
  }

  return true;
}
