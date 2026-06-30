// src/app/exam-hub/gate/page.js
// REPLACE your existing exam-hub/gate/page.js with this

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import { GraduationCap, ExternalLink, Clock } from "lucide-react";
import { gateContent } from "@/lib/examContent";

const TABS = [
  { key: "about",    label: "About" },
  { key: "syllabus", label: "Syllabus" },
  { key: "pyq",      label: "PYQs" },
];

export default function GatePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("about");
  const [checking, setChecking] = useState(true);
  const [portalHov, setPortalHov] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setChecking(false);
    };
    check();
  }, [router]);

  if (checking) {
    return (
      <AppShell>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            border: "3px solid rgba(124,58,237,.25)", borderTopColor: "#7c3aed",
            animation: "gpSpin 1s linear infinite",
          }} />
        </div>
        <style>{`@keyframes gpSpin{to{transform:rotate(360deg)}}`}</style>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <style>{`
        .gp-wrap { padding:32px 28px; max-width:760px; margin:0 auto; }
        .gp-tabs { display:flex; gap:8px; margin-bottom:20px; }
        @media (max-width:768px) {
          .gp-wrap { padding:20px 14px; }
        }
      `}</style>

      <div className="gp-wrap">

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

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22,1,.36,1] }}
          style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{
              width: 60, height: 60, borderRadius: 18, flexShrink: 0,
              background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
              boxShadow: "0 0 36px rgba(124,58,237,.55)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <GraduationCap size={28} color="white" />
          </motion.div>
          <div>
            <h1 style={{
              fontSize: 24, fontWeight: 800,
              background: "linear-gradient(135deg,#fff 0%,#c4b5fd 60%,#818cf8 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              GATE
            </h1>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,.4)" }}>
              Graduate Aptitude Test in Engineering
            </p>
          </div>
        </motion.div>

        {/* Official portal */}
        <motion.a
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          href="https://gate2026.iitr.ac.in" target="_blank" rel="noopener noreferrer"
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
          Open Official GATE Portal
          <ExternalLink size={14} style={{ transform: portalHov ? "translate(2px,-2px)" : "none", transition: "transform .2s" }} />
        </motion.a>

        {/* Tabs — only 3, bigger */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="gp-tabs"
        >
          {TABS.map((tab, i) => (
            <motion.button
              key={tab.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 + i * 0.05 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1, padding: "11px 14px", borderRadius: 13, fontSize: 13.5, fontWeight: 700,
                cursor: "pointer",
                background: activeTab === tab.key ? "rgba(124,58,237,.25)" : "rgba(255,255,255,.04)",
                border: `1px solid ${activeTab === tab.key ? "rgba(124,58,237,.5)" : "rgba(255,255,255,.08)"}`,
                color: activeTab === tab.key ? "#c4b5fd" : "rgba(255,255,255,.45)",
                boxShadow: activeTab === tab.key ? "0 0 20px rgba(124,58,237,.3)" : "none",
                transition: "background .2s, border-color .2s, box-shadow .2s, color .2s",
              }}
            >
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Content */}
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

            {activeTab === "pyq" ? (
              <div style={{ textAlign: "center", padding: "34px 0", position: "relative" }}>
                <motion.div
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  style={{ display: "inline-block", marginBottom: 14 }}
                >
                  <Clock size={30} style={{ color: "#a78bfa" }} />
                </motion.div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,.75)", marginBottom: 4 }}>
                  PYQs Coming Soon
                </p>
                <p style={{ fontSize: 12.5, color: "rgba(255,255,255,.35)" }}>
                  We're compiling previous year question papers — check back soon.
                </p>
              </div>
            ) : (
              <>
                <p style={{
                  fontSize: 13, fontWeight: 700, marginBottom: 12, position: "relative",
                  background: "linear-gradient(135deg,#c4b5fd,#818cf8)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>
                  {TABS.find(t => t.key === activeTab)?.label}
                </p>
                <p style={{ fontSize: 13.5, color: "rgba(255,255,255,.65)", lineHeight: 1.75, whiteSpace: "pre-line", position: "relative" }}>
                  {gateContent[activeTab]}
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </AppShell>
  );
}