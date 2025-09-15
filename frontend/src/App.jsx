import { useState } from "react";

function App() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [assigned, setAssigned] = useState({ Bob: [], Alice: [], Both: [] });
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    if (!text.trim()) return;
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      setSummary(data.summary);
      setAssigned(data.assigned || { Bob: [], Alice: [], Both: [] });
    } catch (err) {
      console.error("Error:", err);
      setSummary("Failed to summarize.");
      setAssigned({ Bob: [], Alice: [], Both: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>AI Message Summarizer</h1>
      <textarea
        rows="6"
        cols="60"
        placeholder="Paste SMS or meeting conversation here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <br />
      <button onClick={handleSummarize} style={{ marginTop: "10px" }}>
        {loading ? "Summarizing..." : "Summarize"}
      </button>

      {summary && (
        <>
          <h2>Summary</h2>
          <p>{summary}</p>
        </>
      )}

      {Object.values(assigned).some(arr => arr.length > 0) && (
        <>
          <h2>Action Items</h2>
          {assigned.Bob.length > 0 && <p><strong>Bob:</strong> {assigned.Bob.join(", ")}</p>}
          {assigned.Alice.length > 0 && <p><strong>Alice:</strong> {assigned.Alice.join(", ")}</p>}
          {assigned.Both.length > 0 && <p><strong>Both:</strong> {assigned.Both.join(", ")}</p>}
        </>
      )}
    </div>
  );
}

export default App;
