import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";

type Message = { role: "user" | "bot"; text: string };
const STORAGE_KEY = "shubh_chat_v1";

export function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

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
    console.log("[AiChat] Sending message:", text);
    // alert("[AiChat] Sending message:"+ text );
    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      console.log(`[AiChat] Response received — status: ${res.status} ${res.statusText}`);
      
      // alert(`[AiChat] Response received — status: ${res.status} ${res.statusText}`);
      if (!res.ok) {
        const errorBody = await res.text().catch(() => "(unreadable body)");
        console.error(`[AiChat] API error: ${res.status} ${res.statusText}`, { url: res.url, reason: errorBody });
        setMessages((prev) => [...prev, { role: "bot", text: `⚠️ Server error (${res.status}). Please try again.` }]);
        return;
      }
      const data = await res.json();
      console.log("[AiChat] Response data:", data);
      const botText = data.reply ?? data.response ?? data.message ?? "Sorry, I didn't understand that.";
      console.log("[AiChat] Bot reply:", botText);
      setMessages((prev) => [...prev, { role: "bot", text: botText }]);
    } catch (err) {
      console.error("[AiChat] Network/fetch error:", err);
      // alert("[AiChat] Network/fetch error:");
      setMessages((prev) => [...prev, { role: "bot", text: "⚠️ Could not reach the server. Please try again." }]);
    } finally {
      setLoading(false);
      console.log("[AiChat] Request complete.");
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
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <div>
                <p className="font-semibold text-sm leading-none">Shubhanjali Assistant</p>
                <p className="text-[10px] opacity-80 mt-0.5">Ask about crystals & healing</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-primary-foreground/20">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm pt-8">
                <Bot className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Hi! Ask me anything about our crystals, bracelets, or healing gemstones. 💎</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                  {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-secondary text-foreground rounded-tl-sm"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3">
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
              className="bg-primary text-primary-foreground rounded-full p-2.5 hover:bg-primary/90 disabled:opacity-40 transition-colors"
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
        className={`fixed bottom-6 right-4 sm:right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 flex items-center justify-center transition-all duration-300 ${open ? "rotate-90" : "rotate-0"}`}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
}