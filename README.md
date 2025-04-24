
This project is a Google Meet-like audio-only conversation application built with Next.js, ElevenLabs for AI voice agents, and Supabase as the backend. Users can engage in real-time voice conversations with an AI agent named "Alexis," view participant names, start/end calls, and store conversation history (including Conversation ID, Agent ID, Transcript, and Call Duration) in a Supabase PostgreSQL database. The application uses a Supabase Edge Function to handle ElevenLabs post-call webhooks for storing conversation data.

## Prerequisites

Before running the project, ensure you have:

- Node.js (v18 or higher) and npm installed.
- A Supabase account ([sign up](https://app.supabase.com)).
- An ElevenLabs account ([sign up](https://elevenlabs.io/sign-up)).
- Supabase CLI installed (`npm install -g @supabase/supabase-cli`).
- A GitHub account for repository access.

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/YoussefAlsaeed/TalkAI.git
cd TalkAi
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root and add the same environment variables in `.env.temp` file [.env.temp](https://github.com/YoussefAlsaeed/TalkAI/blob/main/google-meet-like-audio-app/.env.temp).

### 4. Set Up Supabase

#### Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com) and sign in with GitHub.
2. Click **Create New Project** .
3. Note down your **Project URL** and **Anon Key** from the project settings .

#### Create the Database Schema

1. In the Supabase dashboard, go to **SQL Editor** > **New Query**.
2. Run the following SQL to create the `conversations` table:

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT NOT NULL,
  transcript TEXT,
  call_duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Initialize Supabase Locally

1. Run the following to initialize a local Supabase project:

```bash
supabase init
```

2. Link your local project to the remote Supabase project:

```bash
supabase login
supabase link --project-ref your-project-ref
```

Replace `your-project-ref` with your project's ID (from the Supabase dashboard URL: `https://supabase.com/dashboard/project/<project-ref>`).

3. Pull the remote database schema:

```bash
supabase db pull
```

4. Start the local Supabase stack:

```bash
supabase start
```

### 5. Set Up ElevenLabs

#### Create an ElevenLabs Project

1. Sign in to [elevenlabs.io](https://elevenlabs.io).
2. Navigate to **Conversational AI > Agents**.
3. Click **Create an AI Agent**, select the desirable agent.
4. Configure the agent if you used blank template.
5. Copy the **Agent ID** (displayed below the agent name) and add it to `.env.local` as `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`.
6. Go to **API Keys**, create a new API key, and add it to `.env.local` as `ELEVENLABS_API_KEY`.

#### Set Up Post-Call Webhook

1. In the ElevenLabs dashboard, go to your agent's settings (**Conversational AI > Agents > Your Agent**).
2. Navigate to **Analysis > Post-Call Webhook**.
3. Set the webhook URL to your deployed Supabase Edge Function (e.g., `https://<project-ref>.functions.supabase.co/post-call-webhook`).
4. Generate a webhook secret (a random string) and note it down for the Edge Function environment variable `ELEVENLABS_WEBHOOK_SECRET`.
5. Save the webhook settings.

### 6. Set Up Supabase Edge Function

The project uses a Supabase Edge Function (`post-call-webhook`) to process ElevenLabs post-call webhooks and store conversation data.

#### Create the Edge Function

1. In your local Supabase project, create a new Edge Function:

```bash
supabase functions new post-call-webhook
```

2. Replace the contents of `supabase/functions/post-call-webhook/index.ts` with the provided [Edge Function code](https://github.com/YoussefAlsaeed/TalkAI/blob/main/supabase/functions/convo-callback/index.ts) :

#### Configure Environment Variables

1. Create a `.env` file in `supabase/functions/post-call-webhook/` with:

```env
ESUPABASE_URL=your-supabase-url
ESUPABASE_ANON_KEY=your-supabase-anon-key
ELEVENLABS_WEBHOOK_SECRET=your-webhook-secret
```

- `ESUPABASE_URL`: Your Supabase project URL (local or remote).
- `ESUPABASE_ANON_KEY`: Your Supabase anon key.
- `ELEVENLABS_WEBHOOK_SECRET`: The webhook secret set in ElevenLabs.

2. Set the secrets for the deployed function:

```bash
supabase secrets set --env-file supabase/functions/post-call-webhook/.env
```

#### Deploy the Edge Function

1. Deploy the Edge Function to Supabase:

```bash
supabase functions deploy post-call-webhook
```

2. Verify the function is deployed in the Supabase dashboard (**Edge Functions**).

### 7. Run the Project Locally

1. Start the Supabase local stack (if not already running):

```bash
supabase start
```

2. Start the Next.js development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.
4. Allow microphone access when prompted.
5. Click **Start Conversation** to begin the call with Alexis.
6. End the call using the **End Conversation** button.
7. Check the Supabase dashboard (**Table Editor > conversations**) for conversation history after the call ends.


#### Deploy Supabase

1. Ensure the database schema and Edge Function are deployed (see [Set Up Supabase](#set-up-supabase) and [Set Up Supabase Edge Function](#set-up-supabase-edge-function)).
2. Update the ElevenLabs webhook URL to the deployed Edge Function URL (`https://<project-ref>.functions.supabase.co/post-call-webhook`).

## References

- [ElevenLabs Post-Call Webhooks](https://elevenlabs.io/docs/conversational-ai/workflows/post-call-webhooks)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [ElevenLabs Conversational AI](https://elevenlabs.io/docs/conversational-ai/overview)
