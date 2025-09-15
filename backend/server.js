import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/summarize", async (req, res) => {
  const { text } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Ask Gemini for BOTH summary and action items
    const prompt = `
      Summarize this conversation in 1-2 sentences.
      Then list any clear action items as a JSON array.
      
      Conversation:
      ${text}

      Respond strictly in JSON:
      {
        "summary": "...",
        "actionItems": ["...", "..."]
      }
    `;

    const result = await model.generateContent(prompt);
    let output = result.response.text();

    // 🔹 Clean up Gemini’s Markdown formatting if present
    output = output.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(output);
    } catch (e) {
      console.error("Failed to parse JSON:", output);

      // Fallback: return plain text summary if JSON parse fails
      return res.json({
        summary: output,
        actionItems: []
      });
    }

    res.json(parsed);
  } catch (err) {
    console.error("Summarization error:", err);
    res.status(500).json({ error: "Failed to summarize" });
  }
});

// ✅ Start the server
const PORT = 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
