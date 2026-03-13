import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

/* ── Types ────────────────────────────────────────────────── */

interface TTSRequestBody {
  provider: "google-cloud" | "elevenlabs";
  apiKey: string;
  text: string;
}

/* ── Validation ──────────────────────────────────────────── */

function validate(body: unknown): { data?: TTSRequestBody; error?: string } {
  if (!body || typeof body !== "object") {
    return { error: "Request body must be a JSON object" };
  }

  const b = body as Record<string, unknown>;

  if (!b.provider || !["google-cloud", "elevenlabs"].includes(b.provider as string)) {
    return { error: 'provider must be one of: "google-cloud", "elevenlabs"' };
  }
  if (!b.apiKey || typeof b.apiKey !== "string") {
    return { error: "apiKey is required and must be a string" };
  }
  if (!b.text || typeof b.text !== "string") {
    return { error: "text is required and must be a string" };
  }
  if (b.text.length > 500) {
    return { error: "text must be 500 characters or fewer" };
  }

  return { data: b as unknown as TTSRequestBody };
}

/* ── POST handler ────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { data, error } = validate(body);
  if (!data) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    switch (data.provider) {
      case "google-cloud":
        return await handleGoogleCloud(data);
      case "elevenlabs":
        return await handleElevenLabs(data);
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown TTS proxy error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

/* ── Google Cloud TTS ────────────────────────────────────── */

async function handleGoogleCloud(data: TTSRequestBody) {
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${data.apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { text: data.text },
      voice: {
        languageCode: "he-IL",
        name: "he-IL-Wavenet-A",
        ssmlGender: "FEMALE",
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: 0.9,
        pitch: 0,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json(
      { error: `Google Cloud TTS error ${res.status}: ${err}` },
      { status: res.status }
    );
  }

  const json = await res.json();
  const audioContent = json.audioContent as string;

  // Decode base64 to binary
  const binaryStr = atob(audioContent);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(bytes.length),
    },
  });
}

/* ── ElevenLabs TTS ──────────────────────────────────────── */

async function handleElevenLabs(data: TTSRequestBody) {
  // Rachel voice — good multilingual support
  const voiceId = "21m00Tcm4TlvDq8ikWAM";
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": data.apiKey,
    },
    body: JSON.stringify({
      text: data.text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json(
      { error: `ElevenLabs error ${res.status}: ${err}` },
      { status: res.status }
    );
  }

  // Stream the audio response back to the client
  const audioData = await res.arrayBuffer();

  return new NextResponse(audioData, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(audioData.byteLength),
    },
  });
}
