// src/app/signup/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  Eye, EyeOff, Mail, Lock, User, GraduationCap,
  AlertCircle, Sparkles, ArrowRight, CheckCircle2,
} from "lucide-react";

// ── Password strength ──────────────────────────────────────────
function getStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: "Weak",   color: "#f87171" };
  if (score <= 3) return { score, label: "Fair",   color: "#fbbf24" };
  if (score <= 4) return { score, label: "Good",   color: "#34d399" };
  return             { score, label: "Strong", color: "#a78bfa" };
}

// ── Floating particle ──────────────────────────────────────────
function Particle({ x, y, size, duration, delay, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, x: 0 }}
      animate={{ opacity: [0, 0.6, 0], y: -120, x: [0, (Math.random() - 0.5) * 60] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeOut" }}
      style={{
        position: "absolute", left: x, top: y,
        width: size, height: size, borderRadius: "50%",
        background: color, pointerEvents: "none",
        filter: `blur(${size * 0.3}px)`,
      }}
    />
  );
}

// ── Feature chip ───────────────────────────────────────────────
function FeatureChip({ text, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "5px 12px", borderRadius: 20,
        background: "rgba(124,58,237,.12)",
        border: "1px solid rgba(124,58,237,.22)",
        fontSize: 11, fontWeight: 600, color: "#c4b5fd",
        whiteSpace: "nowrap",
      }}
    >
      <CheckCircle2 size={10} style={{ color: "#a78bfa" }} />
      {text}
    </motion.div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [fullName,      setFullName]      = useState("");
  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [showPass,      setShowPass]      = useState(false);
  const [error,         setError]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [focused,       setFocused]       = useState(null);
  const [shake,         setShake]         = useState(false);
  const [success,       setSuccess]       = useState(false);
  const [isMobile,      setIsMobile]      = useState(false);
  const [isNarrow,      setIsNarrow]      = useState(false);

  const strength = getStrength(password);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768);
      setIsNarrow(window.innerWidth < 420);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const { data, error: err } = await supabase.auth.signUp({ email, password });
    if (err) { setError(err.message); setLoading(false); triggerShake(); return; }
    if (data.user) {
      await supabase.from("profiles").insert({ id: data.user.id, full_name: fullName, email });
    }
    setLoading(false);
    setSuccess(true);
    setTimeout(() => router.push("/dashboard"), 900);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (err) { setError(err.message); setGoogleLoading(false); }
  };

  const inputStyle = (name) => ({
    width: "100%",
    padding: isNarrow ? "10px 12px 10px 38px" : "12px 14px 12px 42px",
    background: focused === name ? "rgba(124,58,237,.09)" : "rgba(255,255,255,.04)",
    border: `1px solid ${focused === name ? "rgba(124,58,237,.6)" : "rgba(255,255,255,.1)"}`,
    borderRadius: 13, fontSize: isNarrow ? 13 : 14,
    color: "rgba(255,255,255,.92)",
    outline: "none",
    boxShadow: focused === name ? "0 0 0 3px rgba(124,58,237,.13)" : "none",
    transition: "all .22s", fontFamily: "inherit",
    boxSizing: "border-box",
  });

  // Particles config (deterministic, no random at render)
  const particles = [
    { x: "10%",  y: "75%", size: 4,  duration: 5,   delay: 0,   color: "rgba(124,58,237,.7)"  },
    { x: "25%",  y: "80%", size: 3,  duration: 6.5, delay: 1.2, color: "rgba(167,139,250,.6)" },
    { x: "50%",  y: "85%", size: 5,  duration: 4.8, delay: 0.5, color: "rgba(99,102,241,.6)"  },
    { x: "70%",  y: "78%", size: 3,  duration: 7,   delay: 2,   color: "rgba(124,58,237,.5)"  },
    { x: "85%",  y: "82%", size: 4,  duration: 5.5, delay: 0.8, color: "rgba(196,181,253,.5)" },
    { x: "40%",  y: "88%", size: 2,  duration: 8,   delay: 3,   color: "rgba(167,139,250,.4)" },
  ];

  const features = ["Attendance Tracker", "SGPA Calculator", "Pomodoro Timer", "Exam Hub"];

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#08080f",
      position: "relative",
      overflow: "hidden",
      padding: isNarrow ? "16px 12px" : "24px 16px",
    }}>

      {/* ── Cinematic background ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {/* Top-right orb */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.45, 0.75, 0.45] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", top: "-18%", right: "-6%",
            width: isMobile ? 320 : 500, height: isMobile ? 320 : 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,.24) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        {/* Bottom-left orb */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          style={{
            position: "absolute", bottom: "-12%", left: "-8%",
            width: isMobile ? 280 : 440, height: isMobile ? 280 : 440,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,.2) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
        {/* Center subtle pulse */}
        <motion.div
          animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.05, 0.12, 0.05] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 6 }}
          style={{
            position: "absolute", top: "30%", left: "30%",
            width: 600, height: 600, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(167,139,250,.15) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        {/* Grid overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.018) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,.018) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }} />
        {/* Floating particles */}
        {particles.map((p, i) => <Particle key={i} {...p} />)}
      </div>

      {/* ── Two-column layout (desktop) / single column (mobile) ── */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%",
        maxWidth: isMobile ? 420 : 900,
        display: "flex",
        alignItems: "center",
        gap: 48,
      }}>

        {/* ── Left panel — branding (desktop only) ── */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ flex: 1, paddingRight: 16 }}
          >
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
              <motion.div
                animate={{ boxShadow: ["0 0 20px rgba(124,58,237,.5)", "0 0 40px rgba(124,58,237,.9)", "0 0 20px rgba(124,58,237,.5)"] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <GraduationCap size={22} color="white" />
              </motion.div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1 }}>Notiq</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 2 }}>One App. All Updates.</p>
              </div>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              style={{
                fontSize: 34, fontWeight: 900, lineHeight: 1.2, marginBottom: 14,
                background: "linear-gradient(135deg,#fff 0%,#c4b5fd 50%,#818cf8 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}
            >
              Your complete academic companion
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              style={{ fontSize: 14, color: "rgba(255,255,255,.38)", lineHeight: 1.7, marginBottom: 28 }}
            >
              Track attendance, calculate SGPA, prep for exams, and stay ahead — all in one place.
            </motion.p>

            {/* Feature chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {features.map((f, i) => (
                <FeatureChip key={f} text={f} delay={0.28 + i * 0.07} />
              ))}
            </div>

            {/* Decorative ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{
                marginTop: 48,
                width: 140, height: 140,
                borderRadius: "50%",
                border: "1px dashed rgba(124,58,237,.25)",
                position: "relative",
              }}
            >
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{
                  position: "absolute", inset: 14,
                  borderRadius: "50%",
                  border: "1px dashed rgba(167,139,250,.2)",
                }}
              />
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <motion.div
                  animate={{ scale: [1, 1.12, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(124,58,237,.5), rgba(91,33,182,.3))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 0 30px rgba(124,58,237,.5)",
                  }}
                >
                  <Sparkles size={20} style={{ color: "#c4b5fd" }} />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── Right panel — form ── */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "100%", maxWidth: 420, flexShrink: 0 }}
        >
          <motion.div
            animate={shake ? { x: [-10, 10, -8, 8, -5, 5, 0] } : { x: 0 }}
            transition={{ duration: 0.45 }}
            style={{
              background: "rgba(255,255,255,.045)",
              border: "1px solid rgba(255,255,255,.09)",
              borderRadius: isNarrow ? 18 : 24,
              padding: isNarrow ? "24px 18px" : "36px 32px",
              backdropFilter: "blur(24px)",
              boxShadow: "0 30px 70px rgba(0,0,0,.55), 0 0 0 1px rgba(124,58,237,.12)",
              position: "relative", overflow: "hidden",
            }}
          >
            {/* Card shimmer top line */}
            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                position: "absolute", top: 0, left: "20%", right: "20%", height: 1,
                background: "linear-gradient(90deg, transparent, rgba(167,139,250,.6), transparent)",
                pointerEvents: "none",
              }}
            />

            {/* Mobile logo */}
            {isMobile && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
                <motion.div
                  animate={{ boxShadow: ["0 0 16px rgba(124,58,237,.5)", "0 0 30px rgba(124,58,237,.8)", "0 0 16px rgba(124,58,237,.5)"] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <GraduationCap size={16} color="white" />
                </motion.div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>Notiq</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>One App. All Updates.</p>
                </div>
              </div>
            )}

            <h1 style={{
              fontSize: isNarrow ? 19 : 22, fontWeight: 800,
              marginBottom: 4,
              background: "linear-gradient(135deg,#fff 0%,#c4b5fd 60%,#818cf8 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Create your account
            </h1>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,.3)", marginBottom: 22 }}>
              Join Notiq — your academic companion
            </p>

            {/* ── Error banner ── */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 14 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 8,
                    overflow: "hidden",
                    background: "rgba(239,68,68,.09)",
                    border: "1px solid rgba(239,68,68,.25)",
                    borderRadius: 11, padding: "10px 13px",
                  }}
                >
                  <AlertCircle size={14} style={{ color: "#f87171", flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 12, color: "#fca5a5", lineHeight: 1.5 }}>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Success flash ── */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "rgba(52,211,153,.12)",
                    border: "1px solid rgba(52,211,153,.3)",
                    borderRadius: 11, padding: "10px 13px", marginBottom: 14,
                  }}
                >
                  <CheckCircle2 size={14} style={{ color: "#34d399" }} />
                  <span style={{ fontSize: 12, color: "#6ee7b7", fontWeight: 600 }}>
                    Account created! Redirecting…
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Google button ── */}
            <motion.button
              whileHover={{ scale: 1.018, borderColor: "rgba(255,255,255,.22)" }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGoogle}
              disabled={googleLoading}
              style={{
                width: "100%",
                padding: isNarrow ? "10px 14px" : "12px 16px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.12)",
                borderRadius: 13, fontSize: 13, fontWeight: 600,
                color: "rgba(255,255,255,.85)",
                cursor: googleLoading ? "not-allowed" : "pointer",
                marginBottom: 16, fontFamily: "inherit",
                transition: "all .22s", boxSizing: "border-box",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.1)"; e.currentTarget.style.boxShadow = "0 4px 18px rgba(0,0,0,.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              {googleLoading ? (
                <span style={{
                  width: 16, height: 16, borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,.2)", borderTopColor: "#fff",
                  display: "inline-block", animation: "spin .7s linear infinite",
                }} />
              ) : (
                <svg width="17" height="17" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.17z"/>
                  <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                  <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                  <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
                </svg>
              )}
              {googleLoading ? "Redirecting…" : "Continue with Google"}
            </motion.button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.22)" }}>or sign up with email</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 11 }}>

              {/* Full name */}
              <div style={{ position: "relative" }}>
                <User size={14} style={{
                  position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
                  color: focused === "name" ? "#a78bfa" : "rgba(255,255,255,.22)",
                  transition: "color .2s", pointerEvents: "none", zIndex: 1,
                }} />
                <input
                  type="text" value={fullName} required
                  onChange={e => setFullName(e.target.value)}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused(null)}
                  placeholder="Full name"
                  style={inputStyle("name")}
                />
              </div>

              {/* Email */}
              <div style={{ position: "relative" }}>
                <Mail size={14} style={{
                  position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
                  color: focused === "email" ? "#a78bfa" : "rgba(255,255,255,.22)",
                  transition: "color .2s", pointerEvents: "none", zIndex: 1,
                }} />
                <input
                  type="email" value={email} required
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  placeholder="Email address"
                  style={inputStyle("email")}
                />
              </div>

              {/* Password + strength */}
              <div>
                <div style={{ position: "relative" }}>
                  <Lock size={14} style={{
                    position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
                    color: focused === "password" ? "#a78bfa" : "rgba(255,255,255,.22)",
                    transition: "color .2s", pointerEvents: "none", zIndex: 1,
                  }} />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password} required minLength={6}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
                    placeholder="Password (min 6 chars)"
                    style={{ ...inputStyle("password"), paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", padding: 3,
                      color: "rgba(255,255,255,.28)", transition: "color .2s", zIndex: 1,
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = "#a78bfa"}
                    onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.28)"}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Strength meter */}
                <AnimatePresence>
                  {password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: 8, overflow: "hidden" }}
                    >
                      <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <motion.div
                            key={i}
                            animate={{ background: i <= strength.score ? strength.color : "rgba(255,255,255,.08)" }}
                            transition={{ duration: 0.3 }}
                            style={{
                              flex: 1, height: 3, borderRadius: 2,
                              boxShadow: i <= strength.score ? `0 0 6px ${strength.color}80` : "none",
                            }}
                          />
                        ))}
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: strength.color, letterSpacing: ".05em" }}>
                          {strength.label}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.016 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading || success}
                style={{
                  width: "100%",
                  padding: isNarrow ? "12px 20px" : "13px 20px",
                  marginTop: 6,
                  background: success
                    ? "linear-gradient(135deg,#34d399,#059669)"
                    : "linear-gradient(135deg,#7c3aed,#5b21b6)",
                  border: success ? "1px solid rgba(52,211,153,.4)" : "1px solid rgba(124,58,237,.4)",
                  borderRadius: 13, fontSize: 14, fontWeight: 700,
                  color: "#fff",
                  cursor: loading || success ? "not-allowed" : "pointer",
                  opacity: loading ? 0.75 : 1,
                  boxShadow: success
                    ? "0 6px 24px rgba(52,211,153,.4)"
                    : "0 6px 24px rgba(124,58,237,.45)",
                  fontFamily: "inherit",
                  transition: "all .3s cubic-bezier(.34,1.2,.64,1)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxSizing: "border-box",
                }}
                onMouseEnter={e => {
                  if (!loading && !success) e.currentTarget.style.boxShadow = "0 8px 32px rgba(124,58,237,.68)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "0 6px 24px rgba(124,58,237,.45)";
                }}
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        width: 14, height: 14, borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff",
                        display: "inline-block", animation: "spin .7s linear infinite",
                      }} />
                      Creating account…
                    </motion.span>
                  ) : success ? (
                    <motion.span key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <CheckCircle2 size={15} /> All set!
                    </motion.span>
                  ) : (
                    <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      Create account <ArrowRight size={15} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </form>

            {/* Footer link */}
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.28)", textAlign: "center", marginTop: 20 }}>
              Already have an account?{" "}
              <a
                href="/login"
                style={{ color: "#a78bfa", fontWeight: 600, textDecoration: "none" }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
              >
                Log in
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #0d0d1a inset !important;
          -webkit-text-fill-color: rgba(255,255,255,.9) !important;
        }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}