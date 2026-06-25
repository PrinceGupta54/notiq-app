// src/app/results/page.js
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppShell from "@/components/AppShell";
import { ExternalLink, Archive, ShieldAlert, ChevronDown, Trophy } from "lucide-react";

// ── University data ────────────────────────────────────────────
// To swap in a real logo: add  logo: "/logos/beu.png"  to any entry
// The card will automatically render <img> instead of the monogram.
const UNIVERSITIES = [
  {
    name: "Bihar Engineering University",
    full: "Bihar Engineering University (BEU)",
    short: "BEU",
    est: "Est. 2013",
    color: "#818cf8",
    glow: "rgba(129,140,248,.4)",
    bg: "rgba(129,140,248,.1)",
    result_url: "https://beuexam.in/checkresult.aspx",
    archive_url: "https://beuexam.in",
    semesters: ["1st","2nd","3rd","4th","5th","6th","7th","8th"],
    tag: "Engineering",
  },
  {
    name: "Aryabhatta Knowledge University",
    full: "Aryabhatta Knowledge University (AKU)",
    short: "AKU",
    est: "Est. 2008",
    color: "#38bdf8",
    glow: "rgba(56,189,248,.4)",
    bg: "rgba(56,189,248,.1)",
    result_url: "https://www.akuexam.net",
    archive_url: "https://www.akuexam.net",
    semesters: ["1st","2nd","3rd","4th","5th","6th"],
    tag: "General",
  },
  {
    name: "Patna University",
    full: "Patna University (PU)",
    short: "PU",
    est: "Est. 1917",
    color: "#34d399",
    glow: "rgba(52,211,153,.4)",
    bg: "rgba(52,211,153,.1)",
    result_url: "https://www.patnauniversity.ac.in/examination.php",
    archive_url: "https://www.patnauniversity.ac.in",
    semesters: ["1st","2nd","3rd","4th","5th","6th"],
    tag: "General",
  },
  {
    name: "B.R. Ambedkar Bihar University",
    full: "B.R. Ambedkar Bihar University (BRABU)",
    short: "BRABU",
    est: "Est. 1960",
    color: "#fbbf24",
    glow: "rgba(251,191,36,.4)",
    bg: "rgba(251,191,36,.1)",
    result_url: "https://brabu.net/result",
    archive_url: "https://brabu.net",
    semesters: ["1st","2nd","3rd","4th","5th","6th"],
    tag: "General",
  },
  {
    name: "Magadh University",
    full: "Magadh University (MU)",
    short: "MU",
    est: "Est. 1962",
    color: "#f87171",
    glow: "rgba(248,113,113,.4)",
    bg: "rgba(248,113,113,.1)",
    result_url: "https://magadhuniversity.ac.in/result",
    archive_url: "https://magadhuniversity.ac.in",
    semesters: ["1st","2nd","3rd","4th"],
    tag: "General",
  },
  {
    name: "Lalit Narayan Mithila University",
    full: "Lalit Narayan Mithila University (LNMU)",
    short: "LNMU",
    est: "Est. 1972",
    color: "#c084fc",
    glow: "rgba(192,132,252,.4)",
    bg: "rgba(192,132,252,.1)",
    result_url: "https://lnmu.ac.in/result",
    archive_url: "https://lnmu.ac.in",
    semesters: ["1st","2nd","3rd","4th","5th","6th"],
    tag: "General",
  },
  {
    name: "Tilka Manjhi Bhagalpur University",
    full: "Tilka Manjhi Bhagalpur University (TMBU)",
    short: "TMBU",
    est: "Est. 1960",
    color: "#fb923c",
    glow: "rgba(251,146,60,.4)",
    bg: "rgba(251,146,60,.1)",
    result_url: "https://tmbu.ac.in/result",
    archive_url: "https://tmbu.ac.in",
    semesters: ["1st","2nd","3rd","4th"],
    tag: "General",
  },
  {
    name: "Jai Prakash University",
    full: "Jai Prakash University (JPU)",
    short: "JPU",
    est: "Est. 1990",
    color: "#2dd4bf",
    glow: "rgba(45,212,191,.4)",
    bg: "rgba(45,212,191,.1)",
    result_url: "https://jpv.bih.nic.in",
    archive_url: "https://jpv.bih.nic.in",
    semesters: ["1st","2nd","3rd","4th"],
    tag: "General",
  },
];

// ── University seal / logo ─────────────────────────────────────
function UniSeal({ uni, size = 56 }) {
  // If a real logo path is provided, render it
  if (uni.logo) {
    return (
      <img
        src={uni.logo} alt={uni.short}
        style={{ width: size, height: size, borderRadius: 14, objectFit: "contain",
          background: uni.bg, border: `1px solid ${uni.color}33` }}
      />
    );
  }

  // Otherwise render a styled institutional monogram
  const letters = uni.short.slice(0, 3);
  return (
    <div style={{
      width: size, height: size, borderRadius: 14, flexShrink: 0,
      background: uni.bg,
      border: `1px solid ${uni.color}44`,
      boxShadow: `0 0 20px ${uni.glow}`,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      {/* Decorative ring inside seal */}
      <div style={{
        position: "absolute", inset: 4,
        borderRadius: 10,
        border: `1px solid ${uni.color}22`,
      }} />
      {/* Tiny top arc dots */}
      <div style={{
        position: "absolute", top: 7, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 2,
      }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ width: 2.5, height: 2.5, borderRadius: "50%", background: `${uni.color}66` }} />
        ))}
      </div>

      {/* Monogram */}
      <span style={{
        fontSize: size <= 48 ? 11 : 13,
        fontWeight: 900,
        color: uni.color,
        letterSpacing: letters.length > 2 ? "-.5px" : ".5px",
        textShadow: `0 0 12px ${uni.color}`,
        lineHeight: 1,
        zIndex: 1,
      }}>
        {letters}
      </span>

      {/* Bottom est line */}
      <span style={{
        fontSize: 6.5, fontWeight: 700, color: `${uni.color}88`,
        marginTop: 3, letterSpacing: ".05em", zIndex: 1,
      }}>
        {uni.est.replace("Est. ", "")}
      </span>
    </div>
  );
}

// ── University card ────────────────────────────────────────────
function UniCard({ uni, index, isOpen, onToggle }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: .32, ease: [0.22, 1, .36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onToggle}
      style={{
        borderRadius: 20, overflow: "hidden", cursor: "pointer",
        background: isOpen
          ? `linear-gradient(135deg, ${uni.bg}, rgba(255,255,255,.03))`
          : hovered ? "rgba(255,255,255,.05)" : "rgba(255,255,255,.03)",
        border: `1px solid ${isOpen ? uni.color + "55" : hovered ? uni.color + "33" : "rgba(255,255,255,.08)"}`,
        boxShadow: isOpen ? `0 0 40px ${uni.glow}` : hovered ? `0 0 22px ${uni.glow}` : "none",
        transition: "all .3s cubic-bezier(.22,1,.36,1)",
      }}
    >
      {/* Card top */}
      <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <UniSeal uni={uni} size={54} />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Tag pill */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "2px 8px", borderRadius: 10, marginBottom: 5,
            background: uni.bg, border: `1px solid ${uni.color}33`,
          }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: uni.color, textTransform: "uppercase", letterSpacing: ".08em" }}>
              {uni.tag}
            </span>
          </div>

          <p style={{
            fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.88)",
            lineHeight: 1.35, marginBottom: 2,
            textShadow: isOpen ? `0 0 20px ${uni.color}44` : "none",
            transition: "text-shadow .3s",
          }}>
            {uni.name}
          </p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>
            {uni.short} · {uni.est}
          </p>
        </div>

        {/* Chevron */}
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: .3 }}>
          <ChevronDown size={16} style={{ color: isOpen ? uni.color : "rgba(255,255,255,.25)", transition: "color .3s" }} />
        </motion.div>
      </div>

      {/* Expandable panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: .32, ease: [0.22, 1, .36, 1] }}
            style={{ overflow: "hidden" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              padding: "0 20px 20px",
              borderTop: `1px solid ${uni.color}22`,
              marginTop: 0,
            }}>

              {/* Semester chips */}
              <div style={{ paddingTop: 14, marginBottom: 16 }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em",
                  color: "rgba(255,255,255,.25)", marginBottom: 8 }}>
                  Available semesters
                </p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {uni.semesters.map(s => (
                    <div key={s} style={{
                      padding: "3px 10px", borderRadius: 8,
                      background: uni.bg, border: `1px solid ${uni.color}33`,
                      fontSize: 11, fontWeight: 700, color: uni.color,
                    }}>
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: .96 }}
                  onClick={() => window.open(uni.result_url, "_blank")}
                  style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    padding: "11px 0", borderRadius: 12,
                    background: `linear-gradient(135deg, ${uni.color}, ${uni.color}99)`,
                    border: "none", color: "#fff", fontSize: 13, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit",
                    boxShadow: `0 4px 20px ${uni.glow}`,
                    transition: "box-shadow .2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = `0 6px 28px ${uni.glow}`}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = `0 4px 20px ${uni.glow}`}
                >
                  <Trophy size={13} /> Check My Result
                  <ExternalLink size={11} style={{ opacity: .7 }} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: .96 }}
                  onClick={() => window.open(uni.archive_url, "_blank")}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "11px 16px", borderRadius: 12,
                    background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
                    color: "rgba(255,255,255,.5)", fontSize: 12, fontWeight: 600,
                    cursor: "pointer", fontFamily: "inherit", transition: "all .2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.1)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.05)"; e.currentTarget.style.color = "rgba(255,255,255,.5)"; }}
                >
                  <Archive size={13} /> Archive
                </motion.button>
              </div>

              <p style={{ fontSize: 10, color: "rgba(255,255,255,.18)", marginTop: 10, textAlign: "center" }}>
                Opens official portal · use browser print to save PDF
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Page ───────────────────────────────────────────────────────
export default function ResultsPage() {
  const [selected, setSelected] = useState(null);

  const toggle = (short) => setSelected(prev => prev === short ? null : short);

  return (
    <AppShell>
      <div style={{ padding: "32px 28px", maxWidth: 860, margin: "0 auto" }}>

        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "rgba(167,139,250,.15)", border: "1px solid rgba(167,139,250,.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px rgba(167,139,250,.2)",
          }}>
            <Trophy size={18} style={{ color: "#a78bfa" }} />
          </div>
          <h1 style={{
            fontSize: 26, fontWeight: 800,
            background: "linear-gradient(135deg,#fff 0%,#c4b5fd 50%,#818cf8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Results Portal
          </h1>
        </motion.div>

        {/* Info banner */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .07 }}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 18px", borderRadius: 14, marginBottom: 28,
            background: "rgba(251,191,36,.07)", border: "1px solid rgba(251,191,36,.2)",
            boxShadow: "0 0 24px rgba(251,191,36,.06)",
          }}>
          <ShieldAlert size={14} style={{ color: "#fbbf24", flexShrink: 0 }} />
          <p style={{ fontSize: 12, color: "rgba(251,191,36,.85)", lineHeight: 1.5 }}>
            Results open on the official university portal. We never store your registration number.
          </p>
        </motion.div>

        {/* University grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
          {UNIVERSITIES.map((uni, i) => (
            <UniCard
              key={uni.short} uni={uni} index={i}
              isOpen={selected === uni.short}
              onToggle={() => toggle(uni.short)}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}