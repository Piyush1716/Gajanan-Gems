import { CONTACT_EMAIL, CONTACT_PHONE } from "@/config";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, Trash2 } from "lucide-react";

type Message = { role: "user" | "bot"; text: string };
const STORAGE_KEY = "shubh_chat_v1";
const CHAT_API_URL = (import.meta.env.VITE_CHAT_API_URL as string | undefined)?.replace(/\/$/, "");
const WELCOME: Message = {
  role: "bot",
  text: "👋 Hi! I'm GajananGems Assistant. Ask me anything about our crystals, bracelets, or healing gemstones. 💎",
};

export function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [WELCOME];
    } catch {
      return [WELCOME];
    }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const clearChat = () => {
    setMessages([WELCOME]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);

    if (!CHAT_API_URL) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: `⚠️ Chat service is not configured. Please contact us at ${CONTACT_EMAIL}.` },
      ]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${CHAT_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        const errorBody = await res.text().catch(() => "");
        const detail = (() => {
          try {
            return (JSON.parse(errorBody) as { detail?: string }).detail ?? "";
          } catch {
            return errorBody;
          }
        })();
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: `⚠️ ${detail || `Server error (${res.status}). Please try again.`}` },
        ]);
        return;
      }

      const data = await res.json();
      const botText = (data as { reply?: string; response?: string; message?: string }).reply
        ?? data.response
        ?? data.message
        ?? "Sorry, I didn't quite understand that. Could you rephrase?";
      setMessages((prev) => [...prev, { role: "bot", text: botText }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Could not reach the server. Please check your connection and try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat popup */}
      <div
        className={`fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 transition-all duration-300 origin-bottom-right ${
          open ? "scale-100 opacity-100 pointer-events-auto" : "scale-90 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden h-[480px]">
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between flex-shrink-0"
            style={{ backgroundColor: "#3F5C45", color: "#FFFFFF" }}
          >
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <div>
                <p className="font-semibold text-sm leading-none">GajananGems Assistant</p>
                <p className="text-[10px] opacity-80 mt-0.5">Ask about crystals &amp; healing</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                title="Clear chat"
                className="p-1 rounded-full transition-colors hover:bg-white/20"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-full transition-colors hover:bg-white/20"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div
                  className="flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center"
                  style={
                    m.role === "user"
                      ? { backgroundColor: "#3F5C45", color: "#FFFFFF" }
                      : { backgroundColor: "#EFE8DC" }
                  }
                >
                  {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div
                  className="max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed"
                  style={
                    m.role === "user"
                      ? { backgroundColor: "#3F5C45", color: "#FFFFFF", borderTopRightRadius: "0.25rem" }
                      : { backgroundColor: "#EFE8DC", color: "#2E2B26", borderTopLeftRadius: "0.25rem" }
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div
                  className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#EFE8DC" }}
                >
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl rounded-tl-sm px-4 py-3" style={{ backgroundColor: "#EFE8DC" }}>
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 flex gap-2 flex-shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message..."
              disabled={loading}
              className="flex-1 bg-background border border-input rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="rounded-full p-2.5 transition-colors disabled:opacity-40"
              style={{ backgroundColor: "#3F5C45", color: "#FFFFFF" }}
              onMouseOver={(e) => {
                if (!loading && input.trim()) e.currentTarget.style.backgroundColor = "#56785D";
              }}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#3F5C45")}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* FAB button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open AI chat"
        className="fixed bottom-6 right-4 sm:right-6 z-50 h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300"
        style={{ backgroundColor: "#3F5C45", color: "#FFFFFF" }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#56785D")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#3F5C45")}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
}
