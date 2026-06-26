// src/app/pomodoro/page.js
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import { Play, Pause, RotateCcw, Brain, Coffee, Sunset } from "lucide-react";

// ── Constants ─────────────────────────────────────────────────
const MODES = {
  study: { label: "Focus",       minutes: 25, color: "#a78bfa", glow: "rgba(167,139,250,.45)", icon: Brain,  bg: "rgba(167,139,250,.08)" },
  short: { label: "Short Break", minutes: 5,  color: "#38bdf8", glow: "rgba(56,189,248,.45)",  icon: Coffee, bg: "rgba(56,189,248,.08)"  },
  long:  { label: "Long Break",  minutes: 15, color: "#34d399", glow: "rgba(52,211,153,.45)",  icon: Sunset, bg: "rgba(52,211,153,.08)"  },
};

// ── Ambient blobs — CSS-only, zero framer overhead ────────────
function AmbientBlobs({ color }) {
  return (
    <>
      <style>{`
        @keyframes blobA {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(-30px, 40px) scale(1.06); }
          66%      { transform: translate(20px, -25px) scale(0.96); }
        }
        @keyframes blobB {
          0%,100% { transform: translate(0,0); }
          40%      { transform: translate(25px,-30px) scale(1.05); }
          75%      { transform: translate(-15px,18px); }
        }
        @keyframes blobC {
          0%,100% { transform: translate(0,0); }
          50%      { transform: translate(18px,22px); }
        }
        @keyframes pulse2 { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>
      <div aria-hidden style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0 }}>
        <div style={{
          position:"absolute", top:"-18%", right:"-8%",
          width:"min(540px,80vw)", height:"min(540px,80vw)", borderRadius:"50%",
          background:`radial-gradient(circle, ${color}1a 0%, transparent 68%)`,
          filter:"blur(72px)", animation:"blobA 16s ease-in-out infinite",
          transition:"background 0.8s",
        }}/>
        <div style={{
          position:"absolute", bottom:"-14%", left:"-6%",
          width:"min(420px,65vw)", height:"min(420px,65vw)", borderRadius:"50%",
          background:`radial-gradient(circle, ${color}12 0%, transparent 70%)`,
          filter:"blur(64px)", animation:"blobB 19s ease-in-out infinite",
          transition:"background 0.8s",
        }}/>
        <div style={{
          position:"absolute", top:"42%", left:"30%",
          width:"min(260px,50vw)", height:"min(260px,50vw)", borderRadius:"50%",
          background:`radial-gradient(circle, ${color}0a 0%, transparent 70%)`,
          filter:"blur(48px)", animation:"blobC 12s ease-in-out infinite",
          transition:"background 0.8s",
        }}/>
      </div>
    </>
  );
}

// ── Pulse rings (only mounted when running) ───────────────────
function PulseRings({ color }) {
  return (
    <>
      {[1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.2 + i * 0.07], opacity: [0.28, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.65, ease: "easeOut" }}
          style={{
            position: "absolute",
            inset: -18 * i,
            borderRadius: "50%",
            border: `2px solid ${color}`,
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function PomodoroPage() {
  const router      = useRouter();
  const intervalRef = useRef(null);

  const [userId,         setUserId]         = useState(null);
  const [mode,           setMode]           = useState("study");
  const [secondsLeft,    setSecondsLeft]    = useState(MODES.study.minutes * 60);
  const [running,        setRunning]        = useState(false);
  const [sessionsToday,  setSessionsToday]  = useState(0);
  const [justCompleted,  setJustCompleted]  = useState(false);
  const [userIdRef,      setUserIdRef]      = useState(null); // stable ref for interval cb

  const { color, glow, icon: ModeIcon } = MODES[mode];
  const totalSeconds   = MODES[mode].minutes * 60;
  const progress       = (secondsLeft / totalSeconds) * 100;
  const mm             = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const ss             = (secondsLeft % 60).toString().padStart(2, "0");
  const R              = 88;
  const circumference  = 2 * Math.PI * R;
  const dashOffset     = circumference * (1 - progress / 100);

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/login"); return; }
      setUserId(session.user.id);
      setUserIdRef(session.user.id);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      supabase.from("pomodoro_sessions").select("id")
        .eq("user_id", session.user.id)
        .gte("completed_at", today.toISOString())
        .then(({ data }) => setSessionsToday(data?.length || 0));
    });
  }, [router]);

  // Stable complete handler — never recreated (uses ref value)
  const handleComplete = useCallback(async () => {
    if (!userIdRef) return;
    await supabase.from("pomodoro_sessions").insert({
      user_id: userIdRef,
      duration_minutes: MODES.study.minutes,
    });
    setSessionsToday((p) => p + 1);
    setJustCompleted(true);
    setTimeout(() => setJustCompleted(false), 3200);
  }, [userIdRef]);

  // Mode change → reset
  useEffect(() => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setSecondsLeft(MODES[mode].minutes * 60);
  }, [mode]);

  // Tick — only depends on `running`; uses functional updater so no stale closure
  useEffect(() => {
    if (!running) { clearInterval(intervalRef.current); return; }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          // Only log study sessions
          if (mode === "study") handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setSecondsLeft(MODES[mode].minutes * 60);
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <AppShell>
      <AmbientBlobs color={color} />

      {/* Responsive container */}
      <div style={{
        position: "relative", zIndex: 1,
        padding: "clamp(20px, 5vw, 40px) clamp(16px, 5vw, 32px)",
        maxWidth: 520, margin: "0 auto", textAlign: "center",
      }}>

        {/* ── Heading ── */}
        <motion.h1
          initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: "clamp(22px, 5vw, 28px)",
            fontWeight: 800,
            marginBottom: "clamp(20px, 5vw, 32px)",
            background: `linear-gradient(135deg, #fff 0%, ${color} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            transition: "background 0.7s",
          }}
        >
          Pomodoro Timer
        </motion.h1>

        {/* ── Mode tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .07 }}
          style={{
            display: "flex", justifyContent: "center",
            gap: "clamp(4px, 2vw, 10px)",
            marginBottom: "clamp(28px, 7vw, 44px)",
            flexWrap: "wrap",
          }}
        >
          {Object.entries(MODES).map(([key, val]) => {
            const Icon  = val.icon;
            const active = mode === key;
            return (
              <motion.button
                key={key}
                whileHover={{ scale: 1.06 }} whileTap={{ scale: .93 }}
                onClick={() => setMode(key)}
                style={{
                  display: "flex", alignItems: "center",
                  gap: "clamp(4px,1.5vw,7px)",
                  padding: "clamp(6px,2vw,9px) clamp(10px,3vw,18px)",
                  borderRadius: 30,
                  background: active ? `${val.color}20` : "rgba(255,255,255,.04)",
                  border: `1px solid ${active ? val.color + "60" : "rgba(255,255,255,.1)"}`,
                  color: active ? val.color : "rgba(255,255,255,.4)",
                  fontSize: "clamp(11px,3vw,13px)", fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                  boxShadow: active ? `0 0 20px ${val.glow}` : "none",
                  transition: "all .3s",
                }}
              >
                <Icon size={12} />
                {val.label}
              </motion.button>
            );
          })}
        </motion.div>

        {/* ── Timer ring ── */}
        <motion.div
          initial={{ opacity: 0, scale: .88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: .1, type: "spring", stiffness: 180, damping: 18 }}
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center", justifyContent: "center",
            marginBottom: "clamp(24px, 6vw, 44px)",
          }}
        >
          {/* Glow disc — CSS transition, no framer loop */}
          <div style={{
            position: "absolute", inset: -18, borderRadius: "50%", pointerEvents: "none",
            background: `radial-gradient(circle, ${color}1e 0%, transparent 70%)`,
            filter: "blur(22px)",
            opacity: running ? 0.9 : 0.35,
            transition: "opacity 1s, background 0.7s",
          }} />

          {/* Pulse rings — only rendered when running */}
          <AnimatePresence>
            {running && <PulseRings color={color} />}
          </AnimatePresence>

          {/* SVG ring — responsive size via CSS clamp on wrapper */}
          <svg
            viewBox="0 0 220 220"
            style={{
              width: "clamp(180px, 52vw, 220px)",
              height: "clamp(180px, 52vw, 220px)",
              transform: "rotate(-90deg)",
              overflow: "visible",
            }}
          >
            {/* Track */}
            <circle
              cx="110" cy="110" r={R}
              fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="10"
            />

            {/* Tick marks */}
            {Array.from({ length: 60 }, (_, i) => {
              const angle = (i / 60) * 2 * Math.PI;
              const inner = i % 5 === 0 ? 74 : 78;
              return (
                <line
                  key={i}
                  x1={110 + inner * Math.cos(angle)} y1={110 + inner * Math.sin(angle)}
                  x2={110 + 84   * Math.cos(angle)} y2={110 + 84   * Math.sin(angle)}
                  stroke={`${color}2e`}
                  strokeWidth={i % 5 === 0 ? 2 : 1}
                />
              );
            })}

            {/* Progress arc — motion.circle for smooth dash animation */}
            <motion.circle
              cx="110" cy="110" r={R}
              fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              style={{
                filter: `drop-shadow(0 0 14px ${color}) drop-shadow(0 0 28px ${color}80)`,
                transition: "stroke 0.7s, filter 0.7s",
              }}
            />
          </svg>

          {/* Center display */}
          <div style={{ position: "absolute", textAlign: "center", userSelect: "none" }}>
            <motion.span
              key={`${mm}:${ss}`}
              initial={{ opacity: 0.6, scale: 0.94 }}
              animate={{ opacity: 1,   scale: 1    }}
              transition={{ duration: .18 }}
              style={{
                display: "block",
                fontSize: "clamp(36px, 12vw, 54px)",
                fontWeight: 900,
                letterSpacing: "-2px",
                color: "#fff",
                textShadow: `0 0 28px ${color}`,
                fontVariantNumeric: "tabular-nums",
                fontFamily: "inherit",
                lineHeight: 1,
                transition: "text-shadow 0.7s",
              }}
            >
              {mm}:{ss}
            </motion.span>

            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 5, marginTop: 6,
            }}>
              <ModeIcon size={10} style={{ color, flexShrink: 0, transition: "color 0.7s" }} />
              <span style={{
                fontSize: 10, color: "rgba(255,255,255,.35)",
                fontWeight: 600, textTransform: "uppercase", letterSpacing: ".1em",
              }}>
                {MODES[mode].label}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Controls ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .16 }}
          style={{
            display: "flex", justifyContent: "center",
            gap: "clamp(8px, 3vw, 14px)",
            marginBottom: "clamp(24px, 6vw, 38px)",
          }}
        >
          {/* Play / Pause */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: .93 }}
            onClick={() => setRunning((r) => !r)}
            style={{
              display: "flex", alignItems: "center",
              gap: "clamp(6px,2vw,9px)",
              padding: "clamp(11px,3vw,15px) clamp(20px,6vw,34px)",
              borderRadius: 14,
              background: `linear-gradient(135deg, ${color}, ${color}bb)`,
              border: "none", color: "#fff",
              fontSize: "clamp(13px,3.5vw,15px)", fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: `0 4px 24px ${glow}`,
              transition: "background 0.7s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = `0 7px 36px ${glow}`}
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
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: .93 }}
            onClick={reset}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "clamp(11px,3vw,15px) clamp(14px,4vw,22px)",
              borderRadius: 14,
              background: "rgba(255,255,255,.05)",
              border: "1px solid rgba(255,255,255,.1)",
              color: "rgba(255,255,255,.5)",
              fontSize: "clamp(13px,3.5vw,15px)", fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
              transition: "all .2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,.1)";
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.borderColor = "rgba(255,255,255,.22)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,.05)";
              e.currentTarget.style.color = "rgba(255,255,255,.5)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,.1)";
            }}
          >
            <RotateCcw size={15} />
          </motion.button>
        </motion.div>

        {/* ── Completion flash ── */}
        <AnimatePresence>
          {justCompleted && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: .95 }}
              animate={{ opacity: 1,   y: 0,  scale: 1  }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                marginBottom: 18, padding: "11px 22px", borderRadius: 13,
                background: "rgba(167,139,250,.14)",
                border: "1px solid rgba(167,139,250,.35)",
                color: "#c4b5fd", fontSize: 13, fontWeight: 600,
                boxShadow: "0 0 22px rgba(167,139,250,.2)",
              }}
            >
              ✨ Focus session complete — great work!
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Sessions card ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .22 }}
          style={{
            background: "rgba(255,255,255,.04)",
            border: `1px solid ${sessionsToday > 0 ? color + "22" : "rgba(255,255,255,.08)"}`,
            borderRadius: 22,
            padding: "clamp(18px, 5vw, 28px) clamp(18px, 6vw, 32px)",
            backdropFilter: "blur(14px)",
            boxShadow: sessionsToday > 0 ? `0 0 44px ${glow}` : "none",
            transition: "box-shadow 0.7s, border-color 0.7s",
          }}
        >
          {/* Big count */}
          <motion.p
            key={sessionsToday}
            initial={{ scale: 1.25, opacity: 0 }}
            animate={{ scale: 1,    opacity: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 16 }}
            style={{
              fontSize: "clamp(36px, 12vw, 52px)",
              fontWeight: 900,
              color,
              textShadow: `0 0 28px ${color}`,
              lineHeight: 1, marginBottom: 6,
              transition: "color 0.7s, text-shadow 0.7s",
            }}
          >
            {sessionsToday}
          </motion.p>

          <p style={{ fontSize: "clamp(12px,3.5vw,14px)", color: "rgba(255,255,255,.38)", marginBottom: 18 }}>
            focus session{sessionsToday !== 1 ? "s" : ""} completed today
          </p>

          {/* Dot trail */}
          <div style={{
            display: "flex", justifyContent: "center",
            gap: "clamp(5px,2vw,8px)", flexWrap: "wrap",
          }}>
            {Array.from({ length: Math.max(sessionsToday, 4) }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: i < sessionsToday ? 0 : 1 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 14, delay: i * 0.04 }}
                style={{
                  width: "clamp(8px,2.5vw,11px)",
                  height: "clamp(8px,2.5vw,11px)",
                  borderRadius: "50%",
                  background: i < sessionsToday ? color : "rgba(255,255,255,.1)",
                  boxShadow: i < sessionsToday ? `0 0 10px ${color}` : "none",
                  transition: "background .4s, box-shadow .4s",
                }}
              />
            ))}
          </div>

          <p style={{
            fontSize: "clamp(9px,2.5vw,11px)",
            color: "rgba(255,255,255,.18)",
            marginTop: 14,
            textTransform: "uppercase", letterSpacing: ".08em",
          }}>
            Complete a 25-min session to earn a dot
          </p>
        </motion.div>
      </div>
    </AppShell>
  );
}