import Anthropic from "@anthropic-ai/sdk";
import { get_merchants_nearby, get_live_weather, score_signal_relevance } from "./tools.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ---------------------------------------------------------------------------
// Tool definitions for Claude
// ---------------------------------------------------------------------------
const TOOLS = [
  {
    name: "get_merchants_nearby",
    description:
      "Fetch merchants near the user's current city that are relevant to their context and habits. Call this first to ground your recommendations in real available options.",
    input_schema: {
      type: "object",
      properties: {
        city: { type: "string", description: "User's current city (e.g. Cambridge, Boston, Longwood)" },
        categories: {
          type: "array",
          items: { type: "string" },
          description: "Merchant categories to prioritize (coffee, dining, wellness, retail, gas, groceries, accessories, health)",
        },
      },
      required: ["city"],
    },
  },
  {
    name: "get_live_weather",
    description: "Get current weather conditions and advisory for the user's city.",
    input_schema: {
      type: "object",
      properties: {
        city: { type: "string", description: "User's city" },
      },
      required: ["city"],
    },
  },
  {
    name: "score_signal_relevance",
    description:
      "Score how relevant a specific signal type is for this user RIGHT NOW (0.0–1.0). Use this to decide which signals to cite in your offers. Call for the top 3-4 signals you're considering.",
    input_schema: {
      type: "object",
      properties: {
        signal: {
          type: "string",
          enum: ["route", "schedule", "habit", "weather", "spend", "health", "email"],
          description: "The signal to score",
        },
        context: {
          type: "object",
          description: "The user's context object (pass the full context you received)",
        },
      },
      required: ["signal", "context"],
    },
  },
];

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `You are Nearbeat — a personalized AI city-wallet agent.

Your mission: reason over a user's live signals (route, schedule, spending habits, weather, health, email bookings) and generate exactly 3 hyper-relevant, time-sensitive offers from real nearby merchants.

Rules:
1. ALWAYS call get_merchants_nearby first to see what's actually available nearby.
2. ALWAYS call score_signal_relevance for at least 3 signals to determine which are strongest.
3. Call get_live_weather to factor in real conditions.
4. Each offer MUST cite a different primary signal (no two offers may share the same signal_used).
5. Offer copy must feel personal and specific — never generic. Reference the user's actual habits, schedule, or route.
6. Distance and ETA must come from the merchant data you fetched — don't invent them.
7. Output ONLY valid JSON — no markdown, no explanation outside the JSON.

Output format (exactly):
{
  "agent_reasoning": "2-3 sentences explaining the signals you found and why you chose these 3 merchants",
  "signals_active": ["signal1", "signal2", "signal3"],
  "offers": [
    {
      "merchant_id": "from-tool-data",
      "merchant_name": "Exact name from tool data",
      "merchant_emoji": "emoji",
      "category": "Category · location context",
      "offer": "Specific, personalized offer text",
      "value": "Dollar value or perk",
      "reason": "Why this is relevant to you right now — cite the specific data source",
      "signal_used": "route|schedule|habit|weather|spend|health|email",
      "data_source": "google_maps|google_calendar|plaid|gmail|healthkit|openweather",
      "distance_m": 300,
      "eta_min": 6
    }
  ]
}`;

// ---------------------------------------------------------------------------
// Tool dispatcher
// ---------------------------------------------------------------------------
function callTool(name, input) {
  switch (name) {
    case "get_merchants_nearby":   return get_merchants_nearby(input);
    case "get_live_weather":       return get_live_weather(input);
    case "score_signal_relevance": return score_signal_relevance(input);
    default: return { error: `Unknown tool: ${name}` };
  }
}

// ---------------------------------------------------------------------------
// Agentic loop
// ---------------------------------------------------------------------------
export async function runNearbeatAgent(personaContext) {
  const steps = [];
  const messages = [
    {
      role: "user",
      content: `Generate 3 personalized offers for this user. Here is their full live context:\n\n${JSON.stringify(personaContext, null, 2)}`,
    },
  ];

  let response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    tools: TOOLS,
    messages,
  });

  // Agentic loop — keep running while Claude wants to call tools
  while (response.stop_reason === "tool_use") {
    const toolUseBlocks = response.content.filter((b) => b.type === "tool_use");

    // Record assistant turn
    messages.push({ role: "assistant", content: response.content });

    // Execute all tool calls in parallel
    const toolResults = await Promise.all(
      toolUseBlocks.map(async (block) => {
        const result = callTool(block.name, block.input);
        steps.push({ tool: block.name, input: block.input, result });
        return {
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(result),
        };
      })
    );

    messages.push({ role: "user", content: toolResults });

    response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages,
    });
  }

  // Extract final JSON from text response
  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock) throw new Error("No text response from agent");

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Could not parse agent JSON: ${textBlock.text}`);

  const result = JSON.parse(jsonMatch[0]);
  return { ...result, _steps: steps, _input_tokens: response.usage.input_tokens, _output_tokens: response.usage.output_tokens };
}
