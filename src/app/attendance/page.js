// src/app/attendance/page.js
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import { Plus, Trash2, CheckCircle2, XCircle } from "lucide-react";

const REQUIRED = 0.75;

function getRing(total, attended) {
  if (total === 0) return { pct: 0, message: "No classes logged yet", color: "#52525b", safe: null };
  const pct = (attended / total) * 100;
  if (pct >= 75) {
    const canBunk = Math.floor(attended / REQUIRED - total);
    return { pct, message: canBunk > 0 ? `You can bunk ${canBunk} more class${canBunk > 1 ? "es" : ""}` : "Right at the edge — don't miss more", color: "#86efac", safe: true };
  }
  const needed = Math.ceil(3 * total - 4 * attended);
  return { pct, message: `Attend ${needed} more class${needed !== 1 ? "es" : ""} in a row to reach 75%`, color: "#fda4af", safe: false };
}

function Ring({ pct, color }) {
  const r = 52, circ = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: 130, height: 130, flexShrink: 0 }}>
      <svg width="130" height="130" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="8" />
        <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct / 100)}
          style={{ transition: "all 1s cubic-bezier(.34,1,.64,1)", filter: `drop-shadow(0 0 10px ${color})` }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{pct.toFixed(1)}%</span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginTop: 2 }}>overall</span>
      </div>
    </div>
  );
}

export default function AttendancePage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setUserId(session.user.id);
      const { data } = await supabase.from("subjects")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: true });
      setSubjects(data || []);
      setLoading(false);
    };
    load();
  }, [router]);

  const addSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    const { data, error } = await supabase.from("subjects")
      .insert({ name: newSubject.trim(), user_id: userId, total_classes: 0, attended_classes: 0 })
      .select()
      .single();
    if (!error && data) { setSubjects([...subjects, data]); setNewSubject(""); }
  };

  const mark = async (subject, present) => {
    const updated = { total_classes: subject.total_classes + 1, attended_classes: subject.attended_classes + (present ? 1 : 0) };
    setSubjects(subjects.map(s => s.id === subject.id ? { ...s, ...updated } : s));
    await supabase.from("subjects").update(updated).eq("id", subject.id);
  };

  const del = async (id) => {
    setSubjects(subjects.filter(s => s.id !== id));
    await supabase.from("subjects").delete().eq("id", id);
  };

  const totalC = subjects.reduce((s, x) => s + x.total_classes, 0);
  const attendedC = subjects.reduce((s, x) => s + x.attended_classes, 0);
  const overall = getRing(totalC, attendedC);

  return (
    <AppShell>
      <div style={{ padding: "32px 28px", maxWidth: 860, margin: "0 auto" }}>
        
        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: 26, fontWeight: 800, marginBottom: 28,
            background: "linear-gradient(135deg,#fff 0%,#c4b5fd 50%,#818cf8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
        >
          Attendance Tracker
        </motion.h1>

        {/* Overall card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }}
          style={{
            background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 20, padding: "28px 28px", marginBottom: 20,
            backdropFilter: "blur(12px)",
            boxShadow: overall.safe === null ? "none" : overall.safe
              ? "0 0 40px rgba(134,239,172,.07)" : "0 0 40px rgba(253,164,175,.07)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <Ring pct={overall.pct} color={overall.color} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginBottom: 8, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".08em" }}>
                Overall attendance
              </p>
              <p style={{ fontSize: 36, fontWeight: 800, color: "#fff", lineHeight: 1, marginBottom: 10 }}>
                {overall.pct.toFixed(1)}%
              </p>
              <motion.div
                animate={overall.safe === false ? { opacity: [1, .6, 1] } : { opacity: 1 }}
                transition={{ duration: 2, repeat: overall.safe === false ? Infinity : 0 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "7px 14px", borderRadius: 30,
                  background: overall.safe === null ? "rgba(255,255,255,.06)"
                    : overall.safe ? "rgba(134,239,172,.12)" : "rgba(253,164,175,.12)",
                  border: `1px solid ${overall.safe === null ? "rgba(255,255,255,.1)"
                    : overall.safe ? "rgba(134,239,172,.3)" : "rgba(253,164,175,.3)"}`,
                  boxShadow: overall.safe === true ? "0 0 14px rgba(134,239,172,.15)"
                    : overall.safe === false ? "0 0 14px rgba(253,164,175,.15)" : "none",
                }}
              >
                {overall.safe === true && <CheckCircle2 size={13} style={{ color: "#86efac" }} />}
                {overall.safe === false && <XCircle size={13} style={{ color: "#fda4af" }} />}
                <span style={{ fontSize: 12, fontWeight: 600, color: overall.color }}>
                  {overall.message}
                </span>
              </motion.div>
              <div style={{ marginTop: 16, height: 5, background: "rgba(255,255,255,.06)", borderRadius: 3, overflow: "hidden", maxWidth: 280 }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(overall.pct, 100)}%` }}
                  transition={{ duration: 1, ease: [0.22, 1, .36, 1], delay: .3 }}
                  style={{
                    height: "100%", borderRadius: 3,
                    background: overall.safe ? "linear-gradient(90deg,#86efac,#34d399)" : "linear-gradient(90deg,#fda4af,#fb7185)",
                    boxShadow: overall.safe ? "0 0 10px rgba(134,239,172,.5)" : "0 0 10px rgba(253,164,175,.5)",
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Add subject */}
        <motion.form
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .14 }}
          onSubmit={addSubject}
          style={{ display: "flex", gap: 10, marginBottom: 20 }}
        >
          <input
            value={newSubject} onChange={e => setNewSubject(e.target.value)}
            placeholder="Add a subject (e.g. Data Structures)"
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={{
              flex: 1, padding: "12px 16px",
              background: focused ? "rgba(124,58,237,.08)" : "rgba(255,255,255,.04)",
              border: `1px solid ${focused ? "rgba(124,58,237,.55)" : "rgba(255,255,255,.1)"}`,
              borderRadius: 12, fontSize: 14, color: "rgba(255,255,255,.9)",
              outline: "none", fontFamily: "inherit",
              boxShadow: focused ? "0 0 0 3px rgba(124,58,237,.12)" : "none",
              transition: "all .2s",
            }}
          />
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: .95 }} type="submit"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "12px 20px", borderRadius: 12,
              background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
              border: "none", color: "#fff", fontSize: 13, fontWeight: 700,
              cursor: "pointer", boxShadow: "0 4px 16px rgba(124,58,237,.4)",
              fontFamily: "inherit", transition: "box-shadow .2s",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 22px rgba(124,58,237,.6)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(124,58,237,.4)"}
          >
            <Plus size={16} /> Add
          </motion.button>
        </motion.form>

        {/* Subject cards */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 80, borderRadius: 16, background: "rgba(255,255,255,.04)", animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,.2)", fontSize: 14 }}>
            No subjects yet — add one above to start tracking
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <AnimatePresence>
              {subjects.map((sub, i) => {
                const pct = sub.total_classes === 0 ? 0 : (sub.attended_classes / sub.total_classes) * 100;
                const safe = sub.total_classes > 0 && pct >= 75;
                const danger = sub.total_classes > 0 && pct < 75;
                return (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16, height: 0 }}
                    transition={{ delay: i * 0.06, duration: .3, ease: [0.22, 1, .36, 1] }}
                    style={{
                      background: "rgba(255,255,255,.04)",
                      border: `1px solid ${safe ? "rgba(134,239,172,.18)" : danger ? "rgba(253,164,175,.18)" : "rgba(255,255,255,.08)"}`,
                      borderRadius: 16, padding: "16px 18px",
                      display: "flex", alignItems: "center", gap: 16,
                      transition: "all .25s",
                    }}
                  >
                    {/* Mini ring */}
                    <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
                      <svg width="48" height="48" style={{ transform: "rotate(-90deg)" }}>
                        <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="4" />
                        <circle cx="24" cy="24" r="18" fill="none"
                          stroke={safe ? "#86efac" : danger ? "#fda4af" : "#52525b"}
                          strokeWidth="4" strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 18}
                          strokeDashoffset={2 * Math.PI * 18 * (1 - pct / 100)}
                          style={{
                            transition: "all .8s cubic-bezier(.34,1,.64,1)",
                            filter: `drop-shadow(0 0 5px ${safe ? "#86efac" : danger ? "#fda4af" : "#52525b"})`,
                          }}
                        />
                      </svg>
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>{pct.toFixed(0)}%</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,.88)", marginBottom: 3 }}>{sub.name}</p>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,.35)" }}>
                        {sub.attended_classes} / {sub.total_classes} classes
                      </p>
                    </div>

                    {/* Present */}
                    <motion.button
                      whileHover={{ scale: 1.06 }} whileTap={{ scale: .93 }}
                      onClick={() => mark(sub, true)}
                      style={{
                        padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                        background: "rgba(134,239,172,.1)", border: "1px solid rgba(134,239,172,.25)",
                        color: "#86efac", cursor: "pointer", fontFamily: "inherit",
                        transition: "all .2s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(134,239,172,.2)"; e.currentTarget.style.boxShadow = "0 0 16px rgba(134,239,172,.2)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(134,239,172,.1)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      Present
                    </motion.button>

                    {/* Absent */}
                    <motion.button
                      whileHover={{ scale: 1.06 }} whileTap={{ scale: .93 }}
                      onClick={() => mark(sub, false)}
                      style={{
                        padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                        background: "rgba(253,164,175,.1)", border: "1px solid rgba(253,164,175,.25)",
                        color: "#fda4af", cursor: "pointer", fontFamily: "inherit",
                        transition: "all .2s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(253,164,175,.2)"; e.currentTarget.style.boxShadow = "0 0 16px rgba(253,164,175,.2)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(253,164,175,.1)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      Absent
                    </motion.button>

                    {/* Delete */}
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: .9 }}
                      onClick={() => del(sub.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "rgba(255,255,255,.2)", transition: "color .2s" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#f87171"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.2)"}
                    >
                      <Trash2 size={15} />
                    </motion.button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </AppShell>
  );
}