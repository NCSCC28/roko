# ROKO Scripture Assistant

This project now uses **Dialogflow (Google)** as the primary AI backend for the chat bot.

## What changed

- Frontend chat (`src/components/VoiceAssistant.tsx`) now calls:
  - `src/utils/dialogflowAi.ts`
- New Supabase Edge Function:
  - `supabase/functions/dialogflow-agent/index.ts`
- Local AI (`src/utils/localAi.ts`) is kept as a safe fallback if Dialogflow is not configured.

## Prerequisites

1. Supabase project
2. Google Cloud project with Dialogflow ES agent
3. Service account with Dialogflow access

## Required Supabase function secrets

Set these secrets in your Supabase project:

- `DIALOGFLOW_PROJECT_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `DIALOGFLOW_LANGUAGE_CODE` (optional, default: `en`)

Example:

```bash
supabase secrets set DIALOGFLOW_PROJECT_ID=your-gcp-project-id
supabase secrets set GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@your-project.iam.gserviceaccount.com
supabase secrets set GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
supabase secrets set DIALOGFLOW_LANGUAGE_CODE=en
```

Note: Keep `\n` newline escapes in the private key value.

## Deploy the Dialogflow edge function

```bash
supabase functions deploy dialogflow-agent
```

## Frontend env

Ensure `.env` has:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Run locally

```bash
npm install
npm run dev
```

## Behavior

- If Dialogflow is configured and reachable, bot replies come from Dialogflow.
- If Dialogflow is unavailable/misconfigured, bot falls back to local AI logic automatically.

