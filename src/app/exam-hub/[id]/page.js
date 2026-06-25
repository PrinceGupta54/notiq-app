// src/app/exam-hub/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import { ExternalLink, ChevronRight } from "lucide-react";

// ── Ambient orbs ─────────────────────────────────────────────
function AmbientOrbs({ color }) {
  const c = color || "#818cf8";
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <div style={{
        position: "absolute", top: "-20%", left: "-10%",
        width: 600, height: 600, borderRadius: "50%",
        background: `radial-gradient(circle, ${c}18 0%, transparent 65%)`,
        filter: "blur(80px)",
        animation: "orbA 14s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: "-15%", right: "-8%",
        width: 440, height: 440, borderRadius: "50%",
        background: `radial-gradient(circle, ${c}0e 0%, transparent 70%)`,
        filter: "blur(60px)",
        animation: "orbB 17s ease-in-out infinite",
      }} />
      <style>{`
        @keyframes orbA{0%,100%{transform:translate(0,0) scale(1)}40%{transform:translate(30px,40px) scale(1.06)}70%{transform:translate(-15px,-20px) scale(0.96)}}
        @keyframes orbB{0%,100%{transform:translate(0,0)}45%{transform:translate(-25px,30px)}75%{transform:translate(15px,-15px)}}
        @keyframes skPulse{0%,100%{opacity:1}50%{opacity:.4}}
      `}</style>
    </div>
  );
}

// ── Skeleton loader ──────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ position: "relative", zIndex: 1, padding: "32px 24px", maxWidth: 760, margin: "0 auto" }}>
      {/* Hero skeleton */}
      <div style={{ display: "flex", gap: 18, marginBottom: 28, animation: "skPulse 1.6s ease-in-out infinite" }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(255,255,255,0.07)", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 20, width: "40%", borderRadius: 6, background: "rgba(255,255,255,0.07)", marginBottom: 10 }} />
          <div style={{ height: 13, width: "65%", borderRadius: 6, background: "rgba(255,255,255,0.05)" }} />
        </div>
      </div>
      <div style={{ height: 46, borderRadius: 12, background: "rgba(255,255,255,0.05)", marginBottom: 28, animation: "skPulse 1.6s ease-in-out infinite" }} />
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {[100, 130, 110, 90, 120].map((w, i) => (
          <div key={i} style={{ height: 32, width: w, borderRadius: 30, background: "rgba(255,255,255,0.05)", animation: "skPulse 1.6s ease-in-out infinite" }} />
        ))}
      </div>
      <div style={{ height: 260, borderRadius: 18, background: "rgba(255,255,255,0.04)", animation: "skPulse 1.6s ease-in-out infinite" }} />
    </div>
  );
}

// ── Tab pill ─────────────────────────────────────────────────
function TabPill({ tab, index, isActive, color, onClick }) {
  const [hovered, setHovered] = useState(false);
  const hex = color || "#818cf8";
  const glow = hex + "40";
  const bg   = hex + "18";
  const bdr  = hex + "55";

  return (
    <motion.button
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      style={{
        padding: "8px 18px", borderRadius: 30,
        border: `1px solid ${isActive ? bdr : "rgba(255,255,255,0.09)"}`,
        background: isActive ? bg : hovered ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
        color: isActive ? hex : "rgba(255,255,255,0.4)",
        fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
        boxShadow: isActive ? `0 0 18px ${glow}` : "none",
        transition: "all .22s",
        display: "flex", alignItems: "center", gap: 6,
        letterSpacing: "0.02em", whiteSpace: "nowrap",
      }}
    >
      {isActive && (
        <motion.span
          layoutId="tabDot"
          style={{
            width: 6, height: 6, borderRadius: "50%",
            background: hex, boxShadow: `0 0 7px ${hex}`,
            display: "inline-block",
          }}
        />
      )}
      {tab.label}
    </motion.button>
  );
}

// ── Content panel ─────────────────────────────────────────────
function ContentPanel({ tab, color }) {
  if (!tab) return null;
  const hex = color || "#818cf8";
  const bg  = hex + "09";
  const bdr = hex + "28";

  // Try to detect structured content (lines starting with • or numbers)
  const lines = (tab.content || "").split("\n").filter(Boolean);
  const isList = lines.length > 2 && lines.some(l => /^[•\-\d]/.test(l.trim()));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      style={{
        borderRadius: 20,
        border: `1px solid ${bdr}`,
        background: `linear-gradient(135deg, ${bg}, rgba(255,255,255,0.02))`,
        overflow: "hidden",
        boxShadow: `0 4px 40px ${hex}12`,
      }}
    >
      {/* Panel header bar */}
      <div style={{
        padding: "16px 24px",
        borderBottom: `1px solid ${bdr}`,
        display: "flex", alignItems: "center", gap: 10,
        background: `linear-gradient(90deg, ${hex}10, transparent)`,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: hex, boxShadow: `0 0 10px ${hex}`,
        }} />
        <span style={{
          fontSize: 12, fontWeight: 700, color: hex,
          letterSpacing: "0.06em", textTransform: "uppercase",
        }}>
          {tab.label}
        </span>
      </div>

      {/* Panel body */}
      <div style={{ padding: "24px" }}>
        {isList ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {lines.map((line, i) => {
              const trimmed = line.trim();
              const isBullet = /^[•\-]/.test(trimmed);
              const isNum    = /^\d+[\.\)]/.test(trimmed);
              const isHead   = !isBullet && !isNum && trimmed.endsWith(":") || trimmed === trimmed.toUpperCase();
              const text     = trimmed.replace(/^[•\-\d]+[\.\)]?\s*/, "");

              if (isHead) return (
                <p key={i} style={{
                  fontSize: 11, fontWeight: 700, color: hex,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  marginTop: i > 0 ? 8 : 0, marginBottom: 2,
                }}>
                  {trimmed}
                </p>
              );

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 12,
                    padding: "10px 14px", borderRadius: 10,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span style={{
                    flexShrink: 0, marginTop: 2,
                    width: 6, height: 6, borderRadius: "50%",
                    background: hex, boxShadow: `0 0 6px ${hex}`,
                    opacity: 0.7,
                  }} />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 1.6 }}>
                    {text || trimmed}
                  </span>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p style={{
            fontSize: 14, lineHeight: 1.85,
            color: "rgba(255,255,255,0.65)",
            whiteSpace: "pre-line",
          }}>
            {tab.content}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ── Main page ────────────────────────────────────────────────
export default function ExamDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [linkHovered, setLinkHovered] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const { data } = await supabase.from("exams").select("*").eq("id", id).single();
      setExam(data);
      setLoading(false);
    };
    init();
  }, [id, router]);

  const hex  = exam?.color || "#818cf8";
  const glow = hex + "30";
  const bg   = hex + "14";
  const bdr  = hex + "45";
  const tabs = exam?.tabs || [];

  if (loading) return (
    <AppShell>
      <AmbientOrbs color="#818cf8" />
      <Skeleton />
    </AppShell>
  );

  if (!exam) return (
    <AppShell>
      <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>Exam not found.</p>
      </div>
    </AppShell>
  );

  return (
    <AppShell>
      <AmbientOrbs color={hex} />

      <div style={{ position: "relative", zIndex: 1, padding: "32px 24px 64px", maxWidth: 760, margin: "0 auto" }}>

        {/* ── Hero card ── */}
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "flex", alignItems: "center", gap: 20,
            padding: "24px 26px", borderRadius: 20,
            border: `1px solid ${bdr}`,
            background: `linear-gradient(135deg, ${bg}, rgba(255,255,255,0.02))`,
            boxShadow: `0 8px 40px ${glow}`,
            marginBottom: 20,
            position: "relative", overflow: "hidden",
          }}
        >
          {/* Background radial */}
          <div style={{
            position: "absolute", top: -40, right: -40,
            width: 200, height: 200, borderRadius: "50%",
            background: `radial-gradient(circle, ${hex}20 0%, transparent 70%)`,
            pointerEvents: "none",
          }} />

          {/* Icon */}
          <motion.div
            animate={{ rotate: [0, 5, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 8 }}
            style={{
              flexShrink: 0, width: 64, height: 64, borderRadius: 16,
              background: bg, border: `1px solid ${bdr}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28,
              boxShadow: `0 0 24px ${glow}`,
            }}
          >
            {exam.icon}
          </motion.div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", color: hex, marginBottom: 6, opacity: 0.8,
            }}>
              {exam.category}
            </p>
            <h1 style={{
              fontSize: 24, fontWeight: 800, lineHeight: 1.2,
              color: "#fff", marginBottom: 4,
            }}>
              {exam.name}
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              {exam.full_name}
            </p>
          </div>
        </motion.div>

        {/* ── Official portal button ── */}
        {exam.official_url && (
          <motion.a
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            href={exam.official_url}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setLinkHovered(true)}
            onMouseLeave={() => setLinkHovered(false)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              width: "100%", padding: "14px 20px", borderRadius: 14, marginBottom: 24,
              border: `1px solid ${linkHovered ? bdr : "rgba(255,255,255,0.09)"}`,
              background: linkHovered ? bg : "rgba(255,255,255,0.03)",
              color: linkHovered ? hex : "rgba(255,255,255,0.55)",
              fontSize: 13, fontWeight: 700, textDecoration: "none", fontFamily: "inherit",
              boxShadow: linkHovered ? `0 0 28px ${glow}` : "none",
              transition: "all .25s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <ExternalLink size={15} />
            Open Official Portal
            <motion.span
              animate={{ x: linkHovered ? 4 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight size={14} />
            </motion.span>
          </motion.a>
        )}

        {/* ── Tab pills ── */}
        {tabs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, overflowX: "auto", scrollbarWidth: "none" }}
          >
            {tabs.map((tab, i) => (
              <TabPill
                key={i}
                tab={tab}
                index={i}
                isActive={activeTab === i}
                color={hex}
                onClick={() => setActiveTab(i)}
              />
            ))}
          </motion.div>
        )}

        {/* ── Content panel ── */}
        <AnimatePresence mode="wait">
          <ContentPanel key={activeTab} tab={tabs[activeTab]} color={hex} />
        </AnimatePresence>

      </div>
    </AppShell>
  );
}