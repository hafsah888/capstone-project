import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { model, MAX_TOKENS, SYSTEM_PROMPT } from "@/lib/ai/config";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || !Array.isArray(body.messages)) {
      return Response.json(
        { error: "A messages array is required." },
        { status: 400 },
      );
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "GOOGLE_GENERATIVE_AI_API_KEY is not configured on the server." },
        { status: 500 },
      );
    }

    const messages = body.messages as UIMessage[];

    const result = streamText({
      model,
      system: SYSTEM_PROMPT,
      maxOutputTokens: MAX_TOKENS,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
    });
  } catch (error) {
    console.error("Chat route error:", error);
    return Response.json(
      { error: "Unable to generate a response right now." },
      { status: 500 },
    );
  }
}
