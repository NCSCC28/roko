import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface HistoryEntry {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  question: string;
  ultraBrief?: boolean;
  contextMode?: string;
  conversationHistory?: HistoryEntry[];
}

function buildPrompt(body: RequestBody): string {
  const historyText =
    body.conversationHistory
      ?.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n") ?? "";

  return `
You are ROKO, a concise spiritual assistant. You answer using scriptures (Bhagavad Gita, Bible, Quran) with short, clear explanations and a practical action step.
Context mode: ${body.contextMode ?? "standard"}.
Tone: ${body.ultraBrief ? "ultra-brief, bullet-sized answers" : "concise, warm"}.

Conversation so far:
${historyText}

User question: ${body.question}

Reply with:
- A relevant verse (cite source)
- A one-sentence practical meaning
- One small actionable step
`.trim();
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  let payload: RequestBody;
  try {
    payload = (await req.json()) as RequestBody;
  } catch (_err) {
    return new Response("Invalid JSON body", { status: 400, headers: corsHeaders });
  }

  if (!payload.question) {
    return new Response("Missing 'question'", { status: 400, headers: corsHeaders });
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return new Response("Gemini API key not configured", { status: 500, headers: corsHeaders });
  }

  const prompt = buildPrompt(payload);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    return new Response(
      JSON.stringify({ error: `Gemini error ${res.status}`, details: text }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text =
    data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join(" ").trim() ?? "";

  if (!text) {
    return new Response(
      JSON.stringify({ error: "Gemini returned empty response" }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  return new Response(JSON.stringify({ text }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
