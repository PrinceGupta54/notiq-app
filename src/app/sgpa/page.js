// src/app/sgpa/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import { Plus, X, Save, BookOpen, FlaskConical, Sparkles, Trash2 } from "lucide-react";

// ─── Logic ────────────────────────────────────────────────────
function calculateSGPA(subjects) {
  const totalCredits = subjects.reduce((s, x) => s + Number(x.credit || 0), 0);
  const totalPoints  = subjects.reduce((s, x) => s + Number(x.credit || 0) * Number(x.gradePoint || 0), 0);
  return totalCredits === 0 ? 0 : totalPoints / totalCredits;
}

let idCounter = 0;
const newRow = (type) => ({ id: idCounter++, name: "", credit: "", gradePoint: "", type });

function gradeColor(sgpa) {
  if (sgpa >= 9)  return { color: "#a78bfa", glow: "rgba(167,139,250,.35)", label: "Outstanding", rgb: "167,139,250" };
  if (sgpa >= 8)  return { color: "#60a5fa", glow: "rgba(96,165,250,.35)",  label: "Excellent",   rgb: "96,165,250"  };
  if (sgpa >= 7)  return { color: "#34d399", glow: "rgba(52,211,153,.35)",  label: "Good",         rgb: "52,211,153"  };
  if (sgpa >= 6)  return { color: "#fbbf24", glow: "rgba(251,191,36,.35)",  label: "Average",      rgb: "251,191,36"  };
  if (sgpa >  0)  return { color: "#f87171", glow: "rgba(248,113,113,.35)", label: "Needs Work",   rgb: "248,113,113" };
  return           { color: "#52525b", glow: "none", label: "—", rgb: "82,82,91" };
}

// ─── Animated Counter ─────────────────────────────────────────
function AnimCounter({ target, decimals = 2, duration = 1200 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - prog, 3);
      setVal(parseFloat((ease * target).toFixed(decimals)));
      if (prog < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, decimals, duration]);
  return <>{val.toFixed(decimals)}</>;
}

// ─── SGPA Ring ────────────────────────────────────────────────
function SGPARing({ sgpa, size = 180 }) {
  const { color, glow, label } = gradeColor(sgpa);
  const pct  = (sgpa / 10) * 100;
  const cx   = size / 2;
  const r    = size * 0.388;
  const circ = 2 * Math.PI * r;
  const sw   = size * 0.055;

  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      {/* Ambient glow halo */}
      {sgpa > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            position: "absolute", inset: -20,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      )}
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "relative", zIndex: 1 }}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={sw} />
        <motion.circle
          cx={cx} cy={cx} r={r} fill="none"
          stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ}
          animate={{ strokeDashoffset: circ * (1 - pct / 100) }}
          initial={{ strokeDashoffset: circ }}
          transition={{ duration: 1.3, ease: [0.34, 1, 0.64, 1] }}
          style={{ filter: `drop-shadow(0 0 ${size * 0.08}px ${color})` }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, zIndex: 2,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <motion.span
          key={sgpa.toFixed(2)}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{ fontSize: size * 0.21, fontWeight: 900, color: "#fff", lineHeight: 1 }}
        >
          {sgpa > 0 ? <AnimCounter target={sgpa} /> : "0.00"}
        </motion.span>
        <span style={{
          fontSize: size * 0.065, fontWeight: 600, color,
          marginTop: size * 0.03,
          letterSpacing: ".08em", textTransform: "uppercase",
          textShadow: `0 0 14px ${color}80`,
        }}>
          {label}
        </span>
      </div>
    </div>
  );
}

// ─── Subject Row (mobile-aware) ───────────────────────────────
function SubjectRow({ subject, updateSubject, removeSubjectRow, accentColor, index, isMobile }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12, height: 0, marginBottom: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
    >
      {isMobile ? (
        /* ── Mobile: stacked card per row ── */
        <div style={{
          background: "rgba(255,255,255,.03)",
          border: `1px solid rgba(255,255,255,.08)`,
          borderRadius: 12, padding: "12px 12px 10px",
          marginBottom: 10, position: "relative",
        }}>
          <input
            type="text"
            value={subject.name}
            onChange={(e) => updateSubject(subject.id, "name", e.target.value)}
            placeholder={subject.type === "theory" ? "Subject name" : "Practical name"}
            style={inputStyle(accentColor)}
            onFocus={(e) => applyFocus(e, accentColor)}
            onBlur={removeFocus}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
            <div>
              <label style={microLabel}>Credits</label>
              <input
                type="number"
                value={subject.credit}
                onChange={(e) => updateSubject(subject.id, "credit", e.target.value)}
                placeholder="3"
                style={inputStyle(accentColor)}
                onFocus={(e) => applyFocus(e, accentColor)}
                onBlur={removeFocus}
              />
            </div>
            <div>
              <label style={microLabel}>Grade Point</label>
              <input
                type="number"
                value={subject.gradePoint}
                onChange={(e) => updateSubject(subject.id, "gradePoint", e.target.value)}
                placeholder="0–10"
                min={0} max={10}
                style={inputStyle(accentColor)}
                onFocus={(e) => applyFocus(e, accentColor)}
                onBlur={removeFocus}
              />
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => removeSubjectRow(subject.id)}
            style={{
              position: "absolute", top: 10, right: 10,
              background: "rgba(248,113,113,.12)", border: "1px solid rgba(248,113,113,.2)",
              borderRadius: 7, padding: "4px 6px", cursor: "pointer",
              color: "#f87171", display: "flex", alignItems: "center",
            }}
          >
            <X size={11} />
          </motion.button>
        </div>
      ) : (
        /* ── Desktop: grid row ── */
        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 28px", gap: 8, marginBottom: 8 }}>
          {[
            { field: "name",       placeholder: subject.type === "theory" ? "e.g. Data Structures" : "e.g. DSA Lab", type: "text"   },
            { field: "credit",     placeholder: "3",    type: "number" },
            { field: "gradePoint", placeholder: "0-10", type: "number", min: 0, max: 10 },
          ].map(({ field, placeholder, type: iType, ...rest }) => (
            <input
              key={field}
              type={iType}
              value={subject[field]}
              onChange={(e) => updateSubject(subject.id, field, e.target.value)}
              placeholder={placeholder}
              {...rest}
              style={inputStyle(accentColor)}
              onFocus={(e) => applyFocus(e, accentColor)}
              onBlur={removeFocus}
            />
          ))}
          <motion.button
            whileHover={{ scale: 1.15 }} whileTap={{ scale: .9 }}
            onClick={() => removeSubjectRow(subject.id)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,.18)", display: "flex",
              alignItems: "center", justifyContent: "center",
              transition: "color .2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#f87171"}
            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,.18)"}
          >
            <X size={13} />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

// ─── Shared input helpers ─────────────────────────────────────
const inputStyle = (accent) => ({
  width: "100%",
  background: "rgba(255,255,255,.05)",
  border: "1px solid rgba(255,255,255,.1)",
  borderRadius: 10, padding: "9px 11px",
  fontSize: 13, color: "rgba(255,255,255,.88)",
  outline: "none", fontFamily: "inherit",
  transition: "border-color .2s, box-shadow .2s",
  boxSizing: "border-box",
});
const applyFocus = (e, accent) => {
  e.target.style.borderColor = accent;
  e.target.style.boxShadow = `0 0 0 3px ${accent}22`;
};
const removeFocus = (e) => {
  e.target.style.borderColor = "rgba(255,255,255,.1)";
  e.target.style.boxShadow = "none";
};
const microLabel = {
  fontSize: 9, fontWeight: 700, textTransform: "uppercase",
  letterSpacing: ".07em", color: "rgba(255,255,255,.3)",
  display: "block", marginBottom: 5,
};

// ─── Subject Table ─────────────────────────────────────────────
function SubjectTable({ title, icon: Icon, rows, type, updateSubject, removeSubjectRow, addSubjectRow, accentColor, isMobile }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        background: "rgba(255,255,255,.04)",
        border: `1px solid ${hovered ? accentColor + "33" : "rgba(255,255,255,.08)"}`,
        borderRadius: 20, padding: isMobile ? "16px 14px" : "20px 20px",
        marginBottom: 14,
        backdropFilter: "blur(12px)",
        boxShadow: hovered ? `0 8px 40px ${accentColor}18` : "none",
        transition: "border-color .3s, box-shadow .3s",
      }}
    >
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <motion.div
          animate={{ boxShadow: hovered ? `0 0 18px ${accentColor}44` : "none" }}
          transition={{ duration: 0.3 }}
          style={{
            width: 30, height: 30, borderRadius: 9,
            background: `${accentColor}18`,
            border: `1px solid ${accentColor}33`,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background .3s",
          }}
        >
          <Icon size={14} style={{ color: accentColor }} />
        </motion.div>
        <span style={{
          fontSize: 11, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: ".1em", color: "rgba(255,255,255,.4)",
        }}>
          {title}
        </span>
        <div style={{
          flex: 1, height: 1,
          background: `linear-gradient(90deg, ${accentColor}33, transparent)`,
        }} />
        <span style={{
          fontSize: 10, fontWeight: 600,
          color: accentColor,
          background: `${accentColor}15`,
          border: `1px solid ${accentColor}30`,
          borderRadius: 20, padding: "2px 9px",
        }}>
          {rows.length}
        </span>
      </div>

      {/* Column headers — desktop only */}
      {!isMobile && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 28px", gap: 8, marginBottom: 8, padding: "0 2px" }}>
          {["Subject", "Credit", "Grade Pt", ""].map((h) => (
            <span key={h} style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,.25)", textTransform: "uppercase", letterSpacing: ".06em" }}>{h}</span>
          ))}
        </div>
      )}

      {/* Rows */}
      <AnimatePresence>
        {rows.map((subject, i) => (
          <SubjectRow
            key={subject.id}
            subject={subject}
            index={i}
            updateSubject={updateSubject}
            removeSubjectRow={removeSubjectRow}
            accentColor={accentColor}
            isMobile={isMobile}
          />
        ))}
      </AnimatePresence>

      {/* Add row button */}
      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }}
        onClick={() => addSubjectRow(type)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          marginTop: isMobile ? 4 : 6, padding: "7px 13px", borderRadius: 9,
          background: `${accentColor}12`,
          border: `1px dashed ${accentColor}44`,
          color: accentColor, fontSize: 12, fontWeight: 600,
          cursor: "pointer", fontFamily: "inherit",
          transition: "all .2s",
          width: isMobile ? "100%" : "auto",
          justifyContent: isMobile ? "center" : "flex-start",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = `${accentColor}22`; e.currentTarget.style.borderColor = `${accentColor}77`; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = `${accentColor}12`; e.currentTarget.style.borderColor = `${accentColor}44`; }}
      >
        <Plus size={13} /> Add {type === "theory" ? "subject" : "practical"}
      </motion.button>
    </motion.div>
  );
}

// ─── History Record Card ──────────────────────────────────────
function HistoryCard({ record, index, onDelete }) {
  const [hov, setHov] = useState(false);
  const { color } = gradeColor(Number(record.sgpa));
  return (
    <motion.div
      key={record.id}
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ delay: index * 0.05, duration: 0.28 }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      style={{
        background: hov ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.04)",
        border: `1px solid ${hov ? color + "44" : "rgba(255,255,255,.07)"}`,
        borderRadius: 14, padding: "13px 18px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: hov ? `0 4px 22px ${color}22` : "none",
        transition: "all .25s ease",
        cursor: "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: color,
          boxShadow: `0 0 8px ${color}`,
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 13, color: "rgba(255,255,255,.7)", fontWeight: 500 }}>
          {record.semester}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{
          fontSize: 20, fontWeight: 800, color,
          textShadow: `0 0 14px ${color}80`,
        }}>
          {record.sgpa}
        </span>
        {onDelete && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: hov ? 1 : 0 }}
            whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(record.id)}
            style={{
              background: "rgba(248,113,113,.1)", border: "1px solid rgba(248,113,113,.2)",
              borderRadius: 7, padding: "4px 6px",
              cursor: "pointer", color: "#f87171",
              display: "flex", alignItems: "center",
            }}
          >
            <Trash2 size={12} />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Page ──────────────────────────────────────────────────────
export default function SgpaPage() {
  const router = useRouter();
  const [userId,     setUserId]     = useState(null);
  const [semester,   setSemester]   = useState("Semester 1");
  const [subjects,   setSubjects]   = useState([
    newRow("theory"), newRow("theory"), newRow("theory"), newRow("practical"),
  ]);
  const [history,    setHistory]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [semFocused, setSemFocused] = useState(false);
  const [isMobile,   setIsMobile]   = useState(false);
  const [ringSize,   setRingSize]   = useState(180);

  // Responsive detection
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setIsMobile(w < 640);
      setRingSize(w < 400 ? 140 : w < 640 ? 160 : 180);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setUserId(session.user.id);
      const { data } = await supabase
        .from("sgpa_records").select("*").eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      setHistory(data || []);
      setLoading(false);
    };
    load();
  }, [router]);

  const updateSubject    = (id, field, value) => setSubjects(subjects.map((s) => s.id === id ? { ...s, [field]: value } : s));
  const addSubjectRow    = (type) => setSubjects([...subjects, newRow(type)]);
  const removeSubjectRow = (id)   => setSubjects(subjects.filter((s) => s.id !== id));
  const deleteHistory    = (id)   => setHistory(history.filter((h) => h.id !== id));

  const theorySubjects    = subjects.filter((s) => s.type === "theory");
  const practicalSubjects = subjects.filter((s) => s.type === "practical");
  const sgpa = calculateSGPA(subjects);
  const { color: sgpaColor, glow: sgpaGlow, rgb: sgpaRgb } = gradeColor(sgpa);

  const cgpa = history.length > 0
    ? ([...history.map(h => Number(h.sgpa)), sgpa].reduce((a, b) => a + b, 0) / (history.length + 1)).toFixed(2)
    : null;

  const handleSave = async () => {
    setSaving(true);
    const { data, error } = await supabase
      .from("sgpa_records")
      .insert({ user_id: userId, semester, sgpa: sgpa.toFixed(2), subjects: subjects.filter((s) => s.name) })
      .select().single();
    if (!error && data) {
      setHistory([data, ...history]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <AppShell>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ fontSize: 14, color: "rgba(255,255,255,.35)", textAlign: "center" }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              border: "3px solid rgba(124,58,237,.2)",
              borderTopColor: "#7c3aed",
              animation: "spin 1s linear infinite",
              margin: "0 auto 14px",
            }} />
            Loading SGPA calculator…
          </motion.div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* ── Ambient background orbs ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.07, 0.13, 0.07] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", top: "-15%", left: "-10%",
            width: 500, height: 500, borderRadius: "50%",
            background: "radial-gradient(circle, #7c3aed, transparent 70%)",
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.06, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          style={{
            position: "absolute", bottom: "-20%", right: "-10%",
            width: 400, height: 400, borderRadius: "50%",
            background: "radial-gradient(circle, #818cf8, transparent 70%)",
          }}
        />
      </div>

      <div style={{
        padding: isMobile ? "24px 16px 60px" : "32px 28px 60px",
        maxWidth: 680, margin: "0 auto",
        position: "relative", zIndex: 1,
      }}>

        {/* ── Heading ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 28 }}
        >
          <h1 style={{
            fontSize: isMobile ? 22 : 26,
            fontWeight: 800, marginBottom: 4,
            background: "linear-gradient(135deg,#fff 0%,#c4b5fd 50%,#818cf8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            SGPA Calculator
          </h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>
            Enter your subjects, credits & grade points for a live result
          </p>
        </motion.div>

        {/* ── Live SGPA card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: "rgba(255,255,255,.04)",
            border: `1px solid ${sgpa > 0 ? sgpaColor + "44" : "rgba(255,255,255,.08)"}`,
            borderRadius: 24, padding: isMobile ? "24px 16px" : "32px 28px",
            marginBottom: 18,
            backdropFilter: "blur(16px)",
            boxShadow: sgpa > 0 ? `0 0 80px ${sgpaGlow}, 0 0 0 1px ${sgpaColor}22` : "0 4px 24px rgba(0,0,0,.3)",
            transition: "border-color .6s, box-shadow .6s",
            textAlign: "center",
            position: "relative", overflow: "hidden",
          }}
        >
          {/* Subtle top shimmer line */}
          <motion.div
            animate={{ opacity: sgpa > 0 ? [0.4, 0.9, 0.4] : 0 }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{
              position: "absolute", top: 0, left: "20%", right: "20%", height: 1,
              background: `linear-gradient(90deg, transparent, ${sgpaColor}, transparent)`,
              borderRadius: 1,
            }}
          />

          <p style={{
            fontSize: 10, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: ".14em", color: "rgba(255,255,255,.28)", marginBottom: 20,
          }}>
            Live Preview
          </p>

          <SGPARing sgpa={sgpa} size={ringSize} />

          {/* Stats row below ring */}
          {sgpa > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                display: "flex",
                justifyContent: "center",
                gap: isMobile ? 12 : 24,
                marginTop: 22,
                flexWrap: "wrap",
              }}
            >
              {[
                { label: "Theory Subjects",    val: theorySubjects.length },
                { label: "Practicals",         val: practicalSubjects.length },
                { label: "Total Credits",      val: subjects.reduce((s, x) => s + Number(x.credit || 0), 0) },
              ].map((stat) => (
                <div key={stat.label} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: isMobile ? 17 : 20, fontWeight: 800, color: "#fff" }}>{stat.val}</p>
                  <p style={{ fontSize: 9.5, color: "rgba(255,255,255,.3)", fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase" }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          )}

          {/* CGPA hint */}
          {cgpa && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                marginTop: 16, display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(124,58,237,.12)", border: "1px solid rgba(124,58,237,.25)",
                borderRadius: 20, padding: "5px 14px",
              }}
            >
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.45)" }}>
                CGPA across {history.length + 1} sems
              </span>
              <span style={{ fontSize: 13, color: "#c4b5fd", fontWeight: 800 }}>{cgpa}</span>
            </motion.div>
          )}
        </motion.div>

        {/* ── Semester input ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.4 }}
          style={{ marginBottom: 14 }}
        >
          <label style={{
            fontSize: 10, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: ".1em", color: "rgba(255,255,255,.3)",
            display: "block", marginBottom: 8,
          }}>
            Semester Label
          </label>
          <input
            type="text"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            onFocus={() => setSemFocused(true)}
            onBlur={() => setSemFocused(false)}
            placeholder="e.g. Semester 3"
            style={{
              width: "100%", padding: isMobile ? "11px 14px" : "12px 16px",
              background: semFocused ? "rgba(124,58,237,.08)" : "rgba(255,255,255,.04)",
              border: `1px solid ${semFocused ? "rgba(124,58,237,.55)" : "rgba(255,255,255,.1)"}`,
              borderRadius: 12, fontSize: 14, color: "rgba(255,255,255,.9)",
              outline: "none", fontFamily: "inherit",
              boxShadow: semFocused ? "0 0 0 3px rgba(124,58,237,.12)" : "none",
              transition: "all .2s", boxSizing: "border-box",
            }}
          />
        </motion.div>

        {/* ── Subject Tables ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <SubjectTable
            title="Theory Subjects" icon={BookOpen}
            rows={theorySubjects} type="theory"
            updateSubject={updateSubject}
            removeSubjectRow={removeSubjectRow}
            addSubjectRow={addSubjectRow}
            accentColor="#818cf8"
            isMobile={isMobile}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
          <SubjectTable
            title="Practical Subjects" icon={FlaskConical}
            rows={practicalSubjects} type="practical"
            updateSubject={updateSubject}
            removeSubjectRow={removeSubjectRow}
            addSubjectRow={addSubjectRow}
            accentColor="#34d399"
            isMobile={isMobile}
          />
        </motion.div>

        {/* ── Save button ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
          style={{ marginBottom: 32 }}
        >
          <motion.button
            whileHover={sgpa > 0 ? { scale: 1.02 } : {}}
            whileTap={sgpa > 0 ? { scale: .97 } : {}}
            onClick={handleSave}
            disabled={saving || sgpa === 0}
            style={{
              width: "100%", padding: isMobile ? "13px 0" : "15px 0",
              background: saved
                ? "linear-gradient(135deg,#34d399,#059669)"
                : sgpa > 0
                  ? "linear-gradient(135deg,#7c3aed,#5b21b6)"
                  : "rgba(255,255,255,.05)",
              border: saved ? "1px solid rgba(52,211,153,.4)" : sgpa > 0 ? "1px solid rgba(124,58,237,.4)" : "1px solid rgba(255,255,255,.07)",
              borderRadius: 14,
              color: sgpa > 0 ? "#fff" : "rgba(255,255,255,.2)",
              fontSize: 14, fontWeight: 700,
              cursor: sgpa > 0 ? "pointer" : "not-allowed",
              fontFamily: "inherit",
              boxShadow: sgpa > 0 && !saved ? "0 4px 28px rgba(124,58,237,.45)" : saved ? "0 4px 28px rgba(52,211,153,.4)" : "none",
              transition: "all .3s cubic-bezier(.34,1.2,.64,1)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
            onMouseEnter={(e) => {
              if (sgpa > 0 && !saving) e.currentTarget.style.boxShadow = "0 8px 36px rgba(124,58,237,.65)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = sgpa > 0 ? "0 4px 28px rgba(124,58,237,.45)" : "none";
            }}
          >
            <AnimatePresence mode="wait">
              {saved ? (
                <motion.span key="saved" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <Sparkles size={15} /> Saved successfully!
                </motion.span>
              ) : saving ? (
                <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff",
                    animation: "spin .7s linear infinite",
                  }} />
                  Saving…
                </motion.span>
              ) : (
                <motion.span key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <Save size={15} /> Save Semester SGPA
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>

        {/* ── History ── */}
        <AnimatePresence>
          {history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <p style={{
                  fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: ".12em", color: "rgba(255,255,255,.3)",
                }}>
                  Saved Semesters
                </p>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.07)" }} />
                <span style={{
                  fontSize: 10, fontWeight: 600, color: "#a78bfa",
                  background: "rgba(124,58,237,.12)", border: "1px solid rgba(124,58,237,.25)",
                  borderRadius: 20, padding: "2px 9px",
                }}>
                  {history.length}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <AnimatePresence>
                  {history.map((record, i) => (
                    <HistoryCard
                      key={record.id}
                      record={record}
                      index={i}
                      onDelete={deleteHistory}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </AppShell>
  );
}