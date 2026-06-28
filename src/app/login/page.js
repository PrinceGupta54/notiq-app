// src/app/login/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Mail, Lock, GraduationCap, AlertCircle, Sparkles } from "lucide-react";

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

  // ── Session check: redirect to dashboard if already logged in ──
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) router.push("/dashboard");
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.push("/dashboard");
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 520);
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
    width        : "100%",
    padding      : "clamp(10px,2.5vw,13px) 14px clamp(10px,2.5vw,13px) 42px",
    background   : focused === name ? "rgba(124,58,237,.09)" : "rgba(255,255,255,.04)",
    border       : `1px solid ${focused === name ? "rgba(124,58,237,.6)" : "rgba(255,255,255,.1)"}`,
    borderRadius : 13,
    fontSize     : "clamp(13px,3.5vw,14px)",
    color        : "rgba(255,255,255,.92)",
    outline      : "none",
    boxShadow    : focused === name
      ? "0 0 0 3px rgba(124,58,237,.14), inset 0 1px 0 rgba(255,255,255,.04)"
      : "inset 0 1px 0 rgba(255,255,255,.04)",
    transition   : "all .22s",
    fontFamily   : "inherit",
    boxSizing    : "border-box",
  });

  return (
    <>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes floatA  { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(-28px,38px) scale(1.07)} 70%{transform:translate(16px,-18px) scale(0.96)} }
        @keyframes floatB  { 0%,100%{transform:translate(0,0)} 45%{transform:translate(22px,-32px) scale(1.06)} 75%{transform:translate(-14px,14px)} }
        @keyframes floatC  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(18px)} }
        @keyframes gridFade{ 0%{opacity:0} 100%{opacity:1} }
        @keyframes borderGlow {
          0%,100% { box-shadow: 0 0 0 1px rgba(124,58,237,.12), 0 25px 60px rgba(0,0,0,.5); }
          50%     { box-shadow: 0 0 0 1px rgba(124,58,237,.28), 0 25px 60px rgba(0,0,0,.5), 0 0 50px rgba(124,58,237,.06); }
        }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #0a0a14 inset !important;
          -webkit-text-fill-color: rgba(255,255,255,.9) !important;
          caret-color: #a78bfa !important;
        }
        ::selection { background: rgba(124,58,237,.4); color: #fff; }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{
        minHeight      : "100dvh",
        display        : "flex",
        alignItems     : "center",
        justifyContent : "center",
        background     : "#08080f",
        position       : "relative",
        overflow       : "hidden",
        padding        : "clamp(16px,5vw,32px)",
      }}>

        {/* ── Cinematic background — pure CSS, no JS loop ── */}
        <div aria-hidden style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>

          {/* Orb 1 — top-left purple */}
          <div style={{
            position:"absolute", top:"-18%", left:"-12%",
            width:"clamp(320px,55vw,560px)", height:"clamp(320px,55vw,560px)",
            borderRadius:"50%",
            background:"radial-gradient(circle, rgba(124,58,237,.28) 0%, transparent 70%)",
            filter:"blur(48px)",
            animation:"floatA 16s ease-in-out infinite",
          }}/>

          {/* Orb 2 — bottom-right indigo */}
          <div style={{
            position:"absolute", bottom:"-22%", right:"-12%",
            width:"clamp(280px,48vw,500px)", height:"clamp(280px,48vw,500px)",
            borderRadius:"50%",
            background:"radial-gradient(circle, rgba(99,102,241,.22) 0%, transparent 70%)",
            filter:"blur(56px)",
            animation:"floatB 19s ease-in-out infinite",
          }}/>

          {/* Orb 3 — center cyan accent */}
          <div style={{
            position:"absolute", top:"35%", left:"28%",
            width:"clamp(200px,36vw,340px)", height:"clamp(200px,36vw,340px)",
            borderRadius:"50%",
            background:"radial-gradient(circle, rgba(103,232,249,.07) 0%, transparent 70%)",
            filter:"blur(36px)",
            animation:"floatC 10s ease-in-out infinite",
          }}/>

          {/* Subtle grid */}
          <div style={{
            position:"absolute", inset:0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.016) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(255,255,255,.016) 1px, transparent 1px)",
            backgroundSize:"clamp(28px,5vw,44px) clamp(28px,5vw,44px)",
            animation:"gridFade 1.2s ease forwards",
            opacity:0,
          }}/>

          {/* Corner vignette */}
          <div style={{
            position:"absolute", inset:0,
            background:"radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,.55) 100%)",
          }}/>
        </div>

        {/* ── Glass card ── */}
        <motion.div
          initial={{ opacity:0, y:28, scale:.96 }}
          animate={{ opacity:1, y:0,  scale:1   }}
          transition={{ duration:0.52, ease:[0.22,1,.36,1] }}
          style={{
            position:"relative", zIndex:1,
            width:"100%",
            maxWidth:"clamp(320px,92vw,420px)",
          }}
        >
          <motion.div
            animate={shake ? { x:[-10,10,-8,8,-4,4,0] } : { x:0 }}
            transition={{ duration:0.46 }}
            style={{
              background    : "rgba(255,255,255,.038)",
              border        : "1px solid rgba(255,255,255,.09)",
              borderRadius  : "clamp(18px,4vw,24px)",
              padding       : "clamp(24px,6vw,40px) clamp(20px,6vw,36px)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow     : "0 25px 60px rgba(0,0,0,.55), 0 0 0 1px rgba(124,58,237,.1)",
              animation     : "borderGlow 5s ease-in-out infinite",
            }}
          >

            {/* ── Logo row ── */}
            <motion.div
              initial={{ opacity:0, y:-12 }}
              animate={{ opacity:1, y:0   }}
              transition={{ delay:.1, duration:.4 }}
              style={{ display:"flex", alignItems:"center", gap:10, marginBottom:"clamp(20px,5vw,28px)" }}
            >
              <motion.div
                whileHover={{ scale:1.1, rotate:6 }}
                whileTap={{ scale:.93 }}
                transition={{ type:"spring", stiffness:320, damping:16 }}
                style={{
                  width:"clamp(34px,8vw,40px)", height:"clamp(34px,8vw,40px)",
                  borderRadius:11, flexShrink:0,
                  background:"linear-gradient(135deg,#7c3aed,#5b21b6)",
                  boxShadow:"0 0 28px rgba(124,58,237,.65)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}
              >
                <GraduationCap size={18} color="white" />
              </motion.div>
              <div>
                <p style={{
                  fontSize:"clamp(14px,4vw,16px)",
                  fontWeight:800, color:"#fff", letterSpacing:".02em",
                }}>
                  Notiq
                </p>
                <p style={{ fontSize:"clamp(9px,2.5vw,10px)", color:"rgba(255,255,255,.3)" }}>
                  One App. All Updates.
                </p>
              </div>

              {/* Sparkle badge */}
              <motion.div
                animate={{ opacity:[.5,1,.5] }}
                transition={{ duration:2.5, repeat:Infinity, ease:"easeInOut" }}
                style={{ marginLeft:"auto" }}
              >
                <Sparkles size={14} style={{ color:"rgba(167,139,250,.6)" }} />
              </motion.div>
            </motion.div>

            {/* ── Headings ── */}
            <motion.h1
              initial={{ opacity:0, y:-8 }}
              animate={{ opacity:1, y:0  }}
              transition={{ delay:.15, duration:.38 }}
              style={{
                fontSize:"clamp(18px,5vw,23px)",
                fontWeight:800, marginBottom:4,
                background:"linear-gradient(135deg,#fff 0%,#c4b5fd 60%,#818cf8 100%)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
              }}
            >
              Welcome back
            </motion.h1>
            <motion.p
              initial={{ opacity:0 }}
              animate={{ opacity:1 }}
              transition={{ delay:.18 }}
              style={{
                fontSize:"clamp(11px,3vw,13px)",
                color:"rgba(255,255,255,.3)",
                marginBottom:"clamp(18px,4.5vw,26px)",
              }}
            >
              Log in to continue to Notiq
            </motion.p>

            {/* ── Error banner ── */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity:0, y:-8, height:0 }}
                  animate={{ opacity:1, y:0,  height:"auto" }}
                  exit   ={{ opacity:0, y:-8, height:0 }}
                  transition={{ duration:.25 }}
                  style={{
                    display:"flex", alignItems:"flex-start", gap:8, overflow:"hidden",
                    background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.28)",
                    borderRadius:11, padding:"10px 13px",
                    marginBottom:"clamp(12px,3vw,16px)",
                    boxShadow:"0 0 18px rgba(239,68,68,.12)",
                  }}
                >
                  <AlertCircle size={14} style={{ color:"#f87171", flexShrink:0, marginTop:1 }} />
                  <span style={{ fontSize:"clamp(11px,3vw,12px)", color:"#fca5a5", lineHeight:1.5 }}>
                    {error}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Google button ── */}
            <motion.button
              initial={{ opacity:0, y:8 }}
              animate={{ opacity:1, y:0 }}
              transition={{ delay:.2 }}
              whileHover={{ scale:1.02, boxShadow:"0 0 28px rgba(255,255,255,.06)" }}
              whileTap={{ scale:.97 }}
              onClick={handleGoogle}
              disabled={googleLoading}
              style={{
                width:"100%",
                padding:"clamp(10px,2.5vw,12px) 16px",
                display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                background:"rgba(255,255,255,.055)",
                border:"1px solid rgba(255,255,255,.12)",
                borderRadius:13,
                fontSize:"clamp(12px,3.5vw,13px)", fontWeight:600,
                color:"rgba(255,255,255,.85)", cursor:"pointer",
                marginBottom:"clamp(14px,4vw,20px)",
                transition:"all .22s", fontFamily:"inherit",
                backdropFilter:"blur(8px)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background    = "rgba(255,255,255,.1)";
                e.currentTarget.style.borderColor   = "rgba(255,255,255,.22)";
                e.currentTarget.style.color         = "#fff";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background    = "rgba(255,255,255,.055)";
                e.currentTarget.style.borderColor   = "rgba(255,255,255,.12)";
                e.currentTarget.style.color         = "rgba(255,255,255,.85)";
              }}
            >
              {googleLoading ? (
                <span style={{
                  width:15, height:15, borderRadius:"50%",
                  border:"2px solid rgba(255,255,255,.25)",
                  borderTopColor:"#fff", display:"inline-block",
                  animation:"spin .7s linear infinite",
                }}/>
              ) : (
                <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden>
                  <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.17z"/>
                  <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                  <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                  <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
                </svg>
              )}
              {googleLoading ? "Redirecting…" : "Continue with Google"}
            </motion.button>

            {/* ── Divider ── */}
            <motion.div
              initial={{ opacity:0 }}
              animate={{ opacity:1 }}
              transition={{ delay:.23 }}
              style={{
                display:"flex", alignItems:"center", gap:12,
                marginBottom:"clamp(14px,4vw,20px)",
              }}
            >
              <div style={{ flex:1, height:1, background:"rgba(255,255,255,.07)" }} />
              <span style={{ fontSize:"clamp(10px,2.5vw,11px)", color:"rgba(255,255,255,.22)" }}>
                or sign in with email
              </span>
              <div style={{ flex:1, height:1, background:"rgba(255,255,255,.07)" }} />
            </motion.div>

            {/* ── Form ── */}
            <form onSubmit={handleLogin} noValidate>

              {/* Email */}
              <motion.div
                initial={{ opacity:0, x:-10 }}
                animate={{ opacity:1, x:0   }}
                transition={{ delay:.25 }}
                style={{ position:"relative", marginBottom:"clamp(10px,2.5vw,13px)" }}
              >
                <Mail size={15} style={{
                  position:"absolute", left:14, top:"50%",
                  transform:"translateY(-50%)", pointerEvents:"none",
                  color: focused==="email" ? "#a78bfa" : "rgba(255,255,255,.25)",
                  transition:"color .22s",
                }} />
                <input
                  type="email" value={email} required
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  placeholder="Email address"
                  autoComplete="email"
                  style={inputStyle("email")}
                />
                {/* Focus glow underline */}
                <motion.div
                  animate={{ scaleX: focused==="email" ? 1 : 0, opacity: focused==="email" ? 1 : 0 }}
                  style={{
                    position:"absolute", bottom:0, left:"10%", right:"10%", height:2,
                    background:"linear-gradient(90deg,transparent,rgba(124,58,237,.7),transparent)",
                    borderRadius:2, transformOrigin:"center",
                    transition:"transform .22s, opacity .22s",
                  }}
                />
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity:0, x:-10 }}
                animate={{ opacity:1, x:0   }}
                transition={{ delay:.28 }}
                style={{
                  position:"relative",
                  marginBottom:"clamp(18px,5vw,26px)",
                }}
              >
                <Lock size={15} style={{
                  position:"absolute", left:14, top:"50%",
                  transform:"translateY(-50%)", pointerEvents:"none",
                  color: focused==="password" ? "#a78bfa" : "rgba(255,255,255,.25)",
                  transition:"color .22s",
                }} />
                <input
                  type={showPass ? "text" : "password"}
                  value={password} required
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  placeholder="Password"
                  autoComplete="current-password"
                  style={{ ...inputStyle("password"), paddingRight:44 }}
                />
                {/* Eye toggle */}
                <motion.button
                  type="button"
                  whileHover={{ scale:1.15 }}
                  whileTap={{ scale:.9 }}
                  onClick={() => setShowPass(s => !s)}
                  style={{
                    position:"absolute", right:12, top:"50%",
                    transform:"translateY(-50%)",
                    background:"none", border:"none",
                    cursor:"pointer", padding:4,
                    color:"rgba(255,255,255,.28)",
                    transition:"color .2s",
                    display:"flex", alignItems:"center",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color="#a78bfa"}
                  onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,.28)"}
                >
                  {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                </motion.button>
                {/* Focus glow underline */}
                <motion.div
                  animate={{ scaleX: focused==="password" ? 1 : 0, opacity: focused==="password" ? 1 : 0 }}
                  style={{
                    position:"absolute", bottom:0, left:"10%", right:"10%", height:2,
                    background:"linear-gradient(90deg,transparent,rgba(124,58,237,.7),transparent)",
                    borderRadius:2, transformOrigin:"center",
                    transition:"transform .22s, opacity .22s",
                  }}
                />
              </motion.div>

              {/* Submit */}
              <motion.button
                initial={{ opacity:0, y:8 }}
                animate={{ opacity:1, y:0 }}
                transition={{ delay:.31 }}
                whileHover={!loading ? { scale:1.02 } : {}}
                whileTap={!loading ? { scale:.97 } : {}}
                type="submit"
                disabled={loading}
                style={{
                  width:"100%",
                  padding:"clamp(11px,3vw,13px) 20px",
                  background: loading
                    ? "rgba(124,58,237,.4)"
                    : "linear-gradient(135deg,#7c3aed,#5b21b6)",
                  border:"none", borderRadius:13,
                  fontSize:"clamp(13px,3.5vw,14px)", fontWeight:700,
                  color:"#fff",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading ? "none" : "0 6px 24px rgba(124,58,237,.48)",
                  transition:"all .22s",
                  fontFamily:"inherit", letterSpacing:".01em",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                }}
                onMouseEnter={e => { if(!loading) e.currentTarget.style.boxShadow="0 8px 32px rgba(124,58,237,.68)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = loading ? "none" : "0 6px 24px rgba(124,58,237,.48)"; }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width:14, height:14, borderRadius:"50%",
                      border:"2px solid rgba(255,255,255,.3)",
                      borderTopColor:"#fff", display:"inline-block",
                      animation:"spin .7s linear infinite",
                    }}/>
                    Logging in…
                  </>
                ) : "Log in"}
              </motion.button>
            </form>

            {/* ── Footer link ── */}
            <motion.p
              initial={{ opacity:0 }}
              animate={{ opacity:1 }}
              transition={{ delay:.36 }}
              style={{
                fontSize:"clamp(11px,3vw,13px)",
                color:"rgba(255,255,255,.28)",
                textAlign:"center",
                marginTop:"clamp(16px,4vw,22px)",
              }}
            >
              Don&apos;t have an account?{" "}
              <motion.a
                href="/signup"
                whileHover={{ color:"#c4b5fd" }}
                style={{
                  color:"#a78bfa", fontWeight:700,
                  textDecoration:"none", transition:"color .2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = "#c4b5fd";
                  e.currentTarget.style.textDecoration = "underline";
                  e.currentTarget.style.textDecorationColor = "rgba(196,181,253,.35)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = "#a78bfa";
                  e.currentTarget.style.textDecoration = "none";
                }}
              >
                Sign up
              </motion.a>
            </motion.p>

          </motion.div>
        </motion.div>
      </div>
    </>
  );
}