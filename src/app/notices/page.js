// src/app/notices/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import {
  Bell, PenLine, X, Send, GraduationCap,
  Palmtree, CalendarDays, Info, Megaphone,
} from "lucide-react";

// ── Category config ────────────────────────────────────────────
const CATEGORIES = ["All", "Exam", "Holiday", "Event", "General"];

const CAT = {
  Exam:    { color: "#60a5fa", glow: "rgba(96,165,250,.35)",   bg: "rgba(96,165,250,.1)",   icon: GraduationCap },
  Holiday: { color: "#34d399", glow: "rgba(52,211,153,.35)",   bg: "rgba(52,211,153,.1)",   icon: Palmtree      },
  Event:   { color: "#a78bfa", glow: "rgba(167,139,250,.35)",  bg: "rgba(167,139,250,.1)",  icon: CalendarDays  },
  General: { color: "#94a3b8", glow: "rgba(148,163,184,.25)",  bg: "rgba(148,163,184,.08)", icon: Info          },
};
const catOf = (c) => CAT[c] || CAT.General;

// ── Tiny form field helpers ────────────────────────────────────
function glassInput(focused) {
  return {
    width: "100%", padding: "11px 14px", boxSizing: "border-box",
    background: focused ? "rgba(124,58,237,.08)" : "rgba(255,255,255,.04)",
    border: `1px solid ${focused ? "rgba(124,58,237,.55)" : "rgba(255,255,255,.1)"}`,
    borderRadius: 12, fontSize: 13, color: "rgba(255,255,255,.9)",
    outline: "none", fontFamily: "inherit",
    boxShadow: focused ? "0 0 0 3px rgba(124,58,237,.12)" : "none",
    transition: "all .2s",
  };
}

function GField({ as: Tag = "input", value, onChange, placeholder, required, rows }) {
  const [f, setF] = useState(false);
  return (
    <Tag
      value={value} onChange={onChange} placeholder={placeholder}
      required={required} rows={rows}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
      style={{ ...glassInput(f), resize: Tag === "textarea" ? "none" : undefined }}
    />
  );
}

// ── Notice card ────────────────────────────────────────────────
function NoticeCard({ notice, index }) {
  const [hovered, setHovered] = useState(false);
  const { color, glow, bg, icon: CatIcon } = catOf(notice.category);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 24, height: 0 }}
      transition={{ delay: index * 0.05, duration: .32, ease: [0.22, 1, .36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "18px 20px", borderRadius: 20,
        background: hovered ? "rgba(255,255,255,.055)" : "rgba(255,255,255,.03)",
        border: `1px solid ${hovered ? color + "44" : "rgba(255,255,255,.08)"}`,
        boxShadow: hovered ? `0 0 36px ${glow}` : "none",
        transition: "all .28s cubic-bezier(.22,1,.36,1)",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Left accent bar */}
      <div style={{
        position: "absolute", left: 0, top: 16, bottom: 16, width: 3,
        borderRadius: "0 3px 3px 0",
        background: `linear-gradient(180deg, ${color}, ${color}55)`,
        boxShadow: `0 0 10px ${color}`,
        opacity: hovered ? 1 : 0.5,
        transition: "opacity .3s",
      }} />

      <div style={{ paddingLeft: 10 }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
          <h3 style={{
            fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,.9)",
            lineHeight: 1.4, flex: 1,
            textShadow: hovered ? `0 0 20px ${color}44` : "none",
            transition: "text-shadow .3s",
          }}>
            {notice.title}
          </h3>

          {/* Category badge */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            style={{
              display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
              padding: "4px 10px", borderRadius: 20,
              background: bg, border: `1px solid ${color}44`,
              boxShadow: hovered ? `0 0 14px ${glow}` : "none",
              transition: "box-shadow .3s",
            }}
          >
            <CatIcon size={10} style={{ color }} />
            <span style={{ fontSize: 10, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: ".08em" }}>
              {notice.category}
            </span>
          </motion.div>
        </div>

        {/* Description */}
        <p style={{
          fontSize: 13, color: "rgba(255,255,255,.45)", lineHeight: 1.65, marginBottom: 12,
        }}>
          {notice.description}
        </p>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,.22)" }}>
            {formatDate(notice.posted_at)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── GlassSelect ───────────────────────────────────────────────
function GlassSelect({ value, onChange, children }) {
  const [f, setF] = useState(false);
  return (
    <select value={value} onChange={onChange}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
      style={{
        padding: "11px 34px 11px 14px",
        background: f ? "rgba(124,58,237,.08)" : "rgba(255,255,255,.04)",
        border: `1px solid ${f ? "rgba(124,58,237,.55)" : "rgba(255,255,255,.1)"}`,
        borderRadius: 12, fontSize: 13, color: "rgba(255,255,255,.8)",
        outline: "none", fontFamily: "inherit", cursor: "pointer",
        boxShadow: f ? "0 0 0 3px rgba(124,58,237,.12)" : "none",
        transition: "all .2s", appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,.3)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
      }}>
      {children}
    </select>
  );
}

// ── Page ───────────────────────────────────────────────────────
export default function NoticesPage() {
  const router = useRouter();
  const [notices, setNotices]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [userId, setUserId]             = useState(null);

  const [showForm, setShowForm]         = useState(false);
  const [formTitle, setFormTitle]       = useState("");
  const [formDesc, setFormDesc]         = useState("");
  const [formCategory, setFormCategory] = useState("General");
  const [posting, setPosting]           = useState(false);
  const [posted, setPosted]             = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setUserId(session.user.id);
      await fetchNotices();
    };
    init();
  }, [router]);

  const fetchNotices = async (category = "") => {
    setLoading(true);
    let q = supabase.from("notices").select("*").order("posted_at", { ascending: false });
    if (category && category !== "All") q = q.eq("category", category);
    const { data } = await q;
    setNotices(data || []);
    setLoading(false);
  };

  const handleCategoryChange = (cat) => { setActiveCategory(cat); fetchNotices(cat); };

  const handlePost = async (e) => {
    e.preventDefault();
    setPosting(true);
    const { data, error } = await supabase
      .from("notices")
      .insert({ title: formTitle, description: formDesc, category: formCategory, posted_by: userId })
      .select().single();
    if (!error && data) {
      setNotices([data, ...notices]);
      setFormTitle(""); setFormDesc(""); setFormCategory("General");
      setPosted(true); setShowForm(false);
      setTimeout(() => setPosted(false), 3000);
    }
    setPosting(false);
  };

  const { color: activeCatColor } = catOf(activeCategory === "All" ? "General" : activeCategory);

  return (
    <AppShell>
      <div style={{ padding: "32px 28px", maxWidth: 740, margin: "0 auto" }}>

        {/* Header row */}
        <motion.div
          initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "rgba(167,139,250,.15)", border: "1px solid rgba(167,139,250,.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 20px rgba(167,139,250,.2)",
            }}>
              <Bell size={18} style={{ color: "#a78bfa" }} />
            </div>
            <h1 style={{
              fontSize: 26, fontWeight: 800,
              background: "linear-gradient(135deg,#fff 0%,#c4b5fd 50%,#818cf8 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Notices & Alerts
            </h1>
          </div>

          {/* Post notice toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: .94 }}
            onClick={() => setShowForm(s => !s)}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "9px 18px", borderRadius: 30,
              background: showForm ? "rgba(248,113,113,.12)" : "rgba(124,58,237,.2)",
              border: `1px solid ${showForm ? "rgba(248,113,113,.35)" : "rgba(124,58,237,.5)"}`,
              color: showForm ? "#f87171" : "#c4b5fd",
              fontSize: 12, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: showForm ? "0 0 16px rgba(248,113,113,.2)" : "0 0 18px rgba(124,58,237,.25)",
              transition: "all .25s",
            }}
          >
            {showForm ? <><X size={12} /> Close</> : <><PenLine size={12} /> Post Notice</>}
          </motion.button>
        </motion.div>

        {/* Posted confirmation */}
        <AnimatePresence>
          {posted && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: .96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                display: "flex", alignItems: "center", gap: 10, marginBottom: 16,
                padding: "11px 18px", borderRadius: 14,
                background: "rgba(52,211,153,.1)", border: "1px solid rgba(52,211,153,.3)",
                color: "#6ee7b7", fontSize: 13, fontWeight: 600,
                boxShadow: "0 0 24px rgba(52,211,153,.15)",
              }}
            >
              <Megaphone size={14} /> Notice posted successfully!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Post form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: .35, ease: [0.22, 1, .36, 1] }}
              style={{ overflow: "hidden", marginBottom: 24 }}
            >
              <div style={{
                background: "rgba(255,255,255,.03)",
                border: "1px solid rgba(255,255,255,.09)",
                borderRadius: 22, padding: "24px 24px",
                backdropFilter: "blur(14px)",
                boxShadow: "0 0 50px rgba(124,58,237,.1)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                  <PenLine size={14} style={{ color: "#a78bfa" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.7)" }}>
                    Post a new notice
                  </span>
                </div>

                <form onSubmit={handlePost} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <GField value={formTitle} onChange={e => setFormTitle(e.target.value)}
                    placeholder="Notice title" required />
                  <GField as="textarea" value={formDesc} onChange={e => setFormDesc(e.target.value)}
                    placeholder="Notice description…" required rows={3} />

                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <GlassSelect value={formCategory} onChange={e => setFormCategory(e.target.value)}>
                      {["General","Exam","Holiday","Event"].map(c => <option key={c}>{c}</option>)}
                    </GlassSelect>

                    <motion.button
                      type="submit" disabled={posting}
                      whileHover={!posting ? { scale: 1.03 } : {}}
                      whileTap={!posting ? { scale: .96 } : {}}
                      style={{
                        flex: 1, padding: "11px 0",
                        background: posting ? "rgba(255,255,255,.05)" : "linear-gradient(135deg,#7c3aed,#5b21b6)",
                        border: "none", borderRadius: 12,
                        color: posting ? "rgba(255,255,255,.3)" : "#fff",
                        fontSize: 13, fontWeight: 700,
                        cursor: posting ? "not-allowed" : "pointer", fontFamily: "inherit",
                        boxShadow: posting ? "none" : "0 4px 20px rgba(124,58,237,.4)",
                        transition: "all .3s",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                      }}
                      onMouseEnter={e => { if (!posting) e.currentTarget.style.boxShadow = "0 6px 28px rgba(124,58,237,.6)"; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = posting ? "none" : "0 4px 20px rgba(124,58,237,.4)"; }}
                    >
                      {posting
                        ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%" }} />
                            Posting…</>
                        : <><Send size={13} /> Post Notice</>}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category pills */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }}
          style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 22 }}
        >
          {CATEGORIES.map(cat => {
            const active = activeCategory === cat;
            const { color, glow } = cat === "All"
              ? { color: "#a78bfa", glow: "rgba(167,139,250,.3)" }
              : catOf(cat);
            const CatIcon = cat === "All" ? Bell : catOf(cat).icon;
            return (
              <motion.button
                key={cat} whileHover={{ scale: 1.06 }} whileTap={{ scale: .94 }}
                onClick={() => handleCategoryChange(cat)}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "6px 16px", borderRadius: 20,
                  background: active ? `${color}18` : "rgba(255,255,255,.03)",
                  border: `1px solid ${active ? color + "55" : "rgba(255,255,255,.08)"}`,
                  color: active ? color : "rgba(255,255,255,.3)",
                  fontSize: 12, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                  boxShadow: active ? `0 0 16px ${glow}` : "none",
                  transition: "all .22s",
                }}
              >
                <CatIcon size={11} /> {cat}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Count */}
        <AnimatePresence>
          {!loading && notices.length > 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ fontSize: 12, color: "rgba(255,255,255,.2)", marginBottom: 14 }}>
              {notices.length} notice{notices.length !== 1 ? "s" : ""}
              {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Content */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1,2,3].map(i => (
              <motion.div key={i}
                animate={{ opacity: [.4, 1, .4] }} transition={{ duration: 1.6, repeat: Infinity, delay: i * .18 }}
                style={{ height: 96, borderRadius: 20, background: "rgba(255,255,255,.04)" }} />
            ))}
          </div>
        ) : notices.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: "center", padding: "60px 0" }}>
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              style={{ fontSize: 44, marginBottom: 14 }}
            >
              🔔
            </motion.div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.3)" }}>No notices yet</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.18)", marginTop: 4 }}>
              Post one using the button above
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {notices.map((notice, i) => (
                <NoticeCard key={notice.id} notice={notice} index={i} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </AppShell>
  );
}