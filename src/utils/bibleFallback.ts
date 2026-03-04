import { BibleVerse } from "../lib/supabase";
import bibleSeedSql from "../../supabase/migrations/20260220103000_seed_bible_verses_minimal.sql?raw";

// Parse the VALUES tuples from the seed SQL file.
export function loadBibleFromLocal(): BibleVerse[] {
  const verses: BibleVerse[] = [];

  // Extract content between VALUES and ON CONFLICT
  const match = bibleSeedSql.match(/VALUES\s*([\s\S]*?)\s*ON\s+CONFLICT/i);
  if (!match) return verses;

  const valuesBlock = match[1];
  const tupleRegex =
    /\(\s*'([^']*)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'(.*?)'\s*,\s*'(Old|New)'\s*,\s*''\s*\)/gs;

  let m: RegExpExecArray | null;
  let idCounter = 1;
  while ((m = tupleRegex.exec(valuesBlock)) !== null) {
    const [_, book, chapter, verse, text, testament] = m;
    // unescape doubled single quotes in text
    const cleanText = text.replace(/''/g, "'");
    verses.push({
      id: `local-bible-${idCounter++}`,
      book,
      chapter: Number(chapter),
      verse: Number(verse),
      text: cleanText,
      testament: testament as "Old" | "New",
      audio_url: "",
      created_at: new Date().toISOString(),
    });
  }

  return verses;
}
