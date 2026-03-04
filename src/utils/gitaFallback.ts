import { GitaVerse } from "../lib/supabase";
import gitaCsv from "../lib/bhagwad_gita_data_set.txt?raw";

// Lightweight CSV parser that handles quoted fields and embedded commas/newlines.
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"'; // escaped quote
        i++; // skip next
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      // end of row
      if (char === "\r" && next === "\n") {
        i++; // skip CRLF second char
      }
      row.push(field);
      if (row.some((v) => v.length > 0)) {
        rows.push(row);
      }
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  // push last row if any
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((v) => v.length > 0)) {
      rows.push(row);
    }
  }

  return rows;
}

export function loadGitaFromLocal(): GitaVerse[] {
  const rows = parseCSV(gitaCsv);
  const header = rows[0] || [];
  const dataRows = rows.slice(1);

  const col = (name: string) => header.indexOf(name);

  const idxId = col("ID");
  const idxChapter = col("Chapter");
  const idxVerse = col("Verse");
  const idxShloka = col("Shloka");
  const idxTranslit = col("Transliteration");
  const idxHin = col("HinMeaning");
  const idxEng = col("EngMeaning");
  const idxWord = col("WordMeaning");

  return dataRows
    .filter((r) => r.length > 0)
    .map((r, i) => {
      const chapter = Number(r[idxChapter] || 0);
      const verse = Number(r[idxVerse] || 0);
      return {
        id: r[idxId] || `local-${i + 1}`,
        chapter,
        verse,
        sanskrit: r[idxShloka] || "",
        transliteration: r[idxTranslit] || "",
        translation_en: r[idxEng] || "",
        translation_hi: r[idxHin] || "",
        translation_te: "",
        commentary: r[idxWord] || "",
        audio_url: "",
        created_at: new Date().toISOString(),
      } satisfies GitaVerse;
    });
}
