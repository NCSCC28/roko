const explanationCache = new Map<string, string>();

function isMostlyTelugu(text: string): boolean {
  const chars = Array.from(text);
  if (chars.length === 0) {
    return false;
  }

  const teluguChars = chars.filter((char) => /[\u0C00-\u0C7F]/.test(char)).length;
  return teluguChars / chars.length > 0.4;
}

function parseGoogleTranslateResponse(data: unknown): string {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  const first = data[0];
  if (!Array.isArray(first)) {
    return '';
  }

  const translatedParts = first
    .map((part) => {
      if (!Array.isArray(part) || part.length === 0) {
        return '';
      }

      const value = part[0];
      return typeof value === 'string' ? value : '';
    })
    .filter((value) => value.length > 0);

  return translatedParts.join('');
}

function cleanOutput(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

async function translateWithGoogle(sourceText: string): Promise<string> {
  const safeText = encodeURIComponent(sourceText.slice(0, 3500));
  const url =
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=te&dt=t&q=${safeText}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google translate failed with status ${response.status}`);
  }

  const data: unknown = await response.json();
  const translated = cleanOutput(parseGoogleTranslateResponse(data));
  if (!translated) {
    throw new Error('Google translate returned empty output');
  }

  return translated;
}

async function translateWithMyMemory(sourceText: string): Promise<string> {
  const safeText = encodeURIComponent(sourceText.slice(0, 900));
  const url = `https://api.mymemory.translated.net/get?q=${safeText}&langpair=auto|te`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`MyMemory translate failed with status ${response.status}`);
  }

  const data = await response.json() as {
    responseData?: { translatedText?: string };
  };
  const translated = cleanOutput(data.responseData?.translatedText || '');
  if (!translated) {
    throw new Error('MyMemory translate returned empty output');
  }

  return translated;
}

async function translateWithLibre(sourceText: string): Promise<string> {
  const response = await fetch('https://libretranslate.de/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: sourceText.slice(0, 900),
      source: 'auto',
      target: 'te',
      format: 'text',
    }),
  });

  if (!response.ok) {
    throw new Error(`LibreTranslate failed with status ${response.status}`);
  }

  const data = await response.json() as { translatedText?: string };
  const translated = cleanOutput(data.translatedText || '');
  if (!translated) {
    throw new Error('LibreTranslate returned empty output');
  }

  return translated;
}

export async function generateTeluguExplanation(sourceText: string): Promise<string> {
  const normalized = sourceText.trim();
  if (!normalized) {
    return '';
  }

  if (isMostlyTelugu(normalized)) {
    return normalized;
  }

  if (explanationCache.has(normalized)) {
    return explanationCache.get(normalized) as string;
  }

  const providers: Array<(text: string) => Promise<string>> = [
    translateWithGoogle,
    translateWithMyMemory,
    translateWithLibre,
  ];

  let translated = '';
  let lastError: unknown;

  for (const provider of providers) {
    try {
      translated = await provider(normalized);
      if (translated) {
        break;
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (!translated) {
    throw new Error(
      `Telugu explanation failed from all providers: ${lastError instanceof Error ? lastError.message : 'unknown'}`
    );
  }

  explanationCache.set(normalized, translated);
  return translated;
}
