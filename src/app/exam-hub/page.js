// src/app/exam-hub/page.js
// REPLACE your entire existing exam-hub/page.js with this

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import { GraduationCap, Landmark, Building2, Banknote, ArrowUpRight } from "lucide-react";

const CATEGORY_CONFIG = [
  { name: "Civil Services",    icon: Landmark,  color: "#a78bfa", glow: "124,58,237"  },
  { name: "Government Exams",  icon: Building2, color: "#67e8f9", glow: "103,232,249" },
  { name: "Banking & Finance", icon: Banknote,  color: "#86efac", glow: "134,239,172" },
];

function ExamLogo({ exam, size = 40, glow = "124,58,237" }) {
  const [failed, setFailed] = useState(false);
  const initials = exam.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  if (!exam.icon || failed) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 10, flexShrink: 0,
        background: `rgba(${glow},.15)`, border: `1px solid rgba(${glow},.3)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.32, fontWeight: 700, color: "#fff",
      }}>
        {initials}
      </div>
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: 10, flexShrink: 0,
      background: "#fff", border: "1px solid rgba(255,255,255,.1)",
      display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
    }}>
      <img src={exam.icon} alt={exam.name} onError={() => setFailed(true)}
        style={{ width: "80%", height: "80%", objectFit: "contain" }} />
    </div>
  );
}

function ExamCard({ exam, color, glow, index, sectionDelay, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: sectionDelay + index * 0.04, duration: 0.4, ease: [0.22,1,.36,1] }}
      whileHover={{ y: -4, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      onClick={onClick}
      style={{
        background: "rgba(255,255,255,.04)",
        border: `1px solid ${hov ? `rgba(${glow},.45)` : "rgba(255,255,255,.08)"}`,
        borderRadius: 16, padding: "16px 18px",
        display: "flex", alignItems: "center", gap: 13,
        cursor: "pointer", position: "relative", overflow: "hidden",
        boxShadow: hov ? `0 14px 32px rgba(${glow},.22), 0 0 0 1px rgba(${glow},.2)` : "0 2px 10px rgba(0,0,0,.2)",
        transition: "box-shadow .25s, border-color .25s",
      }}
    >
      {/* glow orb */}
      <div style={{
        position: "absolute", top: -18, right: -18, width: 60, height: 60, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(${glow},.2), transparent 70%)`,
        opacity: hov ? 1 : 0.3, transition: "opacity .25s",
      }} />
      <ExamLogo exam={exam} size={40} glow={glow} />
      <div style={{ minWidth: 0, flex: 1, position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.9)" }}>{exam.name}</p>
        <p style={{ fontSize: 10.5, color: "rgba(255,255,255,.35)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {exam.full_name}
        </p>
      </div>
      <ArrowUpRight
        size={13}
        style={{
          color: hov ? color : "rgba(255,255,255,.15)",
          transform: hov ? "translate(1px,-1px)" : "none",
          transition: "all .2s", flexShrink: 0, position: "relative", zIndex: 1,
        }}
      />
    </motion.div>
  );
}

export default function ExamHubPage() {
  const router = useRouter();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gateHov, setGateHov] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const { data } = await supabase.from("exams").select("*").order("name");
      setExams(data || []);
      setLoading(false);
    };
    init();
  }, [router]);

  const grouped = CATEGORY_CONFIG.map(cat => ({
    ...cat,
    items: exams.filter(e => e.category === cat.name),
  }));

  return (
    <AppShell>
      <style>{`
        .eh-wrap { padding:32px 28px; max-width:1000px; margin:0 auto; }
        .eh-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
        @media (max-width:768px) {
          .eh-wrap { padding:20px 14px; }
          .eh-grid { grid-template-columns:repeat(2,1fr); }
        }
        @media (max-width:480px) {
          .eh-grid { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="eh-wrap">

        <motion.h1
          initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22,1,.36,1] }}
          style={{
            fontSize: 28, fontWeight: 800, marginBottom: 6,
            background: "linear-gradient(135deg,#fff 0%,#c4b5fd 50%,#818cf8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}
        >
          Exam Hub
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          style={{ fontSize: 13, color: "rgba(255,255,255,.32)", marginBottom: 28 }}
        >
          One-stop destination for all competitive exams
        </motion.p>

        {/* ── GATE special glowing card ── */}
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.45, ease: [0.22,1,.36,1] }}
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onHoverStart={() => setGateHov(true)}
          onHoverEnd={() => setGateHov(false)}
          onClick={() => router.push("/exam-hub/gate")}
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,.22), rgba(91,33,182,.12))",
            border: `1px solid ${gateHov ? "rgba(124,58,237,.6)" : "rgba(124,58,237,.3)"}`,
            borderRadius: 20, padding: "22px 26px", marginBottom: 32,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 18,
            position: "relative", overflow: "hidden",
            boxShadow: gateHov ? "0 20px 50px rgba(124,58,237,.3), 0 0 0 1px rgba(124,58,237,.3)" : "0 0 30px rgba(124,58,237,.08)",
            transition: "box-shadow .3s, border-color .3s",
          }}
        >
          <motion.div
            animate={{ opacity: gateHov ? 1 : 0.5, scale: gateHov ? 1.15 : 1 }}
            transition={{ duration: 0.4 }}
            style={{
              position: "absolute", top: -30, left: "20%",
              width: 140, height: 140, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(124,58,237,.3), transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div style={{
            width: 56, height: 56, borderRadius: 16, flexShrink: 0,
            background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
            boxShadow: gateHov ? "0 0 36px rgba(124,58,237,.7)" : "0 0 20px rgba(124,58,237,.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "box-shadow .3s", position: "relative", zIndex: 1,
          }}>
            <GraduationCap size={28} color="white" />
          </div>
          <div style={{ position: "relative", zIndex: 1, flex: 1 }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 2 }}>GATE</p>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,.55)" }}>
              Graduate Aptitude Test in Engineering — About, Syllabus & PYQs
            </p>
          </div>
          <ArrowUpRight size={18} style={{
            color: gateHov ? "#c4b5fd" : "rgba(255,255,255,.3)",
            transform: gateHov ? "translate(2px,-2px)" : "none",
            transition: "all .25s", position: "relative", zIndex: 1, flexShrink: 0,
          }} />
        </motion.div>

        {/* ── Loading ── */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2].map(i => (
              <div key={i} style={{
                height: 60, borderRadius: 16, background: "rgba(255,255,255,.04)",
                animation: "ehPulse 1.5s infinite",
              }} />
            ))}
          </div>
        ) : (
          grouped.map((cat, ci) => {
            const CatIcon = cat.icon;
            if (cat.items.length === 0) return null;
            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + ci * 0.1, duration: 0.4, ease: [0.22,1,.36,1] }}
                style={{ marginBottom: 28 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: 7,
                    background: `rgba(${cat.glow},.15)`, border: `1px solid rgba(${cat.glow},.3)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <CatIcon size={13} style={{ color: cat.color }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.8)" }}>
                    {cat.name}
                  </span>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, rgba(${cat.glow},.2), transparent)` }} />
                </div>
                <div className="eh-grid">
                  {cat.items.map((exam, i) => (
                    <ExamCard
                      key={exam.id}
                      exam={exam}
                      color={cat.color}
                      glow={cat.glow}
                      index={i}
                      sectionDelay={0.3 + ci * 0.1}
                      onClick={() => router.push(`/exam-hub/${exam.id}`)}
                    />
                  ))}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
      <style>{`@keyframes ehPulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </AppShell>
  );
}