import "dotenv/config";
import express from "express";
import cors from "cors";
import { runNearbeatAgent } from "./agent.js";

const app = express();
const PORT = process.env.PORT ?? 5005;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", agent: "nearbeat", model: "claude-sonnet-4-6", ts: new Date().toISOString() });
});

// Main agent endpoint
app.post("/api/pulse", async (req, res) => {
  const { persona } = req.body;

  if (!persona || !persona.key) {
    return res.status(400).json({ error: "persona context required" });
  }

  try {
    console.log(`[pulse] running agent for ${persona.name} (${persona.city})`);
    const result = await runNearbeatAgent(persona);
    console.log(`[pulse] done — ${result.offers?.length} offers, ${result._steps?.length} tool calls`);
    res.json(result);
  } catch (err) {
    console.error("[pulse] agent error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Nearbeat agent server running on :${PORT}`);
});
