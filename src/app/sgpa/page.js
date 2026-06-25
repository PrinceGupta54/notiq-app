// src/app/sgpa/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import { Plus, X, Save, BookOpen, FlaskConical, Sparkles } from "lucide-react";

// ─── Logic ────────────────────────────────────────────────────
function calculateSGPA(subjects) {
  const totalCredits = subjects.reduce((s, x) => s + Number(x.credit || 0), 0);
  const totalPoints  = subjects.reduce((s, x) => s + Number(x.credit || 0) * Number(x.gradePoint || 0), 0);
  return totalCredits === 0 ? 0 : totalPoints / totalCredits;
}

let idCounter = 0;
const newRow = (type) => ({ id: idCounter++, name: "", credit: "", gradePoint: "", type });

function gradeColor(sgpa) {
  if (sgpa >= 9)   return { color: "#a78bfa", glow: "rgba(167,139,250,.35)", label: "Outstanding" };
  if (sgpa >= 8)   return { color: "#60a5fa", glow: "rgba(96,165,250,.35)",  label: "Excellent" };
  if (sgpa >= 7)   return { color: "#34d399", glow: "rgba(52,211,153,.35)",  label: "Good" };
  if (sgpa >= 6)   return { color: "#fbbf24", glow: "rgba(251,191,36,.35)",  label: "Average" };
  if (sgpa >  0)   return { color: "#f87171", glow: "rgba(248,113,113,.35)", label: "Needs Work" };
  return            { color: "#52525b",       glow: "none",                   label: "—" };
}

// ─── SGPA Ring ────────────────────────────────────────────────
function SGPARing({ sgpa }) {
  const { color, glow, label } = gradeColor(sgpa);
  const pct = (sgpa / 10) * 100;
  const r = 70, circ = 2 * Math.PI * r;

  return (
    <div style={{ position: "relative", width: 180, height: 180, margin: "0 auto" }}>
      <svg width="180" height="180" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="10" />
        <motion.circle
          cx="90" cy="90" r={r} fill="none"
          stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ}
          animate={{ strokeDashoffset: circ * (1 - pct / 100) }}
          initial={{ strokeDashoffset: circ }}
          transition={{ duration: 1.2, ease: [0.34, 1, 0.64, 1] }}
          style={{ filter: `drop-shadow(0 0 14px ${color})` }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <motion.span
          key={sgpa.toFixed(2)}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{ fontSize: 38, fontWeight: 900, color: "#fff", lineHeight: 1 }}
        >
          {sgpa.toFixed(2)}
        </motion.span>
        <span style={{ fontSize: 11, fontWeight: 600, color, marginTop: 5, letterSpacing: ".08em", textTransform: "uppercase" }}>
          {label}
        </span>
      </div>
    </div>
  );
}

// ─── Subject Table ─────────────────────────────────────────────
function SubjectTable({ title, icon: Icon, rows, type, updateSubject, removeSubjectRow, addSubjectRow, accentColor }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "rgba(255,255,255,.04)",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 20,
        padding: "20px 20px",
        marginBottom: 16,
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: `${accentColor}18`,
          border: `1px solid ${accentColor}33`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={13} style={{ color: accentColor }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "rgba(255,255,255,.4)" }}>
          {title}
        </span>
      </div>

      {/* Column headers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 28px", gap: 8, marginBottom: 8, padding: "0 2px" }}>
        {["Subject", "Credit", "Grade Pt", ""].map((h) => (
          <span key={h} style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,.25)", textTransform: "uppercase", letterSpacing: ".06em" }}>{h}</span>
        ))}
      </div>

      {/* Rows */}
      <AnimatePresence>
        {rows.map((subject, i) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12, height: 0, marginBottom: 0 }}
            transition={{ delay: i * 0.04, duration: .25 }}
            style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 28px", gap: 8, marginBottom: 8 }}
          >
            {[
              { field: "name",       placeholder: type === "theory" ? "e.g. Data Structures" : "e.g. DSA Lab", type: "text"   },
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
                style={{
                  background: "rgba(255,255,255,.05)",
                  border: "1px solid rgba(255,255,255,.1)",
                  borderRadius: 10,
                  padding: "8px 10px",
                  fontSize: 13,
                  color: "rgba(255,255,255,.88)",
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "border-color .2s, box-shadow .2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = accentColor;
                  e.target.style.boxShadow = `0 0 0 3px ${accentColor}22`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,.1)";
                  e.target.style.boxShadow = "none";
                }}
              />
            ))}
            <motion.button
              whileHover={{ scale: 1.15 }} whileTap={{ scale: .9 }}
              onClick={() => removeSubjectRow(subject.id)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(255,255,255,.18)", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "color .2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#f87171"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,.18)"}
            >
              <X size={13} />
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add row */}
      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }}
        onClick={() => addSubjectRow(type)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          marginTop: 6, padding: "6px 12px", borderRadius: 8,
          background: `${accentColor}12`,
          border: `1px dashed ${accentColor}44`,
          color: accentColor, fontSize: 12, fontWeight: 600,
          cursor: "pointer", fontFamily: "inherit",
          transition: "all .2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = `${accentColor}22`; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = `${accentColor}12`; }}
      >
        <Plus size={12} /> Add {type === "theory" ? "subject" : "practical"}
      </motion.button>
    </motion.div>
  );
}

// ─── Page ──────────────────────────────────────────────────────
export default function SgpaPage() {
  const router = useRouter();
  const [userId, setUserId]   = useState(null);
  const [semester, setSemester] = useState("Semester 1");
  const [subjects, setSubjects] = useState([
    newRow("theory"), newRow("theory"), newRow("theory"), newRow("practical"),
  ]);
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [semFocused, setSemFocused] = useState(false);

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

  const updateSubject   = (id, field, value) => setSubjects(subjects.map((s) => s.id === id ? { ...s, [field]: value } : s));
  const addSubjectRow   = (type) => setSubjects([...subjects, newRow(type)]);
  const removeSubjectRow= (id)   => setSubjects(subjects.filter((s) => s.id !== id));

  const theorySubjects    = subjects.filter((s) => s.type === "theory");
  const practicalSubjects = subjects.filter((s) => s.type === "practical");
  const sgpa = calculateSGPA(subjects);
  const { color: sgpaColor, glow: sgpaGlow } = gradeColor(sgpa);

  const handleSave = async () => {
    setSaving(true);
    const { data, error } = await supabase
      .from("sgpa_records")
      .insert({ user_id: userId, semester, sgpa: sgpa.toFixed(2), subjects: subjects.filter((s) => s.name) })
      .select().single();
    if (!error && data) { setHistory([data, ...history]); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setSaving(false);
  };

  if (loading) {
    return (
      <AppShell>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}
            style={{ fontSize: 14, color: "rgba(255,255,255,.35)" }}>
            Loading SGPA calculator…
          </motion.div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div style={{ padding: "32px 28px", maxWidth: 680, margin: "0 auto" }}>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: 26, fontWeight: 800, marginBottom: 28,
            background: "linear-gradient(135deg,#fff 0%,#c4b5fd 50%,#818cf8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}
        >
          SGPA Calculator
        </motion.h1>

        {/* Live SGPA card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }}
          style={{
            background: "rgba(255,255,255,.04)",
            border: `1px solid ${sgpa > 0 ? sgpaColor + "33" : "rgba(255,255,255,.08)"}`,
            borderRadius: 24, padding: "32px 28px", marginBottom: 20,
            backdropFilter: "blur(16px)",
            boxShadow: sgpa > 0 ? `0 0 60px ${sgpaGlow}` : "none",
            transition: "border-color .6s, box-shadow .6s",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".12em", color: "rgba(255,255,255,.3)", marginBottom: 20 }}>
            Live Preview
          </p>
          <SGPARing sgpa={sgpa} />

          {/* CGPA hint */}
          {history.length > 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .4 }}
              style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,.3)" }}>
              CGPA across {history.length + 1} sem: <span style={{ color: "rgba(255,255,255,.7)", fontWeight: 700 }}>
                {(([...history.map(h => Number(h.sgpa)), sgpa].reduce((a, b) => a + b, 0) / (history.length + 1)).toFixed(2))}
              </span>
            </motion.p>
          )}
        </motion.div>

        {/* Semester input */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12 }}
          style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "rgba(255,255,255,.3)", display: "block", marginBottom: 8 }}>
            Semester
          </label>
          <input
            type="text"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            onFocus={() => setSemFocused(true)}
            onBlur={() => setSemFocused(false)}
            style={{
              width: "100%", padding: "12px 16px",
              background: semFocused ? "rgba(124,58,237,.08)" : "rgba(255,255,255,.04)",
              border: `1px solid ${semFocused ? "rgba(124,58,237,.55)" : "rgba(255,255,255,.1)"}`,
              borderRadius: 12, fontSize: 14, color: "rgba(255,255,255,.9)",
              outline: "none", fontFamily: "inherit",
              boxShadow: semFocused ? "0 0 0 3px rgba(124,58,237,.12)" : "none",
              transition: "all .2s", boxSizing: "border-box",
            }}
          />
        </motion.div>

        {/* Tables */}
        <SubjectTable
          title="Theory Subjects" icon={BookOpen}
          rows={theorySubjects} type="theory"
          updateSubject={updateSubject}
          removeSubjectRow={removeSubjectRow}
          addSubjectRow={addSubjectRow}
          accentColor="#818cf8"
        />
        <SubjectTable
          title="Practical Subjects" icon={FlaskConical}
          rows={practicalSubjects} type="practical"
          updateSubject={updateSubject}
          removeSubjectRow={removeSubjectRow}
          addSubjectRow={addSubjectRow}
          accentColor="#34d399"
        />

        {/* Save button */}
        <motion.button
          whileHover={sgpa > 0 ? { scale: 1.02 } : {}}
          whileTap={sgpa > 0 ? { scale: .97 } : {}}
          onClick={handleSave}
          disabled={saving || sgpa === 0}
          style={{
            width: "100%", padding: "14px 0",
            background: saved
              ? "linear-gradient(135deg,#34d399,#059669)"
              : sgpa > 0
                ? "linear-gradient(135deg,#7c3aed,#5b21b6)"
                : "rgba(255,255,255,.05)",
            border: "none", borderRadius: 14,
            color: sgpa > 0 ? "#fff" : "rgba(255,255,255,.25)",
            fontSize: 14, fontWeight: 700,
            cursor: sgpa > 0 ? "pointer" : "not-allowed",
            fontFamily: "inherit",
            boxShadow: sgpa > 0 && !saved ? "0 4px 24px rgba(124,58,237,.4)" : "none",
            transition: "all .3s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            marginBottom: 32,
          }}
          onMouseEnter={(e) => { if (sgpa > 0) e.currentTarget.style.boxShadow = "0 6px 32px rgba(124,58,237,.6)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = sgpa > 0 ? "0 4px 24px rgba(124,58,237,.4)" : "none"; }}
        >
          {saved ? <><Sparkles size={15} /> Saved!</> : saving ? "Saving…" : <><Save size={15} /> Save Semester SGPA</>}
        </motion.button>

        {/* History */}
        <AnimatePresence>
          {history.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "rgba(255,255,255,.3)", marginBottom: 12 }}>
                Saved Semesters
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {history.map((record, i) => {
                  const { color } = gradeColor(Number(record.sgpa));
                  return (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        background: "rgba(255,255,255,.04)",
                        border: "1px solid rgba(255,255,255,.07)",
                        borderRadius: 14, padding: "14px 18px",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,.7)", fontWeight: 500 }}>{record.semester}</span>
                      <span style={{ fontSize: 18, fontWeight: 800, color, textShadow: `0 0 12px ${color}80` }}>
                        {record.sgpa}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}