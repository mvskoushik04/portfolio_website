import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve your HTML, CSS, images, etc.
app.use(express.static(__dirname));

const API_KEY = process.env.GROQ_API_KEY;
console.log("Loaded API key:", API_KEY ? "YES" : "NO");

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages,
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      console.error("Groq API Error:", data);
      return res.status(groqResponse.status).json({
        error: "Groq API request failed",
        details: data.error ? data.error.message : "Unknown API error"
      });
    }

    res.json(data);

  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Server internal error", details: err.message });
  }
});

// Serve index.html for all routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Groq Chat API server running on http://localhost:${PORT}`);
});
