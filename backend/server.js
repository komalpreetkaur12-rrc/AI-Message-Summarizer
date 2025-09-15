import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const SAMBANOVA_API_KEY = process.env.SAMBANOVA_API_KEY;

app.post("/summarize", async (req, res) => {
  const { text } = req.body;

  if (!text) return res.status(400).json({ error: "No text provided" });

  try {
    // Call SambaNova AI
    const response = await axios.post(
      "https://api.sambanova.ai/v1/chat/completions",
      {
        model: "Meta-Llama-3.1-8B-Instruct",
        messages: [
          {
            role: "system",
            content: `
You are an assistant that summarizes conversations.
Always respond strictly in JSON format with these two fields:
1. "summary": a short summary of the conversation.
2. "actionItems": an array of tasks in the format "Person: Task".
Do not include any text outside the JSON object. Do not include "Summary" or "Action Items" headers.
`
          },
          { role: "user", content: text }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SAMBANOVA_API_KEY}`
        }
      }
    );

    const aiText = response.data.choices[0].message.content || "";

    // Parse JSON strictly
    let parsed;
    try {
      parsed = JSON.parse(aiText);
    } catch (jsonErr) {
      console.error("JSON parse error:", jsonErr, "AI output:", aiText);
      return res.status(500).json({ error: "Failed to parse AI JSON output" });
    }

    // Ensure actionItems format
    parsed.actionItems = parsed.actionItems.map(item =>
      item.includes(":") ? item.trim() : `---: ${item.trim()}`
    );

    res.json({
      summary: parsed.summary,
      actionItems: parsed.actionItems
    });

  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to summarize" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
