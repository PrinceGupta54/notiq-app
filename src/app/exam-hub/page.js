// src/app/exam-hub/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import { Zap, BookOpen, Landmark, ChevronRight, Trophy } from "lucide-react";

const CATEGORIES = ["All", "Technical & Engineering", "Civil Services & PSC", "Banking & Finance"];

const CATEGORY_CONFIG = {
  "Technical & Engineering": {
    color: "#818cf8",
    glow: "rgba(129,140,248,0.18)",
    bg: "rgba(129,140,248,0.08)",
    border: "rgba(129,140,248,0.28)",
    icon: Zap,
    label: "Technical & Engineering",
  },
  "Civil Services & PSC": {
    color: "#34d399",
    glow: "rgba(52,211,153,0.18)",
    bg: "rgba(52,211,153,0.08)",
    border: "rgba(52,211,153,0.28)",
    icon: Landmark,
    label: "Civil Services & PSC",
  },
  "Banking & Finance": {
    color: "#fbbf24",
    glow: "rgba(251,191,36,0.18)",
    bg: "rgba(251,191,36,0.08)",
    border: "rgba(251,191,36,0.28)",
    icon: BookOpen,
    label: "Banking & Finance",
  },
};

// ── Ambient background orbs ──────────────────────────────────
function AmbientOrbs() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <div style={{
        position: "absolute", top: "-20%", right: "-10%",
        width: 560, height: 560, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(129,140,248,0.11) 0%, transparent 70%)",
        filter: "blur(70px)",
        animation: "orbA 13s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: "-15%", left: "-8%",
        width: 480, height: 480, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(52,211,153,0.09) 0%, transparent 70%)",
        filter: "blur(70px)",
        animation: "orbB 16s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", top: "55%", right: "30%",
        width: 280, height: 280, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 70%)",
        filter: "blur(50px)",
        animation: "orbC 10s ease-in-out infinite",
      }} />
      <style>{`
        @keyframes orbA { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(-30px,40px) scale(1.06)} 70%{transform:translate(20px,-20px) scale(0.96)} }
        @keyframes orbB { 0%,100%{transform:translate(0,0) scale(1)} 35%{transform:translate(40px,-30px) scale(1.05)} 65%{transform:translate(-15px,25px) scale(0.97)} }
        @keyframes orbC { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,30px)} }
      `}</style>
    </div>
  );
}

// ── Skeleton loader card ─────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      borderRadius: 18, padding: "20px",
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      animation: "skPulse 1.6s ease-in-out infinite",
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.06)", marginBottom: 14 }} />
      <div style={{ height: 13, width: "60%", borderRadius: 6, background: "rgba(255,255,255,0.06)", marginBottom: 8 }} />
      <div style={{ height: 11, width: "85%", borderRadius: 6, background: "rgba(255,255,255,0.04)" }} />
    </div>
  );
}

// ── Filter pills ─────────────────────────────────────────────
function FilterPills({ active, onChange, exams }) {
  const counts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = cat === "All" ? exams.length : exams.filter(e => e.category === cat).length;
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
      {CATEGORIES.map(cat => {
        const isActive = active === cat;
        const cfg = cat !== "All" ? CATEGORY_CONFIG[cat] : null;
        return (
          <motion.button
            key={cat}
            onClick={() => onChange(cat)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            style={{
              padding: "8px 18px", borderRadius: 30,
              border: `1px solid ${isActive ? (cfg ? cfg.border : "rgba(255,255,255,0.35)") : "rgba(255,255,255,0.08)"}`,
              background: isActive ? (cfg ? cfg.bg : "rgba(255,255,255,0.07)") : "rgba(255,255,255,0.03)",
              color: isActive ? (cfg ? cfg.color : "#fff") : "rgba(255,255,255,0.4)",
              fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              boxShadow: isActive && cfg ? `0 0 18px ${cfg.glow}` : "none",
              transition: "all .22s",
              display: "flex", alignItems: "center", gap: 7,
              letterSpacing: "0.02em",
            }}
          >
            {cfg && (
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: cfg.color, boxShadow: `0 0 6px ${cfg.color}`,
              }} />
            )}
            {cat}
            <span style={{
              padding: "1px 7px", borderRadius: 10,
              background: "rgba(255,255,255,0.07)",
              fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600,
            }}>
              {counts[cat]}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

// ── Exam card ────────────────────────────────────────────────
function ExamCard({ exam, index, onClick }) {
  const [hovered, setHovered] = useState(false);
  const accentColor = exam.color || "#818cf8";
  const glowColor = accentColor + "30";
  const bgColor = accentColor + "14";
  const borderColor = accentColor + "45";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      layout
    >
      <motion.button
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileTap={{ scale: 0.965 }}
        onClick={onClick}
        style={{
          width: "100%", textAlign: "left",
          padding: "20px", borderRadius: 18,
          border: `1px solid ${hovered ? borderColor : "rgba(255,255,255,0.07)"}`,
          background: hovered
            ? `linear-gradient(135deg, ${bgColor}, rgba(255,255,255,0.02))`
            : "rgba(255,255,255,0.03)",
          cursor: "pointer", fontFamily: "inherit",
          boxShadow: hovered ? `0 10px 44px ${glowColor}, 0 0 0 1px ${borderColor}` : "0 1px 6px rgba(0,0,0,0.25)",
          transition: "all .26s cubic-bezier(0.22,1,0.36,1)",
          position: "relative", overflow: "hidden",
          display: "flex", flexDirection: "column", gap: 0,
        }}
      >
        {/* Shimmer sweep */}
        <motion.div
          initial={false}
          animate={{ x: hovered ? "220%" : "-100%" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: `linear-gradient(105deg, transparent 35%, ${bgColor} 50%, transparent 65%)`,
          }}
        />

        {/* Corner glow */}
        <div style={{
          position: "absolute", top: -20, right: -20,
          width: 80, height: 80, borderRadius: "50%",
          background: `radial-gradient(circle, ${accentColor}22 0%, transparent 70%)`,
          opacity: hovered ? 1 : 0,
          transition: "opacity .3s",
          pointerEvents: "none",
        }} />

        {/* Icon box */}
        <motion.div
          animate={{ scale: hovered ? 1.08 : 1, rotate: hovered ? 4 : 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{
            width: 46, height: 46, borderRadius: 13,
            background: bgColor,
            border: `1px solid ${hovered ? borderColor : accentColor + "25"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, marginBottom: 14,
            boxShadow: hovered ? `0 0 18px ${glowColor}` : "none",
            transition: "box-shadow .25s, border-color .25s",
          }}
        >
          {exam.icon}
        </motion.div>

        {/* Text */}
        <p style={{
          fontSize: 14, fontWeight: 750, lineHeight: 1.25,
          color: hovered ? "#fff" : "rgba(255,255,255,0.85)",
          marginBottom: 5, transition: "color .2s",
        }}>
          {exam.name}
        </p>
        <p style={{
          fontSize: 11, lineHeight: 1.45,
          color: "rgba(255,255,255,0.35)",
          transition: "color .2s",
        }}>
          {exam.full_name}
        </p>

        {/* Bottom row: arrow */}
        <motion.div
          animate={{ x: hovered ? 2 : 0, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "absolute", bottom: 16, right: 16,
            color: accentColor,
          }}
        >
          <ChevronRight size={15} />
        </motion.div>

        {/* Bottom accent line */}
        <motion.div
          animate={{ scaleX: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
          initial={{ scaleX: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            height: 2, transformOrigin: "left",
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            borderRadius: "0 0 18px 18px",
          }}
        />
      </motion.button>
    </motion.div>
  );
}

// ── Category section header ──────────────────────────────────
function SectionHeader({ category, count }) {
  const cfg = CATEGORY_CONFIG[category];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        marginBottom: 14,
      }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 0 12px ${cfg.glow}`,
      }}>
        <Icon size={13} style={{ color: cfg.color }} />
      </div>
      <span style={{
        fontSize: 11, fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.1em", color: cfg.color,
      }}>
        {category}
      </span>
      <span style={{
        fontSize: 10, fontWeight: 600, padding: "2px 8px",
        borderRadius: 10, background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: "rgba(255,255,255,0.35)",
        marginLeft: 2,
      }}>
        {count}
      </span>
      <div style={{
        flex: 1, height: 1,
        background: `linear-gradient(90deg, ${cfg.border}, transparent)`,
        marginLeft: 4,
      }} />
    </motion.div>
  );
}

// ── Main page ────────────────────────────────────────────────
export default function ExamHubPage() {
  const router = useRouter();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const { data } = await supabase
        .from("exams")
        .select("id, name, full_name, category, icon, color")
        .order("category");
      setExams(data || []);
      setLoading(false);
    };
    init();
  }, [router]);

  const filtered = activeCategory === "All"
    ? exams
    : exams.filter(e => e.category === activeCategory);

  const grouped = filtered.reduce((acc, exam) => {
    if (!acc[exam.category]) acc[exam.category] = [];
    acc[exam.category].push(exam);
    return acc;
  }, {});

  return (
    <AppShell>
      <AmbientOrbs />

      <div style={{ position: "relative", zIndex: 1, padding: "32px 24px 64px", maxWidth: 860, margin: "0 auto" }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 32 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <motion.div
              animate={{ rotate: [0, 12, -8, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 6 }}
            >
              <Trophy size={18} style={{ color: "#fbbf24" }} />
            </motion.div>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "rgba(251,191,36,0.7)",
            }}>
              Competitive Exam Portal
            </span>
          </div>

          <h1 style={{
            fontSize: 30, fontWeight: 800, lineHeight: 1.15, marginBottom: 10,
            background: "linear-gradient(135deg, #fff 0%, #e0e7ff 35%, #818cf8 70%, #6366f1 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Exam Hub
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>
            One-stop destination for all competitive exams
          </p>
        </motion.div>

        {/* ── Filters ── */}
        {!loading && (
          <FilterPills active={activeCategory} onChange={setActiveCategory} exams={exams} />
        )}

        {/* ── Loading skeletons ── */}
        {loading ? (
          <div>
            <div style={{ height: 14, width: 160, borderRadius: 6, background: "rgba(255,255,255,0.06)", marginBottom: 16 }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 12, marginBottom: 36 }}>
              {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
            </div>
            <style>{`@keyframes skPulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
          </div>
        ) : (
          /* ── Grouped sections ── */
          <AnimatePresence mode="wait">
            <motion.div key={activeCategory}>
              {Object.entries(grouped).map(([category, categoryExams], gi) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gi * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{ marginBottom: 40 }}
                >
                  <SectionHeader category={category} count={categoryExams.length} />

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
                    gap: 12,
                  }}>
                    <AnimatePresence>
                      {categoryExams.map((exam, i) => (
                        <ExamCard
                          key={exam.id}
                          exam={exam}
                          index={i}
                          onClick={() => router.push(`/exam-hub/${exam.id}`)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}

              {/* Empty state */}
              {Object.keys(grouped).length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.2)", fontSize: 14 }}
                >
                  No exams found in this category
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <style>{`@keyframes skPulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
    </AppShell>
  );
}