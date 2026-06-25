// ═══════════════════════════════════════════════════
//  FILE 5A — src/app/login/page.js
//  REPLACE your entire existing login/page.js
// ═══════════════════════════════════════════════════

// COPY EVERYTHING BELOW THIS LINE INTO: src/app/login/page.js

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Mail, Lock, GraduationCap, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [showPass,      setShowPass]      = useState(false);
  const [error,         setError]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [focused,       setFocused]       = useState(null);
  const [shake,         setShake]         = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); triggerShake(); return; }
    router.push("/dashboard");
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options : { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (err) { setError(err.message); setGoogleLoading(false); }
  };

  const inputStyle = (name) => ({
    width          : "100%",
    padding        : "11px 14px 11px 40px",
    background     : focused === name ? "rgba(124,58,237,.08)" : "rgba(255,255,255,.04)",
    border         : `1px solid ${focused === name ? "rgba(124,58,237,.55)" : "rgba(255,255,255,.1)"}`,
    borderRadius   : 12,
    fontSize       : 14,
    color          : "rgba(255,255,255,.92)",
    outline        : "none",
    boxShadow      : focused === name ? "0 0 0 3px rgba(124,58,237,.12)" : "none",
    transition     : "all .2s",
    fontFamily     : "inherit",
  });

  return (
    <div style={{
      minHeight      : "100vh",
      display        : "flex",
      alignItems     : "center",
      justifyContent : "center",
      background     : "#08080f",
      position       : "relative",
      overflow       : "hidden",
      padding        : "20px",
    }}>

      {/* ── Cinematic background orbs ── */}
      <div style={{
        position     : "fixed", inset: 0,
        pointerEvents: "none", zIndex: 0,
      }}>
        {/* Top-left purple orb */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [.6, .9, .6] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position    : "absolute",
            top: "-15%", left: "-10%",
            width: 500, height: 500,
            borderRadius: "50%",
            background  : "radial-gradient(circle, rgba(124,58,237,.25) 0%, transparent 70%)",
            filter      : "blur(40px)",
          }}
        />
        {/* Bottom-right indigo orb */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [.4, .7, .4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          style={{
            position    : "absolute",
            bottom: "-20%", right: "-10%",
            width: 450, height: 450,
            borderRadius: "50%",
            background  : "radial-gradient(circle, rgba(99,102,241,.2) 0%, transparent 70%)",
            filter      : "blur(50px)",
          }}
        />
        {/* Center subtle cyan */}
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{
            position    : "absolute",
            top: "40%", left: "30%",
            width: 300, height: 300,
            borderRadius: "50%",
            background  : "radial-gradient(circle, rgba(103,232,249,.06) 0%, transparent 70%)",
            filter      : "blur(30px)",
          }}
        />
        {/* Grid overlay */}
        <div style={{
          position   : "absolute", inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.018) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
      </div>

      {/* ── Glass card ── */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: .95 }}
        animate={{ opacity: 1,  y: 0,  scale: 1   }}
        transition={{ duration: 0.5, ease: [0.22,1,.36,1] }}
        style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 400 }}
      >
        <motion.div
          animate={shake ? { x: [-10, 10, -8, 8, -5, 5, 0] } : { x: 0 }}
          transition={{ duration: 0.45 }}
          style={{
            background    : "rgba(255,255,255,.04)",
            border        : "1px solid rgba(255,255,255,.09)",
            borderRadius  : 22,
            padding       : "36px 32px",
            backdropFilter: "blur(20px)",
            boxShadow     : "0 25px 60px rgba(0,0,0,.5), 0 0 0 1px rgba(124,58,237,.1)",
          }}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1,  y: 0   }}
            transition={{ delay: .1 }}
            style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
              boxShadow: "0 0 24px rgba(124,58,237,.6)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <GraduationCap size={18} color="white" />
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: ".02em" }}>Notiq</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>One App. All Updates.</p>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1,  y: 0  }}
            transition={{ delay: .15 }}
            style={{
              fontSize  : 22, fontWeight: 800, marginBottom: 4,
              background: "linear-gradient(135deg,#fff 0%,#c4b5fd 60%,#818cf8 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}
          >
            Welcome back
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: .18 }}
            style={{ fontSize: 13, color: "rgba(255,255,255,.32)", marginBottom: 24 }}
          >
            Log in to continue to Notiq
          </motion.p>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1,  y: 0,  height: "auto" }}
                exit   ={{ opacity: 0,  y: -8, height: 0 }}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)",
                  borderRadius: 10, padding: "10px 13px", marginBottom: 16, overflow: "hidden",
                }}
              >
                <AlertCircle size={14} style={{ color: "#f87171", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#fca5a5" }}>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google button */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1,  y: 0 }}
            transition={{ delay: .2 }}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: .97 }}
            onClick={handleGoogle}
            disabled={googleLoading}
            style={{
              width: "100%", padding: "11px 16px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: 12, fontSize: 13, fontWeight: 600,
              color: "rgba(255,255,255,.85)", cursor: "pointer",
              marginBottom: 18, transition: "all .2s", fontFamily: "inherit",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.12)"; }}
          >
            <svg width="17" height="17" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.17z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
            </svg>
            {googleLoading ? "Redirecting…" : "Continue with Google"}
          </motion.button>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: .22 }}
            style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}
          >
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.25)" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
          </motion.div>

          {/* Form */}
          <form onSubmit={handleLogin}>
            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1,  x: 0  }}
              transition={{ delay: .24 }}
              style={{ position: "relative", marginBottom: 12 }}
            >
              <Mail size={15} style={{
                position: "absolute", left: 13, top: "50%",
                transform: "translateY(-50%)",
                color: focused === "email" ? "#a78bfa" : "rgba(255,255,255,.25)",
                transition: "color .2s",
              }} />
              <input
                type="email" value={email} required
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                placeholder="Email address"
                style={inputStyle("email")}
              />
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1,  x: 0  }}
              transition={{ delay: .27 }}
              style={{ position: "relative", marginBottom: 22 }}
            >
              <Lock size={15} style={{
                position: "absolute", left: 13, top: "50%",
                transform: "translateY(-50%)",
                color: focused === "password" ? "#a78bfa" : "rgba(255,255,255,.25)",
                transition: "color .2s",
              }} />
              <input
                type={showPass ? "text" : "password"}
                value={password} required
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                placeholder="Password"
                style={{ ...inputStyle("password"), paddingRight: 42 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: "absolute", right: 12, top: "50%",
                  transform: "translateY(-50%)", background: "none",
                  border: "none", cursor: "pointer", padding: 2,
                  color: "rgba(255,255,255,.3)", transition: "color .2s",
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#a78bfa"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.3)"}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </motion.div>

            {/* Submit */}
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1,  y: 0 }}
              transition={{ delay: .3 }}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: .97 }}
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "12px 20px",
                background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
                border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700,
                color: "#fff", cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? .7 : 1,
                boxShadow: "0 6px 22px rgba(124,58,237,.45)",
                transition: "all .2s", fontFamily: "inherit",
                letterSpacing: ".01em",
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.boxShadow = "0 8px 30px rgba(124,58,237,.65)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 6px 22px rgba(124,58,237,.45)")}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span style={{
                    width: 14, height: 14, borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,.3)",
                    borderTopColor: "#fff",
                    display: "inline-block",
                    animation: "spin .7s linear infinite",
                  }} />
                  Logging in…
                </span>
              ) : "Log in"}
            </motion.button>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: .35 }}
            style={{ fontSize: 13, color: "rgba(255,255,255,.3)", textAlign: "center", marginTop: 20 }}
          >
            Don&apos;t have an account?{" "}
            <a href="/signup" style={{ color: "#a78bfa", fontWeight: 600, textDecoration: "none" }}>
              Sign up
            </a>
          </motion.p>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #0d0d1a inset !important;
          -webkit-text-fill-color: rgba(255,255,255,.9) !important;
        }
      `}</style>
    </div>
  );
}