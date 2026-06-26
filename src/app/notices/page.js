// src/app/notices/page.js
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
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

// ── Responsive hook ────────────────────────────────────────────
function useBreakpoint() {
  const [bp, setBp] = useState({ isMobile: false, isTablet: false });
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setBp({ isMobile: w < 480, isTablet: w >= 480 && w < 768 });
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return bp;
}

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

// ── Magnetic glow card ─────────────────────────────────────────
function NoticeCard({ notice, index }) {
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const { isMobile } = useBreakpoint();

  // Mouse-tracking magnetic glow
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 180, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 180, damping: 22 });

  const glowX = useTransform(springX, v => `${v}px`);
  const glowY = useTransform(springY, v => `${v}px`);

  const handleMouseMove = (e) => {
    if (isMobile) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const { color, glow, bg, icon: CatIcon } = catOf(notice.category);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 24, height: 0 }}
      transition={{ delay: index * 0.05, duration: .32, ease: [0.22, 1, .36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); mouseX.set(0); mouseY.set(0); }}
      onMouseMove={handleMouseMove}
      style={{
        padding: "clamp(14px, 4vw, 20px) clamp(14px, 4vw, 20px)",
        borderRadius: 20,
        background: hovered ? "rgba(255,255,255,.055)" : "rgba(255,255,255,.03)",
        border: `1px solid ${hovered ? color + "44" : "rgba(255,255,255,.08)"}`,
        boxShadow: hovered ? `0 0 48px ${glow}, 0 8px 32px rgba(0,0,0,.3)` : "none",
        transition: "background .28s, border .28s, box-shadow .28s cubic-bezier(.22,1,.36,1)",
        position: "relative", overflow: "hidden",
        willChange: "box-shadow",
      }}
    >
      {/* Magnetic radial glow that follows cursor */}
      {!isMobile && (
        <motion.div
          style={{
            position: "absolute",
            width: 280, height: 280,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
            pointerEvents: "none",
            left: glowX,
            top: glowY,
            transform: "translate(-50%, -50%)",
            opacity: hovered ? 1 : 0,
            transition: "opacity .3s",
          }}
        />
      )}

      {/* Left accent bar */}
      <div style={{
        position: "absolute", left: 0, top: 16, bottom: 16, width: 3,
        borderRadius: "0 3px 3px 0",
        background: `linear-gradient(180deg, ${color}, ${color}55)`,
        boxShadow: hovered ? `0 0 14px ${color}, 0 0 28px ${color}88` : `0 0 6px ${color}44`,
        opacity: hovered ? 1 : 0.45,
        transition: "all .35s cubic-bezier(.22,1,.36,1)",
      }} />

      <div style={{ paddingLeft: 10 }}>
        {/* Top row */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 10,
          flexWrap: "wrap",
        }}>
          <h3 style={{
            fontSize: "clamp(13px, 3.5vw, 14px)",
            fontWeight: 700,
            color: "rgba(255,255,255,.9)",
            lineHeight: 1.4,
            flex: "1 1 180px",
            minWidth: 0,
            textShadow: hovered ? `0 0 24px ${color}55` : "none",
            transition: "text-shadow .35s",
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
              boxShadow: hovered ? `0 0 18px ${glow}, 0 0 36px ${color}22` : "none",
              transition: "box-shadow .35s",
            }}
          >
            <CatIcon size={10} style={{ color }} />
            <span style={{
              fontSize: "clamp(9px, 2vw, 10px)",
              fontWeight: 700, color, textTransform: "uppercase", letterSpacing: ".08em",
            }}>
              {notice.category}
            </span>
          </motion.div>
        </div>

        {/* Description */}
        <p style={{
          fontSize: "clamp(12px, 3.2vw, 13px)",
          color: "rgba(255,255,255,.45)", lineHeight: 1.65, marginBottom: 12,
          wordBreak: "break-word",
        }}>
          {notice.description}
        </p>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <motion.div
            animate={hovered ? { scale: [1, 1.6, 1], opacity: [0.7, 1, 0.7] } : {}}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 4, height: 4, borderRadius: "50%",
              background: color, boxShadow: hovered ? `0 0 10px ${color}` : `0 0 4px ${color}88`,
            }}
          />
          <span style={{ fontSize: "clamp(10px, 2.5vw, 11px)", color: "rgba(255,255,255,.22)" }}>
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
        flexShrink: 0,
        minWidth: 0,
        width: "100%",
      }}>
      {children}
    </select>
  );
}

// ── Ambient background orbs ────────────────────────────────────
function AmbientOrbs() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", top: "10%", left: "5%",
          width: "clamp(180px, 30vw, 320px)", height: "clamp(180px, 30vw, 320px)",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,.07) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        style={{
          position: "absolute", bottom: "15%", right: "8%",
          width: "clamp(150px, 25vw, 280px)", height: "clamp(150px, 25vw, 280px)",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,.06) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      <motion.div
        animate={{ x: [0, 20, -20, 0], y: [0, 20, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 7 }}
        style={{
          position: "absolute", top: "50%", left: "50%",
          width: "clamp(120px, 20vw, 220px)", height: "clamp(120px, 20vw, 220px)",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(167,139,250,.05) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────
export default function NoticesPage() {
  const router = useRouter();
  const { isMobile, isTablet } = useBreakpoint();

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

  const isSmall = isMobile || isTablet;

  return (
    <AppShell>
      <AmbientOrbs />
      <div style={{
        padding: `clamp(20px, 5vw, 32px) clamp(14px, 5vw, 28px)`,
        maxWidth: 740,
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
      }}>

        {/* Header row */}
        <motion.div
          initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 28,
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <motion.div
              whileHover={{ rotate: [0, -12, 12, 0], scale: 1.1 }}
              transition={{ duration: .5 }}
              style={{
                width: "clamp(34px, 8vw, 40px)", height: "clamp(34px, 8vw, 40px)",
                borderRadius: 12, flexShrink: 0,
                background: "rgba(167,139,250,.15)", border: "1px solid rgba(167,139,250,.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 24px rgba(167,139,250,.25)",
              }}
            >
              <Bell size={isMobile ? 15 : 18} style={{ color: "#a78bfa" }} />
            </motion.div>
            <h1 style={{
              fontSize: "clamp(19px, 5.5vw, 26px)", fontWeight: 800,
              background: "linear-gradient(135deg,#fff 0%,#c4b5fd 50%,#818cf8 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              whiteSpace: "nowrap",
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
              padding: isMobile ? "8px 14px" : "9px 18px",
              borderRadius: 30,
              background: showForm ? "rgba(248,113,113,.12)" : "rgba(124,58,237,.2)",
              border: `1px solid ${showForm ? "rgba(248,113,113,.35)" : "rgba(124,58,237,.5)"}`,
              color: showForm ? "#f87171" : "#c4b5fd",
              fontSize: isMobile ? 11 : 12, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: showForm ? "0 0 20px rgba(248,113,113,.25)" : "0 0 22px rgba(124,58,237,.3)",
              transition: "all .25s",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {showForm ? <><X size={11} /> Close</> : <><PenLine size={11} /> Post Notice</>}
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
                color: "#6ee7b7", fontSize: "clamp(12px, 3vw, 13px)", fontWeight: 600,
                boxShadow: "0 0 28px rgba(52,211,153,.18)",
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
                borderRadius: 22, padding: "clamp(16px, 4vw, 24px)",
                backdropFilter: "blur(14px)",
                boxShadow: "0 0 60px rgba(124,58,237,.12)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                  <PenLine size={14} style={{ color: "#a78bfa" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.7)" }}>
                    Post a new notice
                  </span>
                </div>

                <div
                  onSubmit={handlePost}
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <GField value={formTitle} onChange={e => setFormTitle(e.target.value)}
                    placeholder="Notice title" required />
                  <GField as="textarea" value={formDesc} onChange={e => setFormDesc(e.target.value)}
                    placeholder="Notice description…" required rows={3} />

                  <div style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    flexDirection: isSmall ? "column" : "row",
                  }}>
                    <GlassSelect value={formCategory} onChange={e => setFormCategory(e.target.value)}>
                      {["General","Exam","Holiday","Event"].map(c => <option key={c}>{c}</option>)}
                    </GlassSelect>

                    <motion.button
                      type="button"
                      onClick={handlePost}
                      disabled={posting}
                      whileHover={!posting ? { scale: 1.03 } : {}}
                      whileTap={!posting ? { scale: .96 } : {}}
                      style={{
                        flex: isSmall ? undefined : 1,
                        width: isSmall ? "100%" : undefined,
                        padding: "11px 0",
                        background: posting ? "rgba(255,255,255,.05)" : "linear-gradient(135deg,#7c3aed,#5b21b6)",
                        border: "none", borderRadius: 12,
                        color: posting ? "rgba(255,255,255,.3)" : "#fff",
                        fontSize: 13, fontWeight: 700,
                        cursor: posting ? "not-allowed" : "pointer", fontFamily: "inherit",
                        boxShadow: posting ? "none" : "0 4px 24px rgba(124,58,237,.45)",
                        transition: "all .3s",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                      }}
                      onMouseEnter={e => { if (!posting) e.currentTarget.style.boxShadow = "0 6px 32px rgba(124,58,237,.65)"; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = posting ? "none" : "0 4px 24px rgba(124,58,237,.45)"; }}
                    >
                      {posting
                        ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%" }} />
                            Posting…</>
                        : <><Send size={13} /> Post Notice</>}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category pills */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }}
          style={{
            display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 22,
            // On mobile, scroll horizontally instead of wrapping
            ...(isMobile ? {
              flexWrap: "nowrap",
              overflowX: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              paddingBottom: 4,
            } : {}),
          }}
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
                  display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
                  padding: isMobile ? "5px 13px" : "6px 16px", borderRadius: 20,
                  background: active ? `${color}18` : "rgba(255,255,255,.03)",
                  border: `1px solid ${active ? color + "55" : "rgba(255,255,255,.08)"}`,
                  color: active ? color : "rgba(255,255,255,.3)",
                  fontSize: isMobile ? 11 : 12, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                  boxShadow: active ? `0 0 20px ${glow}, 0 0 40px ${color}18` : "none",
                  transition: "all .22s",
                  whiteSpace: "nowrap",
                }}
              >
                <CatIcon size={isMobile ? 10 : 11} /> {cat}
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
                animate={{ opacity: [.3, .7, .3] }} transition={{ duration: 1.8, repeat: Infinity, delay: i * .2 }}
                style={{ height: "clamp(80px, 18vw, 96px)", borderRadius: 20, background: "rgba(255,255,255,.04)" }} />
            ))}
          </div>
        ) : notices.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: "center", padding: "clamp(40px, 10vw, 60px) 0" }}>
            <motion.div
              animate={{ rotate: [0, -12, 12, -12, 0], y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2.5 }}
              style={{ fontSize: "clamp(36px, 9vw, 44px)", marginBottom: 14 }}
            >
              🔔
            </motion.div>
            <p style={{ fontSize: "clamp(13px, 3.5vw, 14px)", color: "rgba(255,255,255,.3)" }}>No notices yet</p>
            <p style={{ fontSize: "clamp(11px, 3vw, 12px)", color: "rgba(255,255,255,.18)", marginTop: 4 }}>
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

      {/* Hide scrollbar on mobile pills on webkit */}
      <style>{`
        @media (max-width: 480px) {
          div::-webkit-scrollbar { display: none; }
        }
        * { -webkit-tap-highlight-color: transparent; }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: .01ms !important; transition-duration: .01ms !important; }
        }
      `}</style>
    </AppShell>
  );
}