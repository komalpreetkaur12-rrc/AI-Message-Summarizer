import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  const { text } = await req.json();

  if (!text) {
    return NextResponse.json({ error: "No text provided" }, { status: 400 });
  }

  try {
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
Do not include any text outside the JSON object.
`
          },
          { role: "user", content: text }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SAMBANOVA_API_KEY}`,
        },
      }
    );

    const aiText = response.data.choices[0].message.content || "";

    let parsed;
    try {
      parsed = JSON.parse(aiText);
    } catch (err) {
      console.error("JSON parse error:", err, "AI output:", aiText);
      return NextResponse.json({ error: "Failed to parse AI JSON output" }, { status: 500 });
    }

    parsed.actionItems = parsed.actionItems.map(item =>
      item.includes(":") ? item.trim() : `---: ${item.trim()}`
    );

    return NextResponse.json({
      summary: parsed.summary,
      actionItems: parsed.actionItems
    });
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
    return NextResponse.json({ error: "Failed to summarize" }, { status: 500 });
  }
}