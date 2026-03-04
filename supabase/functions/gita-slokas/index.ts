import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SlokaQueryParams {
  chapter?: string;
  verse?: string;
  search?: string;
  limit?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const url = new URL(req.url);
  const chapter = url.searchParams.get("chapter");
  const verse = url.searchParams.get("verse");
  const search = url.searchParams.get("search");
  const limit = url.searchParams.get("limit");

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseKey) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Missing Supabase configuration",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const { createClient } = await import("npm:@supabase/supabase-js@2.57.4");
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    if (chapter && verse) {
      const chapterNum = parseInt(chapter, 10);
      const verseNum = parseInt(verse, 10);

      if (
        isNaN(chapterNum) ||
        isNaN(verseNum) ||
        chapterNum < 1 ||
        chapterNum > 18 ||
        verseNum < 1
      ) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid chapter or verse number",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { data, error } = await supabase
        .from("gita_verses")
        .select("*")
        .eq("chapter", chapterNum)
        .eq("verse", verseNum)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Sloka not found for Chapter ${chapterNum}, Verse ${verseNum}`,
          }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const response = {
        success: true,
        data: {
          chapter: data.chapter,
          verse: data.verse,
          sloka: data.sanskrit,
          transliteration: data.transliteration,
          translation: {
            english: data.translation_en,
            hindi: data.translation_hi,
          },
          meaning: {
            wordByWord: data.commentary,
            commentary: data.commentary,
          },
          audio: data.audio_url || null,
        },
      };

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else if (chapter) {
      const chapterNum = parseInt(chapter, 10);

      if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > 18) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid chapter number",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { data, error } = await supabase
        .from("gita_verses")
        .select("*")
        .eq("chapter", chapterNum)
        .order("verse", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `No verses found for Chapter ${chapterNum}`,
          }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const response = {
        success: true,
        data: {
          chapter: chapterNum,
          totalVerses: data.length,
          verses: data,
        },
      };

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else if (search) {
      const searchTerm = search.toLowerCase();

      if (searchTerm.length < 2) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Search term must be at least 2 characters",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { data, error } = await supabase
        .from("gita_verses")
        .select("*")
        .or(
          `translation_en.ilike.%${searchTerm}%,translation_hi.ilike.%${searchTerm}%,commentary.ilike.%${searchTerm}%`
        )
        .limit(20);

      if (error) {
        throw new Error(error.message);
      }

      const response = {
        success: true,
        count: data?.length || 0,
        data: data || [],
      };

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      const queryLimit = limit ? Math.min(parseInt(limit, 10), 100) : 20;

      const { data, error } = await supabase
        .from("gita_verses")
        .select("*")
        .order("chapter", { ascending: true })
        .order("verse", { ascending: true })
        .limit(queryLimit);

      if (error) {
        throw new Error(error.message);
      }

      const response = {
        success: true,
        count: data?.length || 0,
        data: data || [],
      };

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";

    return new Response(
      JSON.stringify({
        success: false,
        error: `Server error: ${errorMessage}`,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
