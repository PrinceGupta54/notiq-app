// src/app/bihar-universities/page.js
"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import AppShell from "@/components/AppShell";
import { ExternalLink, Search, MapPin, ChevronRight, Sparkles } from "lucide-react";

const UNIVERSITIES = [
  { name: "Bihar Engineering University (BEU)", location: "Patna", url: "https://beu-bih.ac.in", type: "Technical" },
  { name: "Aryabhatta Knowledge University (AKU)", location: "Patna", url: "https://www.akubihar.ac.in", type: "General" },
  { name: "Patna University (PU)", location: "Patna", url: "https://pup.ac.in", type: "General" },
  { name: "Magadh University (MU)", location: "Bodh Gaya", url: "https://magadhuniversity.ac.in", type: "General" },
  { name: "B.R. Ambedkar Bihar University (BRABU)", location: "Muzaffarpur", url: "https://brabu.net", type: "General" },
  { name: "Lalit Narayan Mithila University (LNMU)", location: "Darbhanga", url: "https://lnmu.ac.in", type: "General" },
  { name: "Tilka Manjhi Bhagalpur University (TMBU)", location: "Bhagalpur", url: "https://www.tmbuniv.ac.in", type: "General" },
  { name: "Jai Prakash University (JPU)", location: "Chapra", url: "https://www.jpv.ac.in", type: "General" },
  { name: "Bhupendra Narayan Mandal University (BNMU)", location: "Madhepura", url: "https://bnmu.ac.in", type: "General" },
  { name: "Veer Kunwar Singh University (VKSU)", location: "Ara", url: "https://vksu.ac.in", type: "General" },
  { name: "Munger University", location: "Munger", url: "https://mungeruniversity.ac.in", type: "General" },
  { name: "Purnea University", location: "Purnea", url: "https://purneauniversity.ac.in", type: "General" },
  { name: "Central University of South Bihar (CUSB)", location: "Gaya", url: "https://www.cusb.ac.in", type: "Central" },
  { name: "Chanakya National Law University (CNLU)", location: "Patna", url: "https://www.cnlu.ac.in", type: "Law" },
  { name: "Bihar Agricultural University (BAU)", location: "Bhagalpur", url: "https://bausabour.ac.in", type: "Agricultural" },
];

const TYPE_CONFIG = {
  Technical:    { color: "#c084fc", bg: "rgba(192,132,252,0.10)", border: "rgba(192,132,252,0.28)", glow: "rgba(192,132,252,0.18)", dot: "#c084fc" },
  General:      { color: "#60a5fa", bg: "rgba(96,165,250,0.10)",  border: "rgba(96,165,250,0.28)",  glow: "rgba(96,165,250,0.18)",  dot: "#60a5fa" },
  Central:      { color: "#34d399", bg: "rgba(52,211,153,0.10)",  border: "rgba(52,211,153,0.28)",  glow: "rgba(52,211,153,0.18)",  dot: "#34d399" },
  Law:          { color: "#f87171", bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.28)", glow: "rgba(248,113,113,0.18)", dot: "#f87171" },
  Agricultural: { color: "#fbbf24", bg: "rgba(251,191,36,0.10)",  border: "rgba(251,191,36,0.28)",  glow: "rgba(251,191,36,0.18)",  dot: "#fbbf24" },
};

const TYPE_ALL = ["All", "Technical", "General", "Central", "Law", "Agricultural"];

const TYPE_COUNTS = TYPE_ALL.slice(1).reduce((acc, t) => {
  acc[t] = UNIVERSITIES.filter(u => u.type === t).length;
  return acc;
}, {});

// Floating orb background (pure CSS, no framer-motion overhead)
function AmbientOrbs() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {/* top-left violet orb */}
      <div style={{
        position: "absolute", top: "-15%", left: "-10%",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.13) 0%, transparent 70%)",
        filter: "blur(60px)",
        animation: "orb1 12s ease-in-out infinite",
      }} />
      {/* bottom-right teal orb */}
      <div style={{
        position: "absolute", bottom: "-10%", right: "-10%",
        width: 420, height: 420, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(20,184,166,0.10) 0%, transparent 70%)",
        filter: "blur(60px)",
        animation: "orb2 14s ease-in-out infinite",
      }} />
      {/* center amber accent */}
      <div style={{
        position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)",
        width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(251,191,36,0.04) 0%, transparent 70%)",
        filter: "blur(40px)",
      }} />
      <style>{`
        @keyframes orb1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,30px) scale(1.05)} 66%{transform:translate(-20px,50px) scale(0.97)} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-30px,-40px) scale(1.06)} 66%{transform:translate(20px,-20px) scale(0.96)} }
      `}</style>
    </div>
  );
}

// Horizontal scroll filter pills
function FilterPills({ active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
      {TYPE_ALL.map(t => {
        const isActive = active === t;
        const cfg = t !== "All" ? TYPE_CONFIG[t] : null;
        return (
          <motion.button
            key={t}
            onClick={() => onChange(t)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            style={{
              flexShrink: 0,
              padding: "7px 16px",
              borderRadius: 30,
              border: `1px solid ${isActive ? (cfg ? cfg.border : "rgba(255,255,255,0.35)") : "rgba(255,255,255,0.09)"}`,
              background: isActive
                ? (cfg ? cfg.bg : "rgba(255,255,255,0.08)")
                : "rgba(255,255,255,0.03)",
              color: isActive ? (cfg ? cfg.color : "#fff") : "rgba(255,255,255,0.45)",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: isActive && cfg ? `0 0 16px ${cfg.glow}` : "none",
              transition: "all .22s",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {t !== "All" && (
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: cfg.dot,
                boxShadow: `0 0 6px ${cfg.dot}`,
                display: "inline-block",
              }} />
            )}
            {t}
            <span style={{ opacity: 0.55, fontSize: 11 }}>
              {t === "All" ? UNIVERSITIES.length : TYPE_COUNTS[t]}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

// Individual university card
function UniCard({ uni, index }) {
  const cfg = TYPE_CONFIG[uni.type];
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      layout
    >
      <motion.button
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileTap={{ scale: 0.975 }}
        onClick={() => window.open(uni.url, "_blank")}
        style={{
          width: "100%", textAlign: "left",
          padding: "18px 20px",
          borderRadius: 16,
          border: `1px solid ${hovered ? cfg.border : "rgba(255,255,255,0.07)"}`,
          background: hovered
            ? `linear-gradient(135deg, ${cfg.bg}, rgba(255,255,255,0.03))`
            : "rgba(255,255,255,0.03)",
          cursor: "pointer",
          fontFamily: "inherit",
          boxShadow: hovered ? `0 8px 40px ${cfg.glow}, 0 0 0 1px ${cfg.border}` : "0 1px 4px rgba(0,0,0,0.2)",
          transition: "all .25s cubic-bezier(0.22,1,0.36,1)",
          display: "flex", alignItems: "center", gap: 16,
          position: "relative", overflow: "hidden",
        }}
      >
        {/* Shimmer sweep on hover */}
        <motion.div
          initial={false}
          animate={{ x: hovered ? "200%" : "-100%" }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
          style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(105deg, transparent 40%, ${cfg.bg} 50%, transparent 60%)`,
            pointerEvents: "none",
          }}
        />

        {/* Type dot indicator */}
        <div style={{
          flexShrink: 0,
          width: 40, height: 40, borderRadius: 12,
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: hovered ? `0 0 18px ${cfg.glow}` : "none",
          transition: "box-shadow .25s",
        }}>
          <span style={{
            width: 10, height: 10, borderRadius: "50%",
            background: cfg.dot,
            boxShadow: `0 0 8px ${cfg.dot}`,
            display: "block",
            transition: "transform .2s",
            transform: hovered ? "scale(1.3)" : "scale(1)",
          }} />
        </div>

        {/* Name + location */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 14, fontWeight: 650, lineHeight: 1.3,
            color: hovered ? "#fff" : "rgba(255,255,255,0.82)",
            marginBottom: 5, transition: "color .2s",
          }}>
            {uni.name}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <MapPin size={11} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", letterSpacing: "0.01em" }}>
              {uni.location}
            </span>
          </div>
        </div>

        {/* Type badge */}
        <div style={{
          flexShrink: 0,
          padding: "5px 12px", borderRadius: 20,
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          fontSize: 11, fontWeight: 700, color: cfg.color,
          letterSpacing: "0.04em",
          boxShadow: hovered ? `0 0 12px ${cfg.glow}` : "none",
          transition: "all .2s",
        }}>
          {uni.type}
        </div>

        {/* Arrow */}
        <motion.div
          animate={{ x: hovered ? 3 : 0, opacity: hovered ? 1 : 0.3 }}
          transition={{ duration: 0.2 }}
          style={{ flexShrink: 0 }}
        >
          <ChevronRight size={16} style={{ color: cfg.color }} />
        </motion.div>
      </motion.button>
    </motion.div>
  );
}

// Stats row at top
function StatsRow() {
  const types = Object.keys(TYPE_CONFIG);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 28 }}>
      {types.map((t, i) => {
        const cfg = TYPE_CONFIG[t];
        const count = TYPE_COUNTS[t];
        return (
          <motion.div
            key={t}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.04 }}
            style={{
              padding: "8px 16px", borderRadius: 12,
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: cfg.dot, boxShadow: `0 0 6px ${cfg.dot}`,
              flexShrink: 0,
            }} />
            <span style={{ fontSize: 12, color: cfg.color, fontWeight: 600 }}>
              {count} {t}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function BiharUniversitiesPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const filtered = UNIVERSITIES.filter(u => {
    const matchType = filter === "All" || u.type === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.location.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  return (
    <AppShell>
      <AmbientOrbs />

      <div style={{ position: "relative", zIndex: 1, padding: "32px 24px 60px", maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 8 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <motion.div
              animate={{ rotate: [0, 15, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
            >
              <Sparkles size={20} style={{ color: "#c084fc" }} />
            </motion.div>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
              color: "rgba(192,132,252,0.75)",
            }}>
              Official University Directory
            </span>
          </div>

          <h1 style={{
            fontSize: 30, fontWeight: 800, lineHeight: 1.15, marginBottom: 10,
            background: "linear-gradient(135deg, #fff 0%, #e2d9f3 40%, #c084fc 80%, #818cf8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Bihar Universities
          </h1>

          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginBottom: 28 }}>
            {UNIVERSITIES.length} universities — click any card to open the official website
          </p>
        </motion.div>

        {/* Stats row */}
        <StatsRow />

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            marginBottom: 16,
            padding: "10px 14px",
            borderRadius: 14,
            border: `1px solid ${searchFocused ? "rgba(192,132,252,0.5)" : "rgba(255,255,255,0.09)"}`,
            background: searchFocused ? "rgba(192,132,252,0.06)" : "rgba(255,255,255,0.03)",
            boxShadow: searchFocused ? "0 0 0 3px rgba(192,132,252,0.10), 0 0 30px rgba(192,132,252,0.08)" : "none",
            transition: "all .22s",
          }}
        >
          <Search size={15} style={{ color: searchFocused ? "#c084fc" : "rgba(255,255,255,0.25)", flexShrink: 0, transition: "color .2s" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search by name or city..."
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              fontSize: 14, color: "rgba(255,255,255,0.85)",
              fontFamily: "inherit",
            }}
          />
          <AnimatePresence>
            {search && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearch("")}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "rgba(255,255,255,0.3)", fontSize: 18, lineHeight: 1,
                  padding: "0 2px",
                }}
              >
                ×
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Filter pills */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          style={{ marginBottom: 24 }}
        >
          <FilterPills active={filter} onChange={setFilter} />
        </motion.div>

        {/* Result count */}
        <AnimatePresence mode="wait">
          {(filter !== "All" || search) && (
            <motion.p
              key="count"
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}
            >
              Showing {filtered.length} of {UNIVERSITIES.length} universities
            </motion.p>
          )}
        </AnimatePresence>

        {/* Cards grid */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.2)", fontSize: 14 }}
            >
              No universities match your search
            </motion.div>
          ) : (
            <motion.div key="grid" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map((uni, i) => (
                <UniCard key={uni.name} uni={uni} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          style={{ marginTop: 40, fontSize: 11, color: "rgba(255,255,255,0.18)", textAlign: "center", letterSpacing: "0.02em" }}
        >
          All links open official university websites in a new tab
        </motion.p>
      </div>
    </AppShell>
  );
}