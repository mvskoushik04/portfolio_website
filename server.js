import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GROQ_API_KEY;
console.log("Loaded API key:", API_KEY ? "YES" : "NO");

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
        messages: messages,
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

app.listen(3000, () => {
  console.log("Groq Chat API server running on http://localhost:3000");
});