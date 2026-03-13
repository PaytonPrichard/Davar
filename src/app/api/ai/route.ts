import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

/* ── Types ────────────────────────────────────────────────── */

interface AIRequestBody {
  provider: "openai" | "anthropic" | "gemini";
  apiKey: string;
  model: string;
  prompt: string;
  systemPrompt?: string;
}

/* ── Provider endpoints ──────────────────────────────────── */

function getGeminiUrl(model: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

/* ── Validation ──────────────────────────────────────────── */

function validate(body: unknown): { data?: AIRequestBody; error?: string } {
  if (!body || typeof body !== "object") {
    return { error: "Request body must be a JSON object" };
  }

  const b = body as Record<string, unknown>;

  if (!b.provider || !["openai", "anthropic", "gemini"].includes(b.provider as string)) {
    return { error: 'provider must be one of: "openai", "anthropic", "gemini"' };
  }
  if (!b.apiKey || typeof b.apiKey !== "string") {
    return { error: "apiKey is required and must be a string" };
  }
  if (!b.model || typeof b.model !== "string") {
    return { error: "model is required and must be a string" };
  }
  if (!b.prompt || typeof b.prompt !== "string") {
    return { error: "prompt is required and must be a string" };
  }
  if (b.prompt.length > 2000) {
    return { error: "prompt must be 2000 characters or fewer" };
  }
  if (b.systemPrompt !== undefined && typeof b.systemPrompt !== "string") {
    return { error: "systemPrompt must be a string if provided" };
  }

  return { data: b as unknown as AIRequestBody };
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
      case "gemini":
        return await handleGemini(data);
      case "openai":
        return await handleOpenAI(data);
      case "anthropic":
        return await handleAnthropic(data);
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown AI proxy error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

/* ── Gemini ───────────────────────────────────────────────── */

async function handleGemini(data: AIRequestBody) {
  const contents = [
    {
      role: "user",
      parts: [{ text: data.prompt }],
    },
  ];

  const body: Record<string, unknown> = { contents };

  if (data.systemPrompt) {
    body.systemInstruction = { parts: [{ text: data.systemPrompt }] };
  }

  body.generationConfig = {
    temperature: 0.7,
    maxOutputTokens: 1024,
  };

  // Key in URL is fine server-side
  const res = await fetch(`${getGeminiUrl(data.model)}?key=${data.apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json(
      { error: `Gemini API error ${res.status}: ${err}` },
      { status: res.status }
    );
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return NextResponse.json({ text });
}

/* ── OpenAI ───────────────────────────────────────────────── */

async function handleOpenAI(data: AIRequestBody) {
  const messages: { role: string; content: string }[] = [];

  if (data.systemPrompt) {
    messages.push({ role: "system", content: data.systemPrompt });
  }
  messages.push({ role: "user", content: data.prompt });

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.apiKey}`,
    },
    body: JSON.stringify({
      model: data.model,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json(
      { error: `OpenAI API error ${res.status}: ${err}` },
      { status: res.status }
    );
  }

  const json = await res.json();
  const text = json?.choices?.[0]?.message?.content ?? "";
  return NextResponse.json({ text });
}

/* ── Anthropic ────────────────────────────────────────────── */

async function handleAnthropic(data: AIRequestBody) {
  const messages = [{ role: "user" as const, content: data.prompt }];

  const body: Record<string, unknown> = {
    model: data.model,
    messages,
    max_tokens: 1024,
    temperature: 0.7,
  };

  if (data.systemPrompt) {
    body.system = data.systemPrompt;
  }

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": data.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json(
      { error: `Anthropic API error ${res.status}: ${err}` },
      { status: res.status }
    );
  }

  const json = await res.json();
  const text = json?.content?.[0]?.text ?? "";
  return NextResponse.json({ text });
}
