import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface DialogflowRequestBody {
  message?: string;
  sessionId?: string;
  contextMode?: string;
  ultraBrief?: boolean;
  conversationHistory?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

interface DialogflowDetectIntentResponse {
  queryResult?: {
    fulfillmentText?: string;
    fulfillmentMessages?: Array<{
      text?: {
        text?: string[];
      };
    }>;
    intent?: {
      displayName?: string;
    };
    intentDetectionConfidence?: number;
  };
}

function normalizePrivateKey(value: string): string {
  return value.replace(/\\n/g, "\n");
}

async function getGoogleAccessToken(
  clientEmail: string,
  privateKey: string
): Promise<string> {
  const { GoogleAuth } = await import("npm:google-auth-library@9.15.1");
  const auth = new GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });

  const client = await auth.getClient();
  const accessTokenResult = await client.getAccessToken();
  const token =
    typeof accessTokenResult === "string"
      ? accessTokenResult
      : accessTokenResult?.token ?? null;

  if (!token) {
    throw new Error("Failed to obtain Google access token");
  }

  return token;
}

function extractFulfillmentText(payload: DialogflowDetectIntentResponse): string {
  const direct = payload.queryResult?.fulfillmentText?.trim();
  if (direct) {
    return direct;
  }

  const fromMessages = payload.queryResult?.fulfillmentMessages
    ?.flatMap((item) => item.text?.text ?? [])
    .map((text) => text.trim())
    .filter((text) => text.length > 0);

  if (fromMessages && fromMessages.length > 0) {
    return fromMessages.join("\n");
  }

  return "I could not generate a response for that input.";
}

function summarizeHistory(
  history: DialogflowRequestBody["conversationHistory"]
): string | null {
  if (!history || history.length === 0) {
    return null;
  }

  const compact = history
    .slice(-6)
    .map((item) => `${item.role}: ${item.content.replace(/\s+/g, " ").trim()}`)
    .join(" | ");

  return compact.length > 0 ? compact.slice(0, 1000) : null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Method not allowed",
      }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const requestBody = (await req.json()) as DialogflowRequestBody;
    const message = requestBody.message?.trim();

    if (!message) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing message",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const projectId = Deno.env.get("DIALOGFLOW_PROJECT_ID")?.trim();
    const clientEmail = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL")?.trim();
    const privateKeyRaw = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY")?.trim();
    const languageCode = Deno.env.get("DIALOGFLOW_LANGUAGE_CODE")?.trim() || "en";

    if (!projectId || !clientEmail || !privateKeyRaw) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Dialogflow is not configured. Required secrets: DIALOGFLOW_PROJECT_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const privateKey = normalizePrivateKey(privateKeyRaw);
    const sessionId =
      requestBody.sessionId?.trim() ||
      crypto.randomUUID().replace(/-/g, "");

    const accessToken = await getGoogleAccessToken(clientEmail, privateKey);

    const sessionPath = `projects/${projectId}/agent/sessions/${sessionId}`;
    const endpoint = `https://dialogflow.googleapis.com/v2/${sessionPath}:detectIntent`;
    const historySummary = summarizeHistory(requestBody.conversationHistory);

    const detectIntentPayload = {
      queryInput: {
        text: {
          text: message,
          languageCode,
        },
      },
      queryParams: {
        payload: {
          app: "ROKO",
          contextMode: requestBody.contextMode ?? "standard",
          ultraBrief: Boolean(requestBody.ultraBrief),
          conversationSummary: historySummary ?? "",
        },
      },
    };

    const dialogflowResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(detectIntentPayload),
    });

    const dialogflowData =
      (await dialogflowResponse.json()) as
        | DialogflowDetectIntentResponse
        | { error?: { message?: string } };

    if (!dialogflowResponse.ok) {
      const messageFromApi =
        "error" in dialogflowData && dialogflowData.error?.message
          ? dialogflowData.error.message
          : `Dialogflow error with status ${dialogflowResponse.status}`;

      return new Response(
        JSON.stringify({
          success: false,
          error: messageFromApi,
        }),
        {
          status: dialogflowResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const typed = dialogflowData as DialogflowDetectIntentResponse;
    const reply = extractFulfillmentText(typed);
    const intent = typed.queryResult?.intent?.displayName ?? null;
    const confidence = typed.queryResult?.intentDetectionConfidence ?? null;

    return new Response(
      JSON.stringify({
        success: true,
        source: "dialogflow",
        sessionId,
        reply,
        intent,
        confidence,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";

    return new Response(
      JSON.stringify({
        success: false,
        error: message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

