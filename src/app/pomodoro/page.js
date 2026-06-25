// src/app/pomodoro/page.js
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import { Play, Pause, RotateCcw, Brain, Coffee, Sunset } from "lucide-react";

const MODES = {
  study: { label: "Focus",       minutes: 25, color: "#a78bfa", glow: "rgba(167,139,250,.45)", icon: Brain,   bg: "rgba(167,139,250,.08)" },
  short: { label: "Short Break", minutes: 5,  color: "#38bdf8", glow: "rgba(56,189,248,.45)",  icon: Coffee,  bg: "rgba(56,189,248,.08)"  },
  long:  { label: "Long Break",  minutes: 15, color: "#34d399", glow: "rgba(52,211,153,.45)",  icon: Sunset,  bg: "rgba(52,211,153,.08)"  },
};

// Animated background particles that react to mode
function Particles({ color }) {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -60, 30, 0],
            opacity: [0.04, 0.12, 0.04],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, delay: i * 1.2, ease: "easeInOut" }}
          style={{
            position: "absolute",
            width: 180 + i * 60,
            height: 180 + i * 60,
            borderRadius: "50%",
            background: color,
            filter: "blur(80px)",
            left: `${10 + i * 15}%`,
            top: `${5 + i * 12}%`,
          }}
        />
      ))}
    </div>
  );
}

// Pulsing ring behind the timer when running
function PulseRing({ color, running }) {
  if (!running) return null;
  return (
    <>
      {[1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.18 + i * 0.08], opacity: [0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
          style={{
            position: "absolute", inset: -20 * i,
            borderRadius: "50%",
            border: `2px solid ${color}`,
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}

export default function PomodoroPage() {
  const router = useRouter();
  const [userId, setUserId]         = useState(null);
  const [mode, setMode]             = useState("study");
  const [secondsLeft, setSecondsLeft] = useState(MODES.study.minutes * 60);
  const [running, setRunning]       = useState(false);
  const [sessionsToday, setSessionsToday] = useState(0);
  const [justCompleted, setJustCompleted] = useState(false);
  const intervalRef = useRef(null);

  const { color, glow, icon: ModeIcon, bg } = MODES[mode];

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setUserId(session.user.id);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const { data } = await supabase
        .from("pomodoro_sessions").select("id")
        .eq("user_id", session.user.id)
        .gte("completed_at", today.toISOString());
      setSessionsToday(data?.length || 0);
    };
    init();
  }, [router]);

  useEffect(() => {
    setSecondsLeft(MODES[mode].minutes * 60);
    setRunning(false);
    clearInterval(intervalRef.current);
  }, [mode]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const handleSessionComplete = async () => {
    if (mode !== "study" || !userId) return;
    await supabase.from("pomodoro_sessions").insert({ user_id: userId, duration_minutes: MODES.study.minutes });
    setSessionsToday((p) => p + 1);
    setJustCompleted(true);
    setTimeout(() => setJustCompleted(false), 3000);
  };

  const reset = () => { clearInterval(intervalRef.current); setRunning(false); setSecondsLeft(MODES[mode].minutes * 60); };

  const totalSeconds      = MODES[mode].minutes * 60;
  const progress          = (secondsLeft / totalSeconds) * 100;
  const minutes           = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds           = (secondsLeft % 60).toString().padStart(2, "0");
  const circumference     = 2 * Math.PI * 88;
  const strokeDashoffset  = circumference * (1 - progress / 100);

  return (
    <AppShell>
      {/* Ambient background */}
      <Particles color={color} />

      <div style={{ padding: "32px 28px", maxWidth: 480, margin: "0 auto", position: "relative", zIndex: 1, textAlign: "center" }}>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: 26, fontWeight: 800, marginBottom: 32,
            background: `linear-gradient(135deg,#fff 0%,${color} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            transition: "background 0.6s",
          }}
        >
          Pomodoro Timer
        </motion.h1>

        {/* Mode tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .06 }}
          style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 40 }}
        >
          {Object.entries(MODES).map(([key, val]) => {
            const Icon = val.icon;
            const active = mode === key;
            return (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }}
                onClick={() => setMode(key)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 16px", borderRadius: 30,
                  background: active ? `${val.color}22` : "rgba(255,255,255,.04)",
                  border: `1px solid ${active ? val.color + "55" : "rgba(255,255,255,.1)"}`,
                  color: active ? val.color : "rgba(255,255,255,.4)",
                  fontSize: 12, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                  boxShadow: active ? `0 0 18px ${val.glow}` : "none",
                  transition: "all .3s",
                }}
              >
                <Icon size={12} />
                {val.label}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Timer ring */}
        <motion.div
          initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .1, type: "spring", stiffness: 200 }}
          style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 40 }}
        >
          {/* Outer glow disc */}
          <motion.div
            animate={{ opacity: running ? [0.4, 0.8, 0.4] : 0.3, scale: running ? [1, 1.04, 1] : 1 }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute", inset: -16, borderRadius: "50%",
              background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
              filter: `blur(20px)`,
              pointerEvents: "none",
            }}
          />

          {/* Pulse rings when running */}
          <PulseRing color={color} running={running} />

          <svg width="220" height="220" style={{ transform: "rotate(-90deg)" }}>
            {/* Track */}
            <circle cx="110" cy="110" r="88" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="10" />
            {/* Tick marks */}
            {[...Array(60)].map((_, i) => {
              const angle = (i / 60) * 2 * Math.PI;
              const inner = i % 5 === 0 ? 74 : 78;
              const outer = 84;
              return (
                <line key={i}
                  x1={110 + inner * Math.cos(angle)} y1={110 + inner * Math.sin(angle)}
                  x2={110 + outer * Math.cos(angle)} y2={110 + outer * Math.sin(angle)}
                  stroke={`${color}33`} strokeWidth={i % 5 === 0 ? 2 : 1}
                />
              );
            })}
            {/* Progress arc */}
            <motion.circle
              cx="110" cy="110" r="88"
              fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              style={{ filter: `drop-shadow(0 0 16px ${color}) drop-shadow(0 0 32px ${color}88)` }}
            />
          </svg>

          {/* Center content */}
          <div style={{ position: "absolute", textAlign: "center" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${minutes}:${seconds}`}
                initial={{ opacity: 0.5, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: .2 }}
              >
                <span style={{
                  fontSize: 52, fontWeight: 900, letterSpacing: "-2px",
                  color: "#fff",
                  textShadow: `0 0 30px ${color}`,
                  fontVariantNumeric: "tabular-nums",
                  fontFamily: "inherit",
                }}>
                  {minutes}:{seconds}
                </span>
              </motion.div>
            </AnimatePresence>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 4 }}>
              <ModeIcon size={10} style={{ color }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".1em" }}>
                {MODES[mode].label}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 }}
          style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 36 }}
        >
          {/* Play / Pause */}
          <motion.button
            whileHover={{ scale: 1.06 }} whileTap={{ scale: .93 }}
            onClick={() => setRunning((r) => !r)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "14px 32px", borderRadius: 14,
              background: `linear-gradient(135deg, ${color}, ${color}bb)`,
              border: "none", color: "#fff", fontSize: 14, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: `0 4px 24px ${glow}`,
              transition: "box-shadow .2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = `0 6px 36px ${glow}`}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = `0 4px 24px ${glow}`}
          >
            {running
              ? <><Pause size={15} fill="#fff" /> Pause</>
              : secondsLeft === totalSeconds
                ? <><Play  size={15} fill="#fff" /> Start</>
                : <><Play  size={15} fill="#fff" /> Resume</>
            }
          </motion.button>

          {/* Reset */}
          <motion.button
            whileHover={{ scale: 1.06 }} whileTap={{ scale: .93 }}
            onClick={reset}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "14px 20px", borderRadius: 14,
              background: "rgba(255,255,255,.05)",
              border: "1px solid rgba(255,255,255,.1)",
              color: "rgba(255,255,255,.5)", fontSize: 14, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
              transition: "all .2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.1)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.05)"; e.currentTarget.style.color = "rgba(255,255,255,.5)"; }}
          >
            <RotateCcw size={14} />
          </motion.button>
        </motion.div>

        {/* Session completion flash */}
        <AnimatePresence>
          {justCompleted && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: .95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                marginBottom: 16, padding: "10px 20px", borderRadius: 12,
                background: "rgba(167,139,250,.15)", border: "1px solid rgba(167,139,250,.35)",
                color: "#c4b5fd", fontSize: 13, fontWeight: 600,
                boxShadow: "0 0 20px rgba(167,139,250,.2)",
              }}
            >
              ✨ Focus session complete — great work!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sessions card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }}
          style={{
            background: "rgba(255,255,255,.04)",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 20, padding: "24px 28px",
            backdropFilter: "blur(12px)",
            boxShadow: sessionsToday > 0 ? `0 0 40px ${glow}` : "none",
            transition: "box-shadow .6s",
          }}
        >
          <motion.p
            key={sessionsToday}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            style={{
              fontSize: 48, fontWeight: 900, color,
              textShadow: `0 0 30px ${color}`,
              lineHeight: 1, marginBottom: 6,
            }}
          >
            {sessionsToday}
          </motion.p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginBottom: 16 }}>
            focus session{sessionsToday !== 1 ? "s" : ""} completed today
          </p>

          {/* Dot trail */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            {Array.from({ length: Math.max(sessionsToday, 4) }).map((_, i) => (
              <motion.div
                key={i}
                initial={i < sessionsToday ? { scale: 0 } : {}}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15, delay: i * 0.05 }}
                style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: i < sessionsToday ? color : "rgba(255,255,255,.1)",
                  boxShadow: i < sessionsToday ? `0 0 10px ${color}` : "none",
                  transition: "background .4s, box-shadow .4s",
                }}
              />
            ))}
          </div>

          <p style={{ fontSize: 11, color: "rgba(255,255,255,.2)", marginTop: 14, textTransform: "uppercase", letterSpacing: ".08em" }}>
            Complete a 25-min session to earn a dot
          </p>
        </motion.div>
      </div>
    </AppShell>
  );
}