import { useState } from "react";

function App() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [actions, setActions] = useState([]);

  const handleSummarize = async () => {
    const response = await fetch("http://localhost:5000/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();
    setSummary(data.summary);
    setActions(data.actionItems || []);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>AI Message Summarizer</h1>
      <textarea
        rows="5"
        cols="60"
        placeholder="Paste SMS conversation here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <br />
      <button onClick={handleSummarize} style={{ marginTop: "10px" }}>
        Summarize
      </button>
      <h2>Summary</h2>
      <p>{summary}</p>
      <h2>Action Items</h2>
      <ul>
        {actions.map((a, i) => (
          <li key={i}>{a}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
