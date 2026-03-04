import { supabase } from "../lib/supabase";
import {
  generateLocalAiReply,
  type AiContextMode,
  type AiConversationTurn,
} from "./localAi";

const SESSION_STORAGE_KEY = "roko_dialogflow_session_id_v1";

interface GenerateDialogflowReplyOptions {
  ultraBrief?: boolean;
  contextMode?: AiContextMode;
  conversationHistory?: AiConversationTurn[];
}

interface DialogflowInvokeResponse {
  success?: boolean;
  source?: string;
  sessionId?: string;
  reply?: string;
  error?: string;
}

function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }

  return `${Date.now()}${Math.random().toString(16).slice(2)}`;
}

function getDialogflowSessionId(): string {
  if (typeof window === "undefined") {
    return createSessionId();
  }

  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing && existing.trim().length > 0) {
    return existing;
  }

  const generated = createSessionId();
  window.localStorage.setItem(SESSION_STORAGE_KEY, generated);
  return generated;
}

function setDialogflowSessionId(sessionId?: string): void {
  if (!sessionId || typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
}

export async function generateDialogflowReply(
  question: string,
  options?: GenerateDialogflowReplyOptions
): Promise<string> {
  const cleanQuestion = question.trim();
  if (!cleanQuestion) {
    return "";
  }

  const sessionId = getDialogflowSessionId();

  try {
    const { data, error } = await supabase.functions.invoke(
      "dialogflow-agent",
      {
        body: {
          message: cleanQuestion,
          sessionId,
          contextMode: options?.contextMode ?? "standard",
          ultraBrief: Boolean(options?.ultraBrief),
          conversationHistory: options?.conversationHistory ?? [],
        },
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    const payload = (data ?? {}) as DialogflowInvokeResponse;
    if (!payload.success || !payload.reply) {
      const message = payload.error || "Dialogflow returned an invalid response.";
      throw new Error(message);
    }

    setDialogflowSessionId(payload.sessionId);
    return payload.reply;
  } catch {
    return generateLocalAiReply(cleanQuestion, {
      ultraBrief: options?.ultraBrief,
      contextMode: options?.contextMode,
      conversationHistory: options?.conversationHistory,
    });
  }
}

