// src/app/exam-hub/[id]/page.js
// REPLACE your entire existing exam-hub/[id]/page.js with this

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import { ExternalLink } from "lucide-react";
import { examContent } from "@/lib/examContent";

const TABS = [
  { key: "about",        label: "About" },
  { key: "opportunities",label: "Opportunities" },
  { key: "timeline",     label: "Timeline" },
  { key: "eligibility",  label: "Eligibility" },
  { key: "exam_pattern", label: "Exam Pattern" },
  { key: "cutoffs",      label: "Cutoffs & Scores" },
  { key: "application",  label: "Application" },
  { key: "after_exam",   label: "After Exam" },
  { key: "faqs",         label: "FAQs" },
  { key: "disclaimer",   label: "Disclaimer" },
];

function ExamLogo({ exam }) {
  const [failed, setFailed] = useState(false);
  const initials = exam.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  if (!exam.icon || failed) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{
          width: 56, height: 56, borderRadius: 16, flexShrink: 0,
          background: "rgba(124,58,237,.18)", border: "1px solid rgba(124,58,237,.35)",
          boxShadow: "0 0 24px rgba(124,58,237,.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 19, fontWeight: 700, color: "#c4b5fd",
        }}
      >
        {initials}
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      style={{
        width: 56, height: 56, borderRadius: 16, flexShrink: 0,
        background: "#fff", border: "1px solid rgba(255,255,255,.1)",
        boxShadow: "0 0 24px rgba(124,58,237,.2)",
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
      }}
    >
      <img src={exam.icon} alt={exam.name} onError={() => setFailed(true)}
        style={{ width: "78%", height: "78%", objectFit: "contain" }} />
    </motion.div>
  );
}

export default function ExamDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [activeTab, setActiveTab] = useState("about");
  const [loading, setLoading] = useState(true);
  const [portalHov, setPortalHov] = useState(false);

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

  if (loading) {
    return (
      <AppShell>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            border: "3px solid rgba(124,58,237,.25)", borderTopColor: "#7c3aed",
            animation: "edSpin 1s linear infinite",
          }} />
        </div>
        <style>{`@keyframes edSpin{to{transform:rotate(360deg)}}`}</style>
      </AppShell>
    );
  }

  if (!exam) {
    return (
      <AppShell>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <p style={{ color: "rgba(255,255,255,.35)" }}>Exam not found.</p>
        </div>
      </AppShell>
    );
  }

  const content = examContent[exam.name] || {};
  const tabContent = content[activeTab];

  return (
    <AppShell>
      <style>{`
        .ed-wrap { padding:32px 28px; max-width:760px; margin:0 auto; }
        .ed-tabs { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px; }
        @media (max-width:768px) {
          .ed-wrap { padding:20px 14px; }
        }
      `}</style>

      <div className="ed-wrap">

        <motion.button
          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push("/exam-hub")}
          whileHover={{ x: -3 }}
          style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.4)", fontSize: 13, marginBottom: 22, padding: 0, transition: "color .2s" }}
          onMouseEnter={e => e.currentTarget.style.color = "#a78bfa"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.4)"}
        >
          ← Exam Hub
        </motion.button>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22,1,.36,1] }}
          style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}
        >
          <ExamLogo exam={exam} />
          <div>
            <h1 style={{
              fontSize: 22, fontWeight: 800,
              background: "linear-gradient(135deg,#fff 0%,#c4b5fd 60%,#818cf8 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              {exam.name}
            </h1>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,.4)" }}>{exam.full_name}</p>
          </div>
        </motion.div>

        {/* ── Official portal button ── */}
        {exam.official_url && (
          <motion.a
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            href={exam.official_url} target="_blank" rel="noopener noreferrer"
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            onHoverStart={() => setPortalHov(true)}
            onHoverEnd={() => setPortalHov(false)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              width: "100%", padding: "13px", borderRadius: 13, marginBottom: 24,
              background: "linear-gradient(135deg, rgba(124,58,237,.22), rgba(91,33,182,.12))",
              border: `1px solid ${portalHov ? "rgba(124,58,237,.6)" : "rgba(124,58,237,.3)"}`,
              color: "#c4b5fd", fontSize: 13.5, fontWeight: 700, textDecoration: "none",
              boxShadow: portalHov ? "0 10px 30px rgba(124,58,237,.3)" : "0 0 20px rgba(124,58,237,.1)",
              transition: "box-shadow .25s, border-color .25s",
            }}
          >
            Open Official Portal
            <ExternalLink size={14} style={{ transform: portalHov ? "translate(2px,-2px)" : "none", transition: "transform .2s" }} />
          </motion.a>
        )}

        {/* ── Tabs ── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="ed-tabs"
        >
          {TABS.map((tab, i) => (
            <motion.button
              key={tab.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.18 + i * 0.02 }}
              whileHover={{ scale: 1.06, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "7px 14px", borderRadius: 20, fontSize: 11.5, fontWeight: 600,
                cursor: "pointer", whiteSpace: "nowrap",
                background: activeTab === tab.key ? "rgba(124,58,237,.25)" : "rgba(255,255,255,.04)",
                border: `1px solid ${activeTab === tab.key ? "rgba(124,58,237,.5)" : "rgba(255,255,255,.08)"}`,
                color: activeTab === tab.key ? "#c4b5fd" : "rgba(255,255,255,.45)",
                boxShadow: activeTab === tab.key ? "0 0 16px rgba(124,58,237,.25)" : "none",
                transition: "background .2s, border-color .2s, box-shadow .2s, color .2s",
              }}
            >
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* ── Content card ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, filter: "blur(3px)" }}
            animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6,  filter: "blur(2px)" }}
            transition={{ duration: 0.25, ease: [0.22,1,.36,1] }}
            style={{
              background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 16, padding: "22px 24px",
              boxShadow: "0 4px 24px rgba(0,0,0,.2)",
              position: "relative", overflow: "hidden",
            }}
          >
            <div style={{
              position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(124,58,237,.08), transparent 70%)",
              pointerEvents: "none",
            }} />
            <p style={{
              fontSize: 13, fontWeight: 700, marginBottom: 12, position: "relative",
              background: "linear-gradient(135deg,#c4b5fd,#818cf8)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              {TABS.find(t => t.key === activeTab)?.label}
            </p>
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,.65)", lineHeight: 1.75, whiteSpace: "pre-line", position: "relative" }}>
              {tabContent || "Content coming soon — check the official portal for the latest details."}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </AppShell>
  );
}