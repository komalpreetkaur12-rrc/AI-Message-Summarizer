import { useState } from "react";

function App() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [assigned, setAssigned] = useState({});
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

      // Convert actionItems array to object keyed by person
      const assignedObj = {};
      data.actionItems.forEach(item => {
        const [person, task] = item.split(":").map(s => s.trim());
        if (!assignedObj[person]) assignedObj[person] = [];
        assignedObj[person].push(task);
      });

      setAssigned(assignedObj);

    } catch (err) {
      console.error("Error:", err);
      setSummary("Failed to summarize.");
      setAssigned({});
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

      {Object.keys(assigned).length > 0 && (
        <>
          <h2>Action Items</h2>
          {Object.entries(assigned).map(([person, tasks]) => (
            <div key={person} style={{ marginBottom: "10px" }}>
              <strong>{person}:</strong>
              <ul>
                {tasks.map((task, idx) => (
                  <li key={idx}>{task}</li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default App;
