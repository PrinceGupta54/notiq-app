// src/app/doubt-chat/page.js
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Suspense } from "react";
import AppShell from "@/components/AppShell";
import { Send, Trash2, Sparkles, Bot, User, Zap } from "lucide-react";

// ── Ambient orbs ─────────────────────────────────────────────
function AmbientOrbs() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <div style={{
        position: "absolute", top: "-18%", left: "-8%",
        width: 520, height: 520, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.13) 0%, transparent 68%)",
        filter: "blur(72px)",
        animation: "orbA 15s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: "10%", right: "-10%",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)",
        filter: "blur(60px)",
        animation: "orbB 18s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
        filter: "blur(50px)",
        transform: "translate(-50%,-50%)",
        animation: "orbC 12s ease-in-out infinite",
      }} />
      <style>{`
        @keyframes orbA{0%,100%{transform:translate(0,0) scale(1)}40%{transform:translate(35px,50px) scale(1.07)}70%{transform:translate(-20px,20px) scale(0.95)}}
        @keyframes orbB{0%,100%{transform:translate(0,0)}45%{transform:translate(-30px,-40px) scale(1.05)}75%{transform:translate(20px,-15px)}}
        @keyframes orbC{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.15)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulseRing{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.18);opacity:0}}
      `}</style>
    </div>
  );
}

// ── Thinking dots ────────────────────────────────────────────
function ThinkingDots() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{ display: "flex", justifyContent: "flex-start", gap: 8, alignItems: "flex-end" }}
    >
      {/* Avatar */}
      <div style={{
        flexShrink: 0, width: 30, height: 30, borderRadius: 10,
        background: "rgba(124,58,237,0.15)",
        border: "1px solid rgba(124,58,237,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 14px rgba(124,58,237,0.2)",
      }}>
        <Bot size={14} style={{ color: "#a78bfa" }} />
      </div>

      {/* Bubble */}
      <div style={{
        padding: "14px 18px", borderRadius: "18px 18px 18px 4px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(124,58,237,0.2)",
        boxShadow: "0 4px 20px rgba(124,58,237,0.1)",
        display: "flex", alignItems: "center", gap: 5,
      }}>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.18, ease: "easeInOut" }}
            style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "linear-gradient(135deg, #c084fc, #818cf8)",
              boxShadow: "0 0 6px rgba(192,132,252,0.6)",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ── Message bubble ───────────────────────────────────────────
function MessageBubble({ msg, index }) {
  const isUser = msg.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        alignItems: "flex-end", gap: 8,
      }}
    >
      {/* AI avatar */}
      {!isUser && (
        <div style={{
          flexShrink: 0, width: 30, height: 30, borderRadius: 10,
          background: "rgba(124,58,237,0.15)",
          border: "1px solid rgba(124,58,237,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 14px rgba(124,58,237,0.18)",
        }}>
          <Bot size={14} style={{ color: "#a78bfa" }} />
        </div>
      )}

      {/* Bubble */}
      <div style={{
        maxWidth: "78%",
        padding: "13px 17px",
        borderRadius: isUser
          ? "18px 18px 4px 18px"
          : "18px 18px 18px 4px",
        fontSize: 13.5, lineHeight: 1.75,
        whiteSpace: "pre-wrap", wordBreak: "break-word",
        ...(isUser ? {
          background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
          color: "#fff",
          boxShadow: "0 4px 24px rgba(124,58,237,0.35)",
          border: "1px solid rgba(124,58,237,0.5)",
        } : {
          background: "rgba(255,255,255,0.04)",
          color: "rgba(255,255,255,0.82)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        }),
      }}>
        {msg.content}
      </div>

      {/* User avatar */}
      {isUser && (
        <div style={{
          flexShrink: 0, width: 30, height: 30, borderRadius: 10,
          background: "rgba(124,58,237,0.2)",
          border: "1px solid rgba(124,58,237,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <User size={14} style={{ color: "#c084fc" }} />
        </div>
      )}
    </motion.div>
  );
}

// ── Suggestion chip ──────────────────────────────────────────
function SuggestionChip({ text, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        padding: "8px 16px", borderRadius: 30, fontFamily: "inherit",
        border: `1px solid ${hovered ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.09)"}`,
        background: hovered ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.03)",
        color: hovered ? "#c084fc" : "rgba(255,255,255,0.45)",
        fontSize: 12, fontWeight: 600, cursor: "pointer",
        boxShadow: hovered ? "0 0 18px rgba(124,58,237,0.2)" : "none",
        transition: "all .22s",
        display: "flex", alignItems: "center", gap: 6,
      }}
    >
      <Zap size={11} style={{ opacity: 0.7 }} />
      {text}
    </motion.button>
  );
}

// ── Empty state ──────────────────────────────────────────────
function EmptyState({ subject, onSuggestion }) {
  const suggestions = subject
    ? [`Explain a key topic in ${subject}`, `Common mistakes in ${subject}`, `Important formulas for ${subject}`, `Exam tips for ${subject}`]
    : ["Explain Dijkstra's algorithm", "What is process scheduling?", "Difference between TCP and UDP", "How does virtual memory work?"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{ textAlign: "center", padding: "48px 16px 32px" }}
    >
      {/* Pulsing bot icon */}
      <div style={{ position: "relative", display: "inline-flex", marginBottom: 24 }}>
        {/* Outer pulse ring */}
        <div style={{
          position: "absolute", inset: -12, borderRadius: "50%",
          border: "1px solid rgba(124,58,237,0.25)",
          animation: "pulseRing 2.4s ease-out infinite",
        }} />
        <div style={{
          position: "absolute", inset: -22, borderRadius: "50%",
          border: "1px solid rgba(124,58,237,0.12)",
          animation: "pulseRing 2.4s ease-out infinite .4s",
        }} />
        <div style={{
          width: 68, height: 68, borderRadius: 20,
          background: "rgba(124,58,237,0.12)",
          border: "1px solid rgba(124,58,237,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 30px rgba(124,58,237,0.2)",
        }}>
          <Bot size={28} style={{ color: "#a78bfa" }} />
        </div>
      </div>

      <h2 style={{
        fontSize: 20, fontWeight: 800, marginBottom: 10,
        background: "linear-gradient(135deg, #fff 0%, #c4b5fd 50%, #818cf8 100%)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
      }}>
        Ask me anything academic
      </h2>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 28, maxWidth: 320, margin: "0 auto 28px" }}>
        {subject
          ? `Ready to help with your questions on ${subject}`
          : "Engineering, math, computer science, and beyond"}
      </p>

      {/* Suggestion chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 520, margin: "0 auto" }}>
        {suggestions.map(s => (
          <SuggestionChip key={s} text={s} onClick={() => onSuggestion(s)} />
        ))}
      </div>
    </motion.div>
  );
}

// ── Main chat content ────────────────────────────────────────
function DoubtChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subject = searchParams.get("subject") || "";
  const bottomRef = useRef(null);

  const [userId, setUserId] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [thinking, setThinking] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [sendHovered, setSendHovered] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setUserId(session.user.id);

      const { data: existing } = await supabase
        .from("doubt_chats").select("*")
        .eq("user_id", session.user.id)
        .order("updated_at", { ascending: false })
        .limit(1).single();

      if (existing) {
        setChatId(existing.id);
        setMessages(existing.messages || []);
      } else {
        const { data: newChat } = await supabase
          .from("doubt_chats")
          .insert({ user_id: session.user.id, messages: [], subject })
          .select().single();
        setChatId(newChat?.id);
      }
      setLoading(false);
    };
    init();
  }, [router, subject]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || thinking) return;

    const userMessage = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setThinking(true);

    try {
      const res = await fetch("/api/doubt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, subject }),
      });
      const data = await res.json();
      const assistantMessage = { role: "assistant", content: data.reply || data.error || "Something went wrong." };
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      if (chatId) {
        await supabase.from("doubt_chats")
          .update({ messages: finalMessages, updated_at: new Date().toISOString() })
          .eq("id", chatId);
      }
    } catch {
      setMessages([...updatedMessages, { role: "assistant", content: "Network error. Please check your connection and try again." }]);
    }
    setThinking(false);
  };

  const clearChat = async () => {
    setMessages([]);
    if (chatId) await supabase.from("doubt_chats").update({ messages: [] }).eq("id", chatId);
  };

  const handleSuggestion = (text) => {
    setInput(text);
  };

  if (loading) {
    return (
      <AppShell>
        <AmbientOrbs />
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {[0,1,2].map(i => (
                <motion.div key={i}
                  animate={{ y: [0,-6,0], opacity:[0.4,1,0.4] }}
                  transition={{ repeat: Infinity, duration: 0.7, delay: i*0.18 }}
                  style={{ width:8, height:8, borderRadius:"50%", background:"linear-gradient(135deg,#c084fc,#818cf8)", boxShadow:"0 0 8px rgba(192,132,252,0.6)" }}
                />
              ))}
            </div>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Loading chat…</span>
          </div>
        </div>
      </AppShell>
    );
  }

  const canSend = input.trim() && !thinking;

  return (
    <AppShell>
      <AmbientOrbs />

      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column",
        height: "calc(100vh - 115px)",
      }}>

        {/* ── Context strip ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 20px", flexShrink: 0,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.02)",
          backdropFilter: "blur(12px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={13} style={{ color: "#a78bfa" }} />
            {subject ? (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
                background: "rgba(124,58,237,0.12)",
                border: "1px solid rgba(124,58,237,0.3)",
                color: "#c084fc", letterSpacing: "0.02em",
              }}>
                {subject}
              </span>
            ) : (
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>
                General Academic Assistant
              </span>
            )}
          </div>

          <AnimatePresence>
            {messages.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={clearChat}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  background: "none", border: "none", cursor: "pointer",
                  color: "rgba(255,255,255,0.25)", fontSize: 11, fontWeight: 600,
                  fontFamily: "inherit", padding: "4px 8px", borderRadius: 8,
                  transition: "color .2s",
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#f87171"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.25)"}
              >
                <Trash2 size={12} /> Clear
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* ── Messages area ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 16px", scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.08) transparent" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            {messages.length === 0 ? (
              <EmptyState subject={subject} onSuggestion={handleSuggestion} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <AnimatePresence>
                  {messages.map((msg, i) => (
                    <MessageBubble key={i} msg={msg} index={i} />
                  ))}
                </AnimatePresence>

                <AnimatePresence>
                  {thinking && <ThinkingDots key="thinking" />}
                </AnimatePresence>

                <div ref={bottomRef} />
              </div>
            )}
          </div>
        </div>

        {/* ── Input bar ── */}
        <div style={{
          padding: "14px 16px 18px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.02)",
          backdropFilter: "blur(16px)",
          flexShrink: 0,
        }}>
          <form
            onSubmit={sendMessage}
            style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 10, alignItems: "flex-end" }}
          >
            {/* Text input */}
            <div style={{
              flex: 1, position: "relative",
              borderRadius: 16,
              border: `1px solid ${inputFocused ? "rgba(124,58,237,0.55)" : "rgba(255,255,255,0.09)"}`,
              background: inputFocused ? "rgba(124,58,237,0.06)" : "rgba(255,255,255,0.03)",
              boxShadow: inputFocused ? "0 0 0 3px rgba(124,58,237,0.12), 0 0 30px rgba(124,58,237,0.08)" : "none",
              transition: "all .22s",
            }}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={subject ? `Ask a doubt about ${subject}…` : "Ask any academic doubt…"}
                disabled={thinking}
                style={{
                  width: "100%", padding: "13px 18px",
                  background: "none", border: "none", outline: "none",
                  fontSize: 14, color: "rgba(255,255,255,0.88)",
                  fontFamily: "inherit",
                  opacity: thinking ? 0.5 : 1,
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Send button */}
            <motion.button
              type="submit"
              disabled={!canSend}
              onHoverStart={() => setSendHovered(true)}
              onHoverEnd={() => setSendHovered(false)}
              whileTap={{ scale: 0.9 }}
              animate={{ scale: canSend && sendHovered ? 1.06 : 1 }}
              style={{
                flexShrink: 0,
                width: 46, height: 46, borderRadius: 14,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: canSend
                  ? "linear-gradient(135deg, #7c3aed, #5b21b6)"
                  : "rgba(255,255,255,0.05)",
                border: `1px solid ${canSend ? "rgba(124,58,237,0.6)" : "rgba(255,255,255,0.08)"}`,
                cursor: canSend ? "pointer" : "not-allowed",
                boxShadow: canSend && sendHovered ? "0 0 28px rgba(124,58,237,0.5)" : canSend ? "0 4px 18px rgba(124,58,237,0.3)" : "none",
                transition: "all .22s",
              }}
            >
              <motion.div
                animate={{ x: canSend && sendHovered ? 1 : 0, rotate: canSend ? 0 : 0 }}
                transition={{ duration: 0.15 }}
              >
                <Send size={16} style={{ color: canSend ? "#fff" : "rgba(255,255,255,0.2)" }} />
              </motion.div>
            </motion.button>
          </form>

          {/* Hint */}
          <p style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.15)", marginTop: 8 }}>
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </AppShell>
  );
}

export default function DoubtChatPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0f" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[0,1,2].map(i => (
            <motion.div key={i}
              animate={{ y:[0,-8,0] }}
              transition={{ repeat:Infinity, duration:0.7, delay:i*0.18 }}
              style={{ width:8, height:8, borderRadius:"50%", background:"#818cf8" }}
            />
          ))}
        </div>
      </div>
    }>
      <DoubtChatContent />
    </Suspense>
  );
}