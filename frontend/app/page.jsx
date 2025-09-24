"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true); // NEW
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [assigned, setAssigned] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!showWelcome) textareaRef.current?.focus();
  }, [showWelcome]);

  const handleSummarize = useCallback(async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to summarize.");

      setSummary(data.summary || "");
      const obj = {};
      (Array.isArray(data.actionItems) ? data.actionItems : []).forEach(
        (item) => {
          const [person, task] = String(item).split(":").map((s) => s.trim());
          if (!person || !task) return;
          if (!obj[person]) obj[person] = [];
          obj[person].push(task);
        }
      );
      setAssigned(obj);
    } catch (e) {
      setSummary("");
      setAssigned({});
      setError(e?.message || "Failed to summarize.");
    } finally {
      setLoading(false);
    }
  }, [text]);

  const handleClear = useCallback(() => {
    setText("");
    setSummary("");
    setAssigned({});
    setError("");
    textareaRef.current?.focus();
  }, []);

  const hasResults =
    summary.trim().length > 0 || Object.keys(assigned).length > 0;

  // Motion variants
  const card = {
    hidden: { opacity: 0, y: 10, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 260, damping: 22 },
    },
  };
  const list = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.05 },
    },
  };
  const item = {
    hidden: { opacity: 0, y: 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-cyan-100">
      {/* --- Background --- */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(1200px_600px_at_50%_-10%,rgba(0,255,255,.15),transparent_60%),radial-gradient(900px_500px_at_10%_100%,rgba(255,0,170,.15),transparent_60%),radial-gradient(900px_500px_at_90%_100%,rgba(136,0,255,.14),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_96%,rgba(0,255,255,.08)_100%)] bg-[length:100%_2px] mix-blend-screen" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent,rgba(0,255,255,0.04))]" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,255,255,.12)_1px,transparent_1px),linear-gradient(rgba(255,0,170,.12)_1px,transparent_1px)] bg-[size:40px_40px] animate-[gridShift_8s_linear_infinite]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,0,170,.15),transparent_60%),radial-gradient(circle_at_70%_80%,rgba(0,255,255,.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,.06)_1px,transparent_1px)] bg-[length:100%_3px] opacity-40 mix-blend-screen animate-[scanMove_6s_linear_infinite]" />
        <div className="absolute inset-0 opacity-[0.07] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* --- Neon frame --- */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute left-0 right-0 top-0 h-[2px] origin-left bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-fuchsia-500"
      />
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="absolute bottom-0 left-0 top-0 w-[2px] origin-top bg-gradient-to-b from-cyan-400 via-fuchsia-500 to-cyan-400"
      />

      <main className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-10">
        <AnimatePresence mode="wait">
          {showWelcome ? (
            // --- WELCOME PAGE ---
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="mb-6 text-5xl font-extrabold bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
                Welcome to AI Message Summarizer
              </h1>
              <p className="mb-8 text-cyan-200/80 max-w-xl mx-auto">
                Paste your notes, SMS, or chat threads — and let AI distill them
                into a clear summary with action items.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowWelcome(false)}
                className="rounded-xl bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-cyan-400 px-6 py-3 text-lg font-semibold text-black shadow-[0_0_25px_rgba(217,70,239,.55)] hover:shadow-[0_0_45px_rgba(217,70,239,.8)]"
              >
                Get Started
              </motion.button>
            </motion.div>
          ) : (
            // --- SUMMARIZER APP ---
            <motion.div
              key="app"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="w-full"
            >
              <motion.h1 className="relative mb-6 text-center text-4xl font-extrabold tracking-tight sm:text-5xl">
                <motion.span
                  initial={{ opacity: 1 }}
                  animate={{
                    opacity: [1, 0.6, 1, 0.8, 1],
                    filter: [
                      "drop-shadow(0 0 20px rgba(34,211,238,0.35))",
                      "drop-shadow(0 0 10px rgba(34,211,238,0.15))",
                      "drop-shadow(0 0 25px rgba(34,211,238,0.4))",
                      "drop-shadow(0 0 12px rgba(34,211,238,0.2))",
                      "drop-shadow(0 0 20px rgba(34,211,238,0.35))",
                    ],
                  }}
                  transition={{
                    delay: 3,
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 1.2,
                  }}
                  className="bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent"
                >
                  AI Message Summarizer
                </motion.span>
                <span className="absolute inset-0 -z-10 animate-pulse select-none bg-gradient-to-r from-fuchsia-700/10 via-cyan-700/10 to-fuchsia-700/10 blur-3xl" />
              </motion.h1>

              {/* --- Main Card --- */}
              <motion.section
                variants={card}
                initial="hidden"
                animate="show"
                className="w-full rounded-2xl border border-cyan-500/20 bg-black/60 p-4 shadow-[0_0_40px_rgba(34,211,238,.15)] backdrop-blur-xl sm:p-6"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* LEFT: Input */}
                  <div className="rounded-xl border border-fuchsia-500/20 bg-black/40 p-4 shadow-[0_0_30px_rgba(217,70,239,.15)]">
                    <div className="mb-2 flex items-center justify-between">
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-fuchsia-300/90">
                        Input
                      </h2>
                      <div className="flex items-center gap-2 text-[11px]">
                        <button
                          onClick={() =>
                            setText(
                              "Alice: Alright team, let’s sync.\nBob: Sure — what’s first on the list?\nAlice: I’ll prepare the project timeline by tomorrow.\nCara: I’ll reach out to the client for feedback today.\nDavid: I’ll draft the budget sheet and share it tonight.\nBob: Got it, I’ll update the documentation.\nAlice: Perfect, let’s aim to review all updates in tomorrow’s meeting.\nCara: I’ll also set up the meeting invite.\nDavid: Good, I’ll be ready with numbers by then.\nBob: Great, let’s stick to the plan!\n"
                            )
                          }
                          className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-cyan-200 hover:bg-cyan-500/20"
                        >
                          Sample
                        </button>
                        <label className="cursor-pointer rounded-md border border-fuchsia-500/30 bg-fuchsia-500/10 px-2.5 py-1 text-fuchsia-200 hover:bg-fuchsia-500/20">
                          <input
                            type="file"
                            accept=".txt"
                            className="hidden"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              const txt = await f.text();
                              setText(txt);
                            }}
                          />
                          .txt
                        </label>
                      </div>
                    </div>

                    <motion.textarea
                      ref={textareaRef}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Paste SMS, Slack threads, or meeting notes…"
                      className="h-48 w-full resize-none rounded-lg border border-cyan-500/30 bg-black/60 p-3 font-mono text-[13.5px] leading-6 text-cyan-100 placeholder:text-cyan-400/40 focus:outline-none focus:ring-4 focus:ring-fuchsia-500/25"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                    />
                    <div className="mt-2 flex items-center justify-between text-[11px] text-cyan-300/70">
                      <span>chars: {text.length}</span>
                      <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5">
                        Ctrl/⌘+Enter
                      </span>
                    </div>
                  </div>

                  {/* RIGHT: Results */}
                  <div className="rounded-xl border border-cyan-500/20 bg-black/40 p-4 shadow-[0_0_30px_rgba(34,211,238,.15)]">
                    <div className="mb-2 flex items-center justify-between">
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-cyan-300/90">
                        Results
                      </h2>
                      <button
                        disabled={!hasResults}
                        onClick={async () => {
                          const out = [];
                          if (summary) out.push("Summary:\n" + summary);
                          const keys = Object.keys(assigned);
                          if (keys.length) {
                            out.push("\nAction Items:");
                            keys.forEach((k) =>
                              assigned[k].forEach((t) =>
                                out.push(`- ${k}: ${t}`)
                              )
                            );
                          }
                          const final = out.join("\n");
                          if (final)
                            await navigator.clipboard.writeText(final);
                        }}
                        className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-50"
                      >
                        Copy
                      </button>
                    </div>

                    <div className="grid gap-3">
                      <AnimatePresence mode="popLayout">
                        {summary ? (
                          <motion.div
                            key="summary"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{
                              type: "spring",
                              stiffness: 280,
                              damping: 22,
                            }}
                            className="rounded-lg border border-fuchsia-500/30 bg-black/60 p-3"
                          >
                            <div className="mb-1 text-sm font-semibold text-fuchsia-300">
                              Summary
                            </div>
                            <p className="whitespace-pre-wrap text-sm text-cyan-100/90">
                              {summary}
                            </p>
                          </motion.div>
                        ) : (
                          !loading && (
                            <motion.div
                              key="placeholder"
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              className="rounded-lg border border-dashed border-cyan-500/30 bg-black/50 p-6 text-center text-sm text-cyan-300/70"
                            >
                              Your summary will appear here.
                            </motion.div>
                          )
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {Object.keys(assigned).length > 0 && (
                          <motion.div
                            key="actions"
                            variants={list}
                            initial="hidden"
                            animate="show"
                            className="rounded-lg border border-cyan-500/30 bg-black/60 p-3"
                          >
                            <div className="mb-2 text-sm font-semibold text-cyan-300">
                              Action Items
                            </div>
                            <div className="grid gap-2">
                              {Object.entries(assigned).map(
                                ([person, tasks]) => (
                                  <motion.div
                                    key={person}
                                    variants={item}
                                    className="rounded-md border border-fuchsia-500/30 bg-black/60 p-2"
                                  >
                                    <div className="mb-1 text-[13px] font-semibold text-fuchsia-300">
                                      {person}
                                    </div>
                                    <ul className="list-disc list-inside space-y-1 text-[13px] text-cyan-100/90">
                                      {tasks.map((t, i) => (
                                        <li
                                          key={i}
                                          className="hover:text-cyan-300/90 transition-colors"
                                        >
                                          {t}
                                        </li>
                                      ))}
                                    </ul>
                                  </motion.div>
                                )
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {loading && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="grid place-items-center rounded-lg border border-cyan-500/30 bg-black/60 p-6"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              repeat: Infinity,
                              duration: 1,
                              ease: "linear",
                            }}
                            className="h-5 w-5 rounded-full border-2 border-cyan-400/60 border-t-transparent"
                          />
                          <p className="mt-2 text-xs text-cyan-300/80">
                            Synthesizing…
                          </p>
                        </motion.div>
                      )}

                      {error && (
                        <div className="text-sm text-fuchsia-300/90">
                          {error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    onClick={handleClear}
                    className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-200 hover:bg-fuchsia-500/20"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleSummarize}
                    disabled={loading || !text.trim()}
                    className="rounded-xl bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-cyan-400 px-5 py-2 text-sm font-semibold text-black shadow-[0_0_25px_rgba(217,70,239,.55)] transition hover:shadow-[0_0_45px_rgba(217,70,239,.8)] disabled:opacity-60"
                  >
                    {loading ? "Summarizing…" : "Summarize"}
                  </button>
                </div>

                {/* Back to Welcome */}
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowWelcome(true)}
                    className="text-xs text-cyan-300/70 hover:text-cyan-200 underline"
                  >
                    Back to Welcome
                  </button>
                </div>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}