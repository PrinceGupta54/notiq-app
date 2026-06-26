// src/app/attendance/page.js
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import { Plus, Trash2, CheckCircle2, XCircle, TrendingUp, BookOpen } from "lucide-react";

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

// ── Big overall ring ──────────────────────────────────────────
function Ring({ pct, color, size = 130 }) {
  const cx   = size / 2;
  const r    = size * 0.4;
  const circ = 2 * Math.PI * r;
  const sw   = size * 0.062;
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let start = null;
    const animate = (ts) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / 1000, 1);
      const ease = 1 - Math.pow(1 - prog, 3);
      setDisplayed(parseFloat((ease * pct).toFixed(1)));
      if (prog < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [pct]);

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {/* Glow halo */}
      {pct > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          style={{
            position: "absolute", inset: -14, borderRadius: "50%",
            background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
      )}
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "relative", zIndex: 1 }}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={sw} />
        <motion.circle
          cx={cx} cy={cx} r={r} fill="none"
          stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ}
          animate={{ strokeDashoffset: circ * (1 - pct / 100) }}
          initial={{ strokeDashoffset: circ }}
          transition={{ duration: 1.1, ease: [0.34, 1, 0.64, 1] }}
          style={{ filter: `drop-shadow(0 0 ${sw * 1.4}px ${color})` }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, zIndex: 2,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: size * 0.185, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
          {displayed}%
        </span>
        <span style={{ fontSize: size * 0.08, color: "rgba(255,255,255,.3)", marginTop: size * 0.02 }}>
          overall
        </span>
      </div>
    </div>
  );
}

// ── Mini ring per subject ─────────────────────────────────────
function MiniRing({ pct, color, size = 48 }) {
  const cx   = size / 2;
  const r    = size * 0.375;
  const circ = 2 * Math.PI * r;
  const sw   = size * 0.085;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={sw} />
        <circle cx={cx} cy={cx} r={r} fill="none"
          stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct / 100)}
          style={{
            transition: "all .8s cubic-bezier(.34,1,.64,1)",
            filter: `drop-shadow(0 0 ${sw * 1.2}px ${color})`,
          }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size * 0.19, fontWeight: 700, color: "#fff" }}>
          {pct.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

// ── Subject card ──────────────────────────────────────────────
function SubjectCard({ sub, index, onMark, onDelete, isMobile }) {
  const [hov, setHov]         = useState(false);
  const [pressing, setPressing] = useState(null); // "present"|"absent"

  const pct    = sub.total_classes === 0 ? 0 : (sub.attended_classes / sub.total_classes) * 100;
  const safe   = sub.total_classes > 0 && pct >= 75;
  const danger = sub.total_classes > 0 && pct < 75;
  const color  = safe ? "#86efac" : danger ? "#fda4af" : "#71717a";
  const { message } = getRing(sub.total_classes, sub.attended_classes);

  const borderColor = hov
    ? (safe ? "rgba(134,239,172,.4)" : danger ? "rgba(253,164,175,.4)" : "rgba(167,139,250,.3)")
    : (safe ? "rgba(134,239,172,.15)" : danger ? "rgba(253,164,175,.15)" : "rgba(255,255,255,.08)");

  return (
    <motion.div
      key={sub.id}
      initial={{ opacity: 0, x: -18, y: 6 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 18, height: 0, marginBottom: 0 }}
      transition={{ delay: index * 0.055, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      style={{
        background: hov ? "rgba(255,255,255,.055)" : "rgba(255,255,255,.04)",
        border: `1px solid ${borderColor}`,
        borderRadius: 18,
        padding: isMobile ? "14px 14px" : "16px 18px",
        boxShadow: hov
          ? safe   ? "0 8px 32px rgba(134,239,172,.12)"
          : danger ? "0 8px 32px rgba(253,164,175,.12)"
          :          "0 8px 32px rgba(124,58,237,.10)"
          : "0 2px 10px rgba(0,0,0,.2)",
        transition: "all .28s cubic-bezier(.34,1.2,.64,1)",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Top shimmer accent line */}
      <motion.div
        animate={{ opacity: hov ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: "absolute", top: 0, left: "15%", right: "15%", height: 1,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          borderRadius: 1, pointerEvents: "none",
        }}
      />

      {isMobile ? (
        /* ── Mobile layout ── */
        <div>
          {/* Top row: ring + name + delete */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <MiniRing pct={pct} color={color} size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,.9)", marginBottom: 2 }}>
                {sub.name}
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>
                {sub.attended_classes}/{sub.total_classes} classes
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(sub.id)}
              style={{ background: "rgba(248,113,113,.1)", border: "1px solid rgba(248,113,113,.18)", borderRadius: 8, padding: "5px 7px", cursor: "pointer", color: "#f87171", display: "flex" }}
            >
              <Trash2 size={13} />
            </motion.button>
          </div>

          {/* Message */}
          <p style={{ fontSize: 11, color, fontWeight: 600, marginBottom: 10, paddingLeft: 2 }}>
            {message}
          </p>

          {/* Progress bar */}
          <div style={{ height: 3, background: "rgba(255,255,255,.06)", borderRadius: 2, overflow: "hidden", marginBottom: 12 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(pct, 100)}%` }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              style={{
                height: "100%", borderRadius: 2,
                background: safe ? "linear-gradient(90deg,#86efac,#34d399)" : "linear-gradient(90deg,#fda4af,#fb7185)",
                boxShadow: safe ? "0 0 8px rgba(134,239,172,.5)" : "0 0 8px rgba(253,164,175,.5)",
              }}
            />
          </div>

          {/* Buttons row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onMouseDown={() => setPressing("present")}
              onMouseUp={() => setPressing(null)}
              onClick={() => onMark(sub, true)}
              style={{
                padding: "10px 0", borderRadius: 11, fontSize: 12, fontWeight: 700,
                background: pressing === "present" ? "rgba(134,239,172,.28)" : "rgba(134,239,172,.1)",
                border: "1px solid rgba(134,239,172,.3)",
                color: "#86efac", cursor: "pointer", fontFamily: "inherit",
                transition: "all .15s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              }}
            >
              <CheckCircle2 size={13} /> Present
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onMouseDown={() => setPressing("absent")}
              onMouseUp={() => setPressing(null)}
              onClick={() => onMark(sub, false)}
              style={{
                padding: "10px 0", borderRadius: 11, fontSize: 12, fontWeight: 700,
                background: pressing === "absent" ? "rgba(253,164,175,.28)" : "rgba(253,164,175,.1)",
                border: "1px solid rgba(253,164,175,.3)",
                color: "#fda4af", cursor: "pointer", fontFamily: "inherit",
                transition: "all .15s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              }}
            >
              <XCircle size={13} /> Absent
            </motion.button>
          </div>
        </div>
      ) : (
        /* ── Desktop layout ── */
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <MiniRing pct={pct} color={color} size={52} />

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,.9)", marginBottom: 3 }}>
              {sub.name}
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginBottom: 6 }}>
              {sub.attended_classes} / {sub.total_classes} classes
            </p>
            {/* Progress bar */}
            <div style={{ height: 3, background: "rgba(255,255,255,.06)", borderRadius: 2, overflow: "hidden", maxWidth: 200 }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(pct, 100)}%` }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
                style={{
                  height: "100%", borderRadius: 2,
                  background: safe ? "linear-gradient(90deg,#86efac,#34d399)" : "linear-gradient(90deg,#fda4af,#fb7185)",
                  boxShadow: safe ? "0 0 8px rgba(134,239,172,.5)" : "0 0 8px rgba(253,164,175,.5)",
                }}
              />
            </div>
          </div>

          {/* Status badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "5px 12px", borderRadius: 20,
            background: safe ? "rgba(134,239,172,.1)" : danger ? "rgba(253,164,175,.1)" : "rgba(255,255,255,.05)",
            border: `1px solid ${safe ? "rgba(134,239,172,.25)" : danger ? "rgba(253,164,175,.25)" : "rgba(255,255,255,.08)"}`,
            flexShrink: 0, maxWidth: 220,
          }}>
            {safe   && <CheckCircle2 size={11} style={{ color: "#86efac", flexShrink: 0 }} />}
            {danger && <XCircle      size={11} style={{ color: "#fda4af", flexShrink: 0 }} />}
            <span style={{ fontSize: 11, fontWeight: 600, color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {message}
            </span>
          </div>

          {/* Present */}
          <motion.button
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.93 }}
            onClick={() => onMark(sub, true)}
            style={{
              padding: "9px 18px", borderRadius: 11, fontSize: 12, fontWeight: 700,
              background: "rgba(134,239,172,.1)", border: "1px solid rgba(134,239,172,.25)",
              color: "#86efac", cursor: "pointer", fontFamily: "inherit",
              transition: "all .2s", display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(134,239,172,.2)"; e.currentTarget.style.boxShadow = "0 0 18px rgba(134,239,172,.22)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(134,239,172,.1)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <CheckCircle2 size={13} /> Present
          </motion.button>

          {/* Absent */}
          <motion.button
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.93 }}
            onClick={() => onMark(sub, false)}
            style={{
              padding: "9px 18px", borderRadius: 11, fontSize: 12, fontWeight: 700,
              background: "rgba(253,164,175,.1)", border: "1px solid rgba(253,164,175,.25)",
              color: "#fda4af", cursor: "pointer", fontFamily: "inherit",
              transition: "all .2s", display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(253,164,175,.2)"; e.currentTarget.style.boxShadow = "0 0 18px rgba(253,164,175,.22)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(253,164,175,.1)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <XCircle size={13} /> Absent
          </motion.button>

          {/* Delete */}
          <motion.button
            whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(sub.id)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "rgba(255,255,255,.2)", transition: "color .2s", flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = "#f87171"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.2)"}
          >
            <Trash2 size={15} />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────
function Skeleton({ isMobile }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {[1, 2, 3].map(i => (
        <motion.div
          key={i}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}
          style={{
            height: isMobile ? 140 : 84,
            borderRadius: 18,
            background: "rgba(255,255,255,.04)",
            border: "1px solid rgba(255,255,255,.07)",
          }}
        />
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function AttendancePage() {
  const router = useRouter();
  const [subjects,   setSubjects]   = useState([]);
  const [newSubject, setNewSubject] = useState("");
  const [loading,    setLoading]    = useState(true);
  const [userId,     setUserId]     = useState(null);
  const [focused,    setFocused]    = useState(false);
  const [isMobile,   setIsMobile]   = useState(false);
  const [ringSize,   setRingSize]   = useState(130);

  // Responsive detection
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setIsMobile(w < 640);
      setRingSize(w < 380 ? 100 : w < 640 ? 116 : 130);
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
      const { data } = await supabase.from("subjects")
        .select("*").eq("user_id", session.user.id)
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
      .select().single();
    if (!error && data) { setSubjects([...subjects, data]); setNewSubject(""); }
  };

  const mark = async (subject, present) => {
    const updated = {
      total_classes: subject.total_classes + 1,
      attended_classes: subject.attended_classes + (present ? 1 : 0),
    };
    setSubjects(subjects.map(s => s.id === subject.id ? { ...s, ...updated } : s));
    await supabase.from("subjects").update(updated).eq("id", subject.id);
  };

  const del = async (id) => {
    setSubjects(subjects.filter(s => s.id !== id));
    await supabase.from("subjects").delete().eq("id", id);
  };

  const totalC    = subjects.reduce((s, x) => s + x.total_classes, 0);
  const attendedC = subjects.reduce((s, x) => s + x.attended_classes, 0);
  const overall   = getRing(totalC, attendedC);

  // Summary stats
  const safeCount   = subjects.filter(s => s.total_classes > 0 && (s.attended_classes / s.total_classes) >= 0.75).length;
  const dangerCount = subjects.filter(s => s.total_classes > 0 && (s.attended_classes / s.total_classes) < 0.75).length;

  return (
    <AppShell>
      {/* Ambient bg orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.06, 0.12, 0.06] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", top: "-20%", left: "-10%",
            width: 550, height: 550, borderRadius: "50%",
            background: "radial-gradient(circle, #7c3aed, transparent 70%)",
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.06, 1], opacity: [0.04, 0.08, 0.04] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          style={{
            position: "absolute", bottom: "-20%", right: "-10%",
            width: 450, height: 450, borderRadius: "50%",
            background: "radial-gradient(circle, #86efac, transparent 70%)",
          }}
        />
      </div>

      <div style={{
        padding: isMobile ? "24px 14px 70px" : "32px 28px 60px",
        maxWidth: 860, margin: "0 auto",
        position: "relative", zIndex: 1,
      }}>

        {/* ── Heading ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 26 }}
        >
          <h1 style={{
            fontSize: isMobile ? 22 : 26, fontWeight: 800, marginBottom: 4,
            background: "linear-gradient(135deg,#fff 0%,#c4b5fd 50%,#818cf8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Attendance Tracker
          </h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>
            Track your class attendance and stay above 75%
          </p>
        </motion.div>

        {/* ── Overall card ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: "rgba(255,255,255,.04)",
            border: `1px solid ${
              overall.safe === null ? "rgba(255,255,255,.08)"
              : overall.safe ? "rgba(134,239,172,.22)" : "rgba(253,164,175,.22)"
            }`,
            borderRadius: 22, padding: isMobile ? "20px 16px" : "28px 28px",
            marginBottom: 16,
            backdropFilter: "blur(14px)",
            boxShadow: overall.safe === null ? "none"
              : overall.safe ? "0 0 50px rgba(134,239,172,.08)" : "0 0 50px rgba(253,164,175,.08)",
            position: "relative", overflow: "hidden",
            transition: "border-color .5s, box-shadow .5s",
          }}
        >
          {/* Shimmer top line */}
          <motion.div
            animate={{ opacity: overall.pct > 0 ? [0.3, 0.8, 0.3] : 0 }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{
              position: "absolute", top: 0, left: "20%", right: "20%", height: 1,
              background: `linear-gradient(90deg, transparent, ${overall.color}, transparent)`,
              pointerEvents: "none",
            }}
          />

          <div style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "center" : "center",
            gap: isMobile ? 18 : 32,
          }}>
            <Ring pct={overall.pct} color={overall.color} size={ringSize} />

            <div style={{ flex: 1, textAlign: isMobile ? "center" : "left" }}>
              <p style={{
                fontSize: 11, color: "rgba(255,255,255,.35)", marginBottom: 6,
                fontWeight: 600, textTransform: "uppercase", letterSpacing: ".1em",
              }}>
                Overall Attendance
              </p>
              <p style={{ fontSize: isMobile ? 30 : 38, fontWeight: 800, color: "#fff", lineHeight: 1, marginBottom: 12 }}>
                {overall.pct.toFixed(1)}%
              </p>

              {/* Status badge */}
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
                  boxShadow: overall.safe === true ? "0 0 16px rgba(134,239,172,.15)"
                    : overall.safe === false ? "0 0 16px rgba(253,164,175,.15)" : "none",
                  marginBottom: 14,
                }}
              >
                {overall.safe === true  && <CheckCircle2 size={13} style={{ color: "#86efac" }} />}
                {overall.safe === false && <XCircle      size={13} style={{ color: "#fda4af" }} />}
                <span style={{ fontSize: 12, fontWeight: 600, color: overall.color }}>
                  {overall.message}
                </span>
              </motion.div>

              {/* Progress bar */}
              <div style={{
                height: 5, background: "rgba(255,255,255,.06)", borderRadius: 3, overflow: "hidden",
                maxWidth: isMobile ? "100%" : 280,
                margin: isMobile ? "0 auto" : "0",
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(overall.pct, 100)}%` }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                  style={{
                    height: "100%", borderRadius: 3,
                    background: overall.safe
                      ? "linear-gradient(90deg,#86efac,#34d399)"
                      : "linear-gradient(90deg,#fda4af,#fb7185)",
                    boxShadow: overall.safe
                      ? "0 0 10px rgba(134,239,172,.5)"
                      : "0 0 10px rgba(253,164,175,.5)",
                  }}
                />
              </div>

              {/* Mini stats row */}
              {subjects.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  style={{
                    display: "flex", gap: isMobile ? 12 : 20, marginTop: 14,
                    justifyContent: isMobile ? "center" : "flex-start",
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    { label: "Subjects",   val: subjects.length,  color: "#c4b5fd" },
                    { label: "Safe",       val: safeCount,        color: "#86efac" },
                    { label: "At risk",    val: dangerCount,      color: "#fda4af" },
                    { label: "Total cls.", val: totalC,           color: "rgba(255,255,255,.5)" },
                  ].map((stat) => (
                    <div key={stat.label} style={{ textAlign: "center" }}>
                      <p style={{ fontSize: isMobile ? 15 : 18, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.val}</p>
                      <p style={{ fontSize: 9, color: "rgba(255,255,255,.28)", fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase", marginTop: 2 }}>{stat.label}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Add subject form ── */}
        <motion.form
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.4 }}
          onSubmit={addSubject}
          style={{ display: "flex", gap: 10, marginBottom: 20 }}
        >
          <input
            value={newSubject}
            onChange={e => setNewSubject(e.target.value)}
            placeholder="Add a subject (e.g. Data Structures)"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              flex: 1,
              padding: isMobile ? "11px 14px" : "12px 16px",
              background: focused ? "rgba(124,58,237,.08)" : "rgba(255,255,255,.04)",
              border: `1px solid ${focused ? "rgba(124,58,237,.55)" : "rgba(255,255,255,.1)"}`,
              borderRadius: 13, fontSize: 14, color: "rgba(255,255,255,.9)",
              outline: "none", fontFamily: "inherit",
              boxShadow: focused ? "0 0 0 3px rgba(124,58,237,.12)" : "none",
              transition: "all .2s",
            }}
          />
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }} type="submit"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: isMobile ? "11px 16px" : "12px 22px",
              borderRadius: 13,
              background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
              border: "1px solid rgba(124,58,237,.4)",
              color: "#fff", fontSize: 13, fontWeight: 700,
              cursor: "pointer", boxShadow: "0 4px 18px rgba(124,58,237,.4)",
              fontFamily: "inherit", transition: "box-shadow .2s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 26px rgba(124,58,237,.65)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 18px rgba(124,58,237,.4)"}
          >
            <Plus size={16} />
            {!isMobile && "Add Subject"}
          </motion.button>
        </motion.form>

        {/* ── Subject list ── */}
        {loading ? (
          <Skeleton isMobile={isMobile} />
        ) : subjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: "center", padding: "50px 20px",
              border: "1px dashed rgba(255,255,255,.1)", borderRadius: 18,
              background: "rgba(255,255,255,.02)",
            }}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <BookOpen size={36} style={{ color: "rgba(255,255,255,.15)", marginBottom: 12 }} />
            </motion.div>
            <p style={{ color: "rgba(255,255,255,.22)", fontSize: 14, fontWeight: 500 }}>
              No subjects yet
            </p>
            <p style={{ color: "rgba(255,255,255,.12)", fontSize: 12, marginTop: 5 }}>
              Add your first subject above to start tracking
            </p>
          </motion.div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Section label */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}
            >
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".12em", color: "rgba(255,255,255,.28)" }}>
                Subjects ({subjects.length})
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.07)" }} />
            </motion.div>

            <AnimatePresence>
              {subjects.map((sub, i) => (
                <SubjectCard
                  key={sub.id}
                  sub={sub}
                  index={i}
                  onMark={mark}
                  onDelete={del}
                  isMobile={isMobile}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
        @keyframes spin  { to{transform:rotate(360deg)} }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </AppShell>
  );
}