// src/app/results/page.js
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import AppShell from "@/components/AppShell";
import { ExternalLink, Archive, ShieldAlert, ChevronDown, Trophy } from "lucide-react";

// ── University data ────────────────────────────────────────────
const UNIVERSITIES = [
  {
    name: "Bihar Engineering University",
    full: "Bihar Engineering University (BEU)",
    short: "BEU",
    est: "Est. 2013",
    color: "#818cf8",
    glow: "rgba(129,140,248,.4)",
    bg: "rgba(129,140,248,.1)",
    result_url: "https://beuexam.in/checkresult.aspx",
    archive_url: "https://beuexam.in",
    semesters: ["1st","2nd","3rd","4th","5th","6th","7th","8th"],
    tag: "Engineering",
  },
  {
    name: "Aryabhatta Knowledge University",
    full: "Aryabhatta Knowledge University (AKU)",
    short: "AKU",
    est: "Est. 2008",
    color: "#38bdf8",
    glow: "rgba(56,189,248,.4)",
    bg: "rgba(56,189,248,.1)",
    result_url: "https://www.akuexam.net",
    archive_url: "https://www.akuexam.net",
    semesters: ["1st","2nd","3rd","4th","5th","6th"],
    tag: "General",
  },
  {
    name: "Patna University",
    full: "Patna University (PU)",
    short: "PU",
    est: "Est. 1917",
    color: "#34d399",
    glow: "rgba(52,211,153,.4)",
    bg: "rgba(52,211,153,.1)",
    result_url: "https://www.patnauniversity.ac.in/examination.php",
    archive_url: "https://www.patnauniversity.ac.in",
    semesters: ["1st","2nd","3rd","4th","5th","6th"],
    tag: "General",
  },
  {
    name: "B.R. Ambedkar Bihar University",
    full: "B.R. Ambedkar Bihar University (BRABU)",
    short: "BRABU",
    est: "Est. 1960",
    color: "#fbbf24",
    glow: "rgba(251,191,36,.4)",
    bg: "rgba(251,191,36,.1)",
    result_url: "https://brabu.net/result",
    archive_url: "https://brabu.net",
    semesters: ["1st","2nd","3rd","4th","5th","6th"],
    tag: "General",
  },
  {
    name: "Magadh University",
    full: "Magadh University (MU)",
    short: "MU",
    est: "Est. 1962",
    color: "#f87171",
    glow: "rgba(248,113,113,.4)",
    bg: "rgba(248,113,113,.1)",
    result_url: "https://magadhuniversity.ac.in/result",
    archive_url: "https://magadhuniversity.ac.in",
    semesters: ["1st","2nd","3rd","4th"],
    tag: "General",
  },
  {
    name: "Lalit Narayan Mithila University",
    full: "Lalit Narayan Mithila University (LNMU)",
    short: "LNMU",
    est: "Est. 1972",
    color: "#c084fc",
    glow: "rgba(192,132,252,.4)",
    bg: "rgba(192,132,252,.1)",
    result_url: "https://lnmu.ac.in/result",
    archive_url: "https://lnmu.ac.in",
    semesters: ["1st","2nd","3rd","4th","5th","6th"],
    tag: "General",
  },
  {
    name: "Tilka Manjhi Bhagalpur University",
    full: "Tilka Manjhi Bhagalpur University (TMBU)",
    short: "TMBU",
    est: "Est. 1960",
    color: "#fb923c",
    glow: "rgba(251,146,60,.4)",
    bg: "rgba(251,146,60,.1)",
    result_url: "https://tmbu.ac.in/result",
    archive_url: "https://tmbu.ac.in",
    semesters: ["1st","2nd","3rd","4th"],
    tag: "General",
  },
  {
    name: "Jai Prakash University",
    full: "Jai Prakash University (JPU)",
    short: "JPU",
    est: "Est. 1990",
    color: "#2dd4bf",
    glow: "rgba(45,212,191,.4)",
    bg: "rgba(45,212,191,.1)",
    result_url: "https://jpv.bih.nic.in",
    archive_url: "https://jpv.bih.nic.in",
    semesters: ["1st","2nd","3rd","4th"],
    tag: "General",
  },
];

// ── Responsive hook ────────────────────────────────────────────
function useBreakpoint() {
  const [bp, setBp] = useState({ isMobile: false, isTablet: false });
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setBp({ isMobile: w < 480, isTablet: w >= 480 && w < 768 });
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return bp;
}

// ── Ambient background orbs ────────────────────────────────────
function AmbientOrbs() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <motion.div
        animate={{ x: [0, 50, 0], y: [0, -40, 0], scale: [1, 1.18, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", top: "8%", left: "3%",
          width: "clamp(200px, 35vw, 380px)", height: "clamp(200px, 35vw, 380px)",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(129,140,248,.07) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      <motion.div
        animate={{ x: [0, -40, 0], y: [0, 60, 0], scale: [1, 1.12, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        style={{
          position: "absolute", bottom: "10%", right: "5%",
          width: "clamp(160px, 28vw, 300px)", height: "clamp(160px, 28vw, 300px)",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(45,212,191,.06) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <motion.div
        animate={{ x: [0, 25, -25, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 9 }}
        style={{
          position: "absolute", top: "45%", left: "45%",
          width: "clamp(130px, 22vw, 240px)", height: "clamp(130px, 22vw, 240px)",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251,191,36,.05) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />
    </div>
  );
}

// ── University seal / logo ─────────────────────────────────────
function UniSeal({ uni, size = 56, hovered = false, isOpen = false }) {
  if (uni.logo) {
    return (
      <img
        src={uni.logo} alt={uni.short}
        style={{
          width: size, height: size, borderRadius: 14, objectFit: "contain",
          background: uni.bg, border: `1px solid ${uni.color}33`,
          flexShrink: 0,
        }}
      />
    );
  }

  const letters = uni.short.slice(0, 3);
  return (
    <motion.div
      animate={hovered || isOpen ? {
        boxShadow: [`0 0 20px ${uni.glow}`, `0 0 36px ${uni.glow}, 0 0 60px ${uni.color}22`, `0 0 20px ${uni.glow}`],
      } : {
        boxShadow: `0 0 16px ${uni.glow}`,
      }}
      transition={{ duration: 2, repeat: hovered || isOpen ? Infinity : 0, ease: "easeInOut" }}
      style={{
        width: size, height: size, borderRadius: 14, flexShrink: 0,
        background: uni.bg,
        border: `1px solid ${(hovered || isOpen) ? uni.color + "66" : uni.color + "33"}`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
        transition: "border .3s",
      }}
    >
      {/* Decorative ring inside seal */}
      <div style={{
        position: "absolute", inset: 4, borderRadius: 10,
        border: `1px solid ${uni.color}${(hovered || isOpen) ? "44" : "22"}`,
        transition: "border .3s",
      }} />
      {/* Tiny top arc dots */}
      <div style={{
        position: "absolute", top: 7, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 2,
      }}>
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={(hovered || isOpen) ? { opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] } : { opacity: 0.4 }}
            transition={{ duration: 1.2, repeat: (hovered || isOpen) ? Infinity : 0, delay: i * 0.2 }}
            style={{ width: 2.5, height: 2.5, borderRadius: "50%", background: `${uni.color}66` }}
          />
        ))}
      </div>

      {/* Monogram */}
      <span style={{
        fontSize: size <= 48 ? 11 : 13,
        fontWeight: 900,
        color: uni.color,
        letterSpacing: letters.length > 2 ? "-.5px" : ".5px",
        textShadow: (hovered || isOpen) ? `0 0 18px ${uni.color}, 0 0 32px ${uni.color}88` : `0 0 10px ${uni.color}`,
        lineHeight: 1, zIndex: 1,
        transition: "text-shadow .35s",
      }}>
        {letters}
      </span>

      {/* Bottom est line */}
      <span style={{
        fontSize: 6.5, fontWeight: 700,
        color: (hovered || isOpen) ? `${uni.color}aa` : `${uni.color}66`,
        marginTop: 3, letterSpacing: ".05em", zIndex: 1,
        transition: "color .3s",
      }}>
        {uni.est.replace("Est. ", "")}
      </span>
    </motion.div>
  );
}

// ── University card ────────────────────────────────────────────
function UniCard({ uni, index, isOpen, onToggle }) {
  const { isMobile } = useBreakpoint();
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  // Magnetic cursor-following glow
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 160, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 160, damping: 20 });

  const handleMouseMove = (e) => {
    if (isMobile) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: .32, ease: [0.22, 1, .36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={onToggle}
      style={{
        borderRadius: 20, overflow: "hidden", cursor: "pointer",
        background: isOpen
          ? `linear-gradient(135deg, ${uni.bg}, rgba(255,255,255,.03))`
          : hovered ? "rgba(255,255,255,.055)" : "rgba(255,255,255,.03)",
        border: `1px solid ${isOpen ? uni.color + "66" : hovered ? uni.color + "44" : "rgba(255,255,255,.08)"}`,
        boxShadow: isOpen
          ? `0 0 50px ${uni.glow}, 0 12px 40px rgba(0,0,0,.35)`
          : hovered
          ? `0 0 30px ${uni.glow}, 0 8px 28px rgba(0,0,0,.25)`
          : "none",
        transition: "background .3s, border .3s, box-shadow .35s cubic-bezier(.22,1,.36,1)",
        position: "relative",
        willChange: "box-shadow",
      }}
    >
      {/* Magnetic cursor glow orb */}
      {!isMobile && (
        <motion.div
          style={{
            position: "absolute",
            width: 260, height: 260,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${uni.color}15 0%, transparent 70%)`,
            pointerEvents: "none",
            left: springX,
            top: springY,
            transform: "translate(-50%, -50%)",
            opacity: hovered ? 1 : 0,
            transition: "opacity .35s",
            zIndex: 0,
          }}
        />
      )}

      {/* Animated top border shimmer when open */}
      {isOpen && (
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          exit={{ scaleX: 0, opacity: 0 }}
          style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 2,
            background: `linear-gradient(90deg, transparent, ${uni.color}, transparent)`,
            boxShadow: `0 0 12px ${uni.color}`,
            transformOrigin: "left",
            zIndex: 1,
          }}
        />
      )}

      {/* Card top */}
      <div style={{
        padding: `clamp(14px, 3.5vw, 18px) clamp(14px, 3.5vw, 20px)`,
        display: "flex", alignItems: "center",
        gap: "clamp(10px, 3vw, 14px)",
        position: "relative", zIndex: 1,
      }}>
        <UniSeal uni={uni} size={isMobile ? 44 : 54} hovered={hovered} isOpen={isOpen} />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Tag pill */}
          <motion.div
            whileHover={{ scale: 1.06 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "2px 8px", borderRadius: 10, marginBottom: 5,
              background: uni.bg, border: `1px solid ${uni.color}${(hovered || isOpen) ? "55" : "33"}`,
              boxShadow: (hovered || isOpen) ? `0 0 12px ${uni.glow}` : "none",
              transition: "all .3s",
            }}
          >
            <span style={{
              fontSize: "clamp(8px, 2vw, 9px)", fontWeight: 700,
              color: uni.color, textTransform: "uppercase", letterSpacing: ".08em",
            }}>
              {uni.tag}
            </span>
          </motion.div>

          <p style={{
            fontSize: "clamp(12px, 3.2vw, 13px)", fontWeight: 700,
            color: "rgba(255,255,255,.88)", lineHeight: 1.35, marginBottom: 2,
            textShadow: (hovered || isOpen) ? `0 0 24px ${uni.color}55` : "none",
            transition: "text-shadow .35s",
            wordBreak: "break-word",
          }}>
            {uni.name}
          </p>
          <p style={{ fontSize: "clamp(10px, 2.5vw, 11px)", color: "rgba(255,255,255,.3)" }}>
            {uni.short} · {uni.est}
          </p>
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: .3, ease: [0.22, 1, .36, 1] }}
          style={{ flexShrink: 0 }}
        >
          <ChevronDown
            size={isMobile ? 14 : 16}
            style={{
              color: isOpen ? uni.color : hovered ? `${uni.color}aa` : "rgba(255,255,255,.25)",
              transition: "color .3s",
              filter: isOpen ? `drop-shadow(0 0 6px ${uni.color})` : "none",
            }}
          />
        </motion.div>
      </div>

      {/* Expandable panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: .32, ease: [0.22, 1, .36, 1] }}
            style={{ overflow: "hidden", position: "relative", zIndex: 1 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              padding: `0 clamp(14px, 3.5vw, 20px) clamp(14px, 3.5vw, 20px)`,
              borderTop: `1px solid ${uni.color}22`,
            }}>

              {/* Semester chips */}
              <div style={{ paddingTop: 14, marginBottom: 16 }}>
                <p style={{
                  fontSize: "clamp(9px, 2.2vw, 10px)", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: ".1em",
                  color: "rgba(255,255,255,.25)", marginBottom: 8,
                }}>
                  Available semesters
                </p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {uni.semesters.map((s, i) => (
                    <motion.div
                      key={s}
                      initial={{ opacity: 0, scale: .8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04, duration: .22 }}
                      whileHover={{ scale: 1.1, boxShadow: `0 0 14px ${uni.glow}` }}
                      style={{
                        padding: "3px 10px", borderRadius: 8,
                        background: uni.bg, border: `1px solid ${uni.color}33`,
                        fontSize: "clamp(10px, 2.5vw, 11px)", fontWeight: 700, color: uni.color,
                        cursor: "default",
                        transition: "box-shadow .2s",
                      }}
                    >
                      {s}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{
                display: "flex",
                gap: 10,
                flexDirection: isMobile ? "column" : "row",
              }}>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: .96 }}
                  onClick={() => window.open(uni.result_url, "_blank")}
                  style={{
                    flex: isMobile ? undefined : 1,
                    width: isMobile ? "100%" : undefined,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    padding: isMobile ? "12px 0" : "11px 0", borderRadius: 12,
                    background: `linear-gradient(135deg, ${uni.color}, ${uni.color}99)`,
                    border: "none", color: "#fff",
                    fontSize: "clamp(12px, 3vw, 13px)", fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit",
                    boxShadow: `0 4px 22px ${uni.glow}`,
                    transition: "box-shadow .25s, transform .15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = `0 6px 32px ${uni.glow}, 0 0 50px ${uni.color}22`}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = `0 4px 22px ${uni.glow}`}
                >
                  <Trophy size={isMobile ? 12 : 13} /> Check My Result
                  <ExternalLink size={isMobile ? 10 : 11} style={{ opacity: .7 }} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: .96 }}
                  onClick={() => window.open(uni.archive_url, "_blank")}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : undefined,
                    gap: 6,
                    padding: isMobile ? "11px 0" : "11px 16px",
                    width: isMobile ? "100%" : undefined,
                    borderRadius: 12,
                    background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
                    color: "rgba(255,255,255,.5)",
                    fontSize: "clamp(11px, 2.8vw, 12px)", fontWeight: 600,
                    cursor: "pointer", fontFamily: "inherit", transition: "all .22s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.1)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,.2)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.05)"; e.currentTarget.style.color = "rgba(255,255,255,.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.1)"; }}
                >
                  <Archive size={isMobile ? 12 : 13} /> Archive
                </motion.button>
              </div>

              <p style={{
                fontSize: "clamp(9px, 2.2vw, 10px)",
                color: "rgba(255,255,255,.18)", marginTop: 10, textAlign: "center",
              }}>
                Opens official portal · use browser print to save PDF
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Page ───────────────────────────────────────────────────────
export default function ResultsPage() {
  const { isMobile, isTablet } = useBreakpoint();
  const [selected, setSelected] = useState(null);

  const toggle = (short) => setSelected(prev => prev === short ? null : short);

  // Responsive grid: 2-col on desktop, 1-col on tablet/mobile
  const gridCols = isMobile || isTablet ? "1fr" : "repeat(auto-fill, minmax(340px, 1fr))";

  return (
    <AppShell>
      <AmbientOrbs />
      <div style={{
        padding: `clamp(20px, 5vw, 32px) clamp(14px, 5vw, 28px)`,
        maxWidth: 900,
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
      }}>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex", alignItems: "center",
            gap: "clamp(8px, 3vw, 12px)",
            marginBottom: 20, flexWrap: "wrap",
          }}
        >
          <motion.div
            whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
            transition={{ duration: .5 }}
            style={{
              width: "clamp(34px, 8vw, 40px)", height: "clamp(34px, 8vw, 40px)",
              borderRadius: 12, flexShrink: 0,
              background: "rgba(167,139,250,.15)", border: "1px solid rgba(167,139,250,.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 24px rgba(167,139,250,.25)",
            }}
          >
            <Trophy size={isMobile ? 15 : 18} style={{ color: "#a78bfa" }} />
          </motion.div>
          <h1 style={{
            fontSize: "clamp(19px, 5.5vw, 26px)", fontWeight: 800,
            background: "linear-gradient(135deg,#fff 0%,#c4b5fd 50%,#818cf8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Results Portal
          </h1>
        </motion.div>

        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .07 }}
          style={{
            display: "flex", alignItems: "flex-start", gap: "clamp(8px, 2.5vw, 10px)",
            padding: "clamp(10px, 3vw, 12px) clamp(12px, 3.5vw, 18px)",
            borderRadius: 14, marginBottom: 28,
            background: "rgba(251,191,36,.07)", border: "1px solid rgba(251,191,36,.2)",
            boxShadow: "0 0 28px rgba(251,191,36,.07)",
          }}
        >
          <ShieldAlert size={isMobile ? 13 : 14} style={{ color: "#fbbf24", flexShrink: 0, marginTop: 1 }} />
          <p style={{
            fontSize: "clamp(11px, 3vw, 12px)", color: "rgba(251,191,36,.85)",
            lineHeight: 1.55,
          }}>
            Results open on the official university portal. We never store your registration number.
          </p>
        </motion.div>

        {/* University grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: gridCols,
          gap: "clamp(8px, 2.5vw, 12px)",
        }}>
          {UNIVERSITIES.map((uni, i) => (
            <UniCard
              key={uni.short} uni={uni} index={i}
              isOpen={selected === uni.short}
              onToggle={() => toggle(uni.short)}
            />
          ))}
        </div>
      </div>

      <style>{`
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: .01ms !important; transition-duration: .01ms !important; }
        }
      `}</style>
    </AppShell>
  );
}