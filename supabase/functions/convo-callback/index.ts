import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(
  Deno.env.get("ESUPABASE_URL"),
  Deno.env.get("ESUPABASE_ANON_KEY")
);
// Function to verify webhook signature
async function constructWebhookEvent(req, secret) {
  const signatureHeader = req.headers.get("ElevenLabs-Signature");
  if (!signatureHeader) {
    return {
      event: null,
      error: "Missing signature header",
    };
  }
  const headers = signatureHeader.split(",");
  const timestamp = headers.find((e) => e.startsWith("t="))?.substring(2);
  const signature = headers.find((e) => e.startsWith("v0="));
  if (!timestamp || !signature) {
    return {
      event: null,
      error: "Invalid signature format",
    };
  }
  // Validate timestamp
  const reqTimestamp = Number(timestamp) * 1000;
  const tolerance = Date.now() - 30 * 60 * 1000;
  if (reqTimestamp < tolerance) {
    return {
      event: null,
      error: "Request expired",
    };
  }
  // Read request body as text
  const body = await req.text();
  const message = `${timestamp}.${body}`;
  // Compute HMAC-SHA256 signature
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );
  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message)
  );
  const digest = `v0=${Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;
  if (signature !== digest) {
    return {
      event: null,
      error: "Invalid signature",
    };
  }
  const event = JSON.parse(body);
  return {
    event,
    error: null,
  };
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
    });
  }
  try {
    const secret = Deno.env.get("ELEVENLABS_WEBHOOK_SECRET");
    if (!secret) {
      return new Response("Webhook secret not configured", {
        status: 500,
      });
    }
    const { event, error } = await constructWebhookEvent(req, secret);
    if (error) {
      return new Response(error, {
        status: 401,
      });
    }
    const { type, data } = event;
    if (type !== "post_call_transcription") {
      return new Response("Invalid webhook type", {
        status: 400,
      });
    }
    const agent_id = data.agent_id;
    const call_duration = data.metadata.call_duration_secs;
    const transcript = data.transcript
      .map((entry) => `${entry.role}: ${entry.message}`)
      .join("\n");
    const { error: dbError } = await supabase.from("conversations").upsert(
      {
        agent_id,
        transcript,
        call_duration,
      },
      {
        onConflict: "id",
      }
    );
    if (dbError) {
      console.error("Error upserting conversation:", dbError);
      return new Response("Internal Server Error", {
        status: 500,
      });
    }
    return new Response("Webhook processed successfully", {
      status: 200,
    });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return new Response("Bad Request", {
      status: 400,
    });
  }
});
