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

  try {
    const response = await axios.post(
      "https://api.sambanova.ai/v1/chat/completions",
      {
        model: "Meta-Llama-3.1-8B-Instruct",
        messages: [
          {
            role: "system",
            content:
              "You are an assistant that summarizes text and lists action items clearly in bullet points, mentioning the person responsible if possible. Do not add any bold formatting."
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

    let aiText = response.data.choices[0].message.content || "";
    aiText = aiText.replace(/\*\*/g, "").trim(); // remove any **

    // Split summary and action items
    let summary = "";
    let actionItemsText = "";
    const splitIndex = aiText.indexOf("Action Items:");
    if (splitIndex !== -1) {
      summary = aiText.slice(0, splitIndex).trim();
      actionItemsText = aiText.slice(splitIndex + "Action Items:".length).trim();
    } else {
      summary = aiText;
    }

    // Split individual action items
    const actionItems = actionItemsText
      .split(/\n|•|-/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    // Assign tasks
    const assigned = { Bob: [], Alice: [], Both: [] };
    actionItems.forEach(item => {
      let cleanItem = item.replace(/\*\*/g, "").trim();
      const lower = cleanItem.toLowerCase();

      if (lower.includes("bob") && !lower.includes("alice")) {
        assigned.Bob.push(cleanItem.replace(/bob[:]?/i, "").trim());
      } else if (lower.includes("alice") && !lower.includes("bob")) {
        assigned.Alice.push(cleanItem.replace(/alice[:]?/i, "").trim());
      } else {
        cleanItem = cleanItem.replace(/^(and\s+)?(alice|bob)[:]?/gi, "").trim();
        if (cleanItem) assigned.Both.push(cleanItem);
      }
    });

    res.json({ summary, assigned }); // always send arrays

  } catch (err) {
    console.error("SambaNova error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to summarize" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
