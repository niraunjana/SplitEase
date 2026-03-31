import { useState, useRef, useEffect } from "react";
import { getGroups } from "../utils/storage";

async function askGemini(messages, groupData) {
  const systemPrompt =
    "You are SplitEase AI, a smart expense assistant embedded inside a group expense splitter app.\n\n" +
    "Here is the LIVE data from the user's app right now:\n" +
    JSON.stringify(groupData, null, 2) +
    "\n\nGuidelines:\n" +
    "- Answer concisely (2-4 sentences). Be specific - use real names, amounts, and groups from the data.\n" +
    "- Use Rs. for currency (Indian Rupees), shown as the rupee symbol.\n" +
    "- When listing balances, clearly state who owes and who gets back money.\n" +
    "- For settlement suggestions, give the minimum transactions to settle all debts.\n" +
    "- For spending insights, mention category breakdowns and percentages.\n" +
    "- If the user types something like 'pizza 800 4 people', parse it into: description, amount, number of people, per-person share.\n" +
    "- Be friendly and conversational.";

  // v1 does not support system_instruction field, so inject system prompt as first user/model exchange
  const systemTurn = [
    { role: "user", parts: [{ text: systemPrompt }] },
    { role: "model", parts: [{ text: "Got it! I'm ready to help with your SplitEase expenses." }] },
  ];

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" +
      import.meta.env.VITE_GEMINI_API_KEY,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          ...systemTurn,
          ...messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
        ],
      }),
    }
  );

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || "HTTP " + response.status);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
}

const SUGGESTIONS = [
  "Who owes the most?",
  "Optimize settlements",
  "Spending by category",
  "Summarize all groups",
];

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;

    setInput("");
    setShowSuggestions(false);
    setError(null);

    const userMsg = { role: "user", content: q };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setLoading(true);

    try {
      if (!import.meta.env.VITE_GEMINI_API_KEY) {
        throw new Error("API key missing. Add VITE_GEMINI_API_KEY to your .env file.");
      }

      const groupData = getGroups();
      const reply = await askGemini(updatedHistory, groupData);
      setMessages([...updatedHistory, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("SplitEase AI error:", err.message);
      setError(err.message);
      setMessages([
        ...updatedHistory,
        {
          role: "assistant",
          content: "⚠️ " + (err.message || "Sorry, I couldn't reach the AI right now. Please try again."),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
    setError(null);
  };

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6C63FF, #4f46e5)",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(108,99,255,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        title="AI Assistant"
      >
        <span style={{ fontSize: "22px" }}>{open ? "✕" : "✨"}</span>
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "92px",
            right: "24px",
            width: "360px",
            maxHeight: "520px",
            display: "flex",
            flexDirection: "column",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            zIndex: 999,
            fontFamily: "'Segoe UI', sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #6C63FF, #4f46e5)",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                }}
              >
                ✨
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: "14px", color: "#fff" }}>
                  SplitEase AI
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.75)" }}>
                  Powered by Gemini
                </p>
              </div>
            </div>
            <button
              onClick={clearChat}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: "8px",
                padding: "4px 10px",
                color: "#fff",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "14px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              background: "#f9fafb",
            }}
          >
            {messages.length === 0 && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  fontSize: "13px",
                  color: "#374151",
                  lineHeight: 1.6,
                }}
              >
                👋 Hi! I'm your expense assistant. Ask me anything about your
                groups, balances, or spending habits.
              </div>
            )}

            {showSuggestions && messages.length === 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    style={{
                      padding: "6px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "20px",
                      background: "#fff",
                      color: "#4f46e5",
                      fontSize: "12px",
                      cursor: "pointer",
                      fontWeight: 500,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#eef2ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "82%",
                    padding: "10px 13px",
                    borderRadius:
                      msg.role === "user"
                        ? "14px 14px 4px 14px"
                        : "14px 14px 14px 4px",
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg,#6C63FF,#4f46e5)"
                        : "#fff",
                    color: msg.role === "user" ? "#fff" : "#1f2937",
                    border: msg.role === "user" ? "none" : "1px solid #e5e7eb",
                    fontSize: "13px",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "10px 14px",
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "14px 14px 14px 4px",
                    display: "flex",
                    gap: "4px",
                    alignItems: "center",
                  }}
                >
                  {[0, 1, 2].map((d) => (
                    <div
                      key={d}
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: "#6C63FF",
                        animation: "bounce 1s infinite",
                        animationDelay: d * 0.15 + "s",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input row */}
          <div
            style={{
              padding: "12px",
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              gap: "8px",
              background: "#fff",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about expenses..."
              disabled={loading}
              style={{
                flex: 1,
                padding: "9px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                fontSize: "13px",
                outline: "none",
                color: "#1f2937",
                background: "#f9fafb",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#6C63FF")}
              onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                padding: "9px 14px",
                background:
                  loading || !input.trim()
                    ? "#9ca3af"
                    : "linear-gradient(135deg,#6C63FF,#4f46e5)",
                border: "none",
                borderRadius: "10px",
                color: "#fff",
                fontWeight: 600,
                fontSize: "13px",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                transition: "background 0.2s",
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}
