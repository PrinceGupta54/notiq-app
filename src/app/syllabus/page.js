// src/app/syllabus/page.js
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  ChevronRight,
  GraduationCap,
  Layers,
  BookOpen,
  FileText,
  Download,
  Loader2,
} from "lucide-react";
import AppShell from "@/components/AppShell";

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

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
        animate={{ x: [0, 40, 0], y: [0, -32, 0], scale: [1, 1.14, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", top: "7%", left: "3%",
          width: "clamp(180px, 30vw, 340px)", height: "clamp(180px, 30vw, 340px)",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,.07) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        style={{
          position: "absolute", bottom: "12%", right: "5%",
          width: "clamp(140px, 24vw, 270px)", height: "clamp(140px, 24vw, 270px)",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(129,140,248,.06) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <motion.div
        animate={{ x: [0, 18, -18, 0], y: [0, 26, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 9 }}
        style={{
          position: "absolute", top: "45%", left: "42%",
          width: "clamp(110px, 19vw, 210px)", height: "clamp(110px, 19vw, 210px)",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(167,139,250,.05) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />
    </div>
  );
}

// ── Reusable cinematic option card ──
function OptionCard({ icon: Icon, title, subtitle, onClick, index = 0, badge }) {
  const { isMobile } = useBreakpoint();
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 180, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 180, damping: 22 });

  const handleMouseMove = (e) => {
    if (isMobile) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.button
      ref={cardRef}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); mouseX.set(0); mouseY.set(0); }}
      onMouseMove={handleMouseMove}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "clamp(10px, 3vw, 14px)",
        padding: "clamp(14px, 3.5vw, 18px)",
        borderRadius: 16,
        background: hovered ? "rgba(124,58,237,.08)" : "rgba(255,255,255,.04)",
        border: `1px solid ${hovered ? "rgba(124,58,237,.5)" : "rgba(255,255,255,.08)"}`,
        boxShadow: hovered
          ? "0 0 32px rgba(124,58,237,.22), 0 8px 24px rgba(0,0,0,.2)"
          : "none",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "inherit",
        width: "100%",
        transition: "border-color .25s, box-shadow .3s cubic-bezier(.22,1,.36,1), background .25s",
        position: "relative",
        overflow: "hidden",
        willChange: "box-shadow",
      }}
    >
      {/* Magnetic cursor glow */}
      {!isMobile && (
        <motion.div
          style={{
            position: "absolute",
            width: 220, height: 220,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,.12) 0%, transparent 70%)",
            pointerEvents: "none",
            left: springX,
            top: springY,
            transform: "translate(-50%, -50%)",
            opacity: hovered ? 1 : 0,
            transition: "opacity .3s",
            zIndex: 0,
          }}
        />
      )}

      {Icon && (
        <motion.div
          animate={hovered ? {
            boxShadow: [
              "0 0 0px rgba(167,139,250,0)",
              "0 0 20px rgba(167,139,250,.45)",
              "0 0 0px rgba(167,139,250,0)",
            ],
          } : {}}
          transition={{ duration: 1.6, repeat: hovered ? Infinity : 0, ease: "easeInOut" }}
          style={{
            width: "clamp(36px, 9vw, 42px)",
            height: "clamp(36px, 9vw, 42px)",
            borderRadius: 11,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg,rgba(124,58,237,.25),rgba(91,33,182,.25))",
            border: `1px solid ${hovered ? "rgba(167,139,250,.45)" : "rgba(167,139,250,.25)"}`,
            transition: "border .3s",
            position: "relative", zIndex: 1,
          }}
        >
          <Icon
            size={isMobile ? 16 : 19}
            style={{
              color: "#c4b5fd",
              filter: hovered ? "drop-shadow(0 0 6px rgba(167,139,250,.7))" : "none",
              transition: "filter .3s",
            }}
          />
        </motion.div>
      )}

      <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>
        <p style={{
          fontSize: "clamp(13px, 3.5vw, 14.5px)",
          fontWeight: 700,
          color: hovered ? "#fff" : "rgba(255,255,255,.9)",
          marginBottom: subtitle ? 2 : 0,
          textShadow: hovered ? "0 0 20px rgba(167,139,250,.4)" : "none",
          transition: "text-shadow .3s, color .25s",
          wordBreak: "break-word",
        }}>
          {title}
        </p>
        {subtitle && (
          <p style={{
            fontSize: "clamp(11px, 2.8vw, 12px)",
            color: hovered ? "rgba(255,255,255,.55)" : "rgba(255,255,255,.4)",
            transition: "color .25s",
          }}>
            {subtitle}
          </p>
        )}
      </div>

      {badge && (
        <span style={{
          fontSize: "clamp(10px, 2.5vw, 11px)", fontWeight: 600, color: "#a78bfa",
          background: "rgba(124,58,237,.14)", border: "1px solid rgba(124,58,237,.3)",
          borderRadius: 20, padding: "3px 10px", flexShrink: 0,
          position: "relative", zIndex: 1,
          boxShadow: hovered ? "0 0 14px rgba(124,58,237,.3)" : "none",
          transition: "box-shadow .3s",
        }}>
          {badge}
        </span>
      )}

      <motion.div
        animate={{ x: hovered ? 3 : 0 }}
        transition={{ duration: .2 }}
        style={{ position: "relative", zIndex: 1, flexShrink: 0 }}
      >
        <ChevronRight
          size={isMobile ? 14 : 16}
          style={{
            color: hovered ? "rgba(167,139,250,.7)" : "rgba(255,255,255,.25)",
            transition: "color .25s",
          }}
        />
      </motion.div>
    </motion.button>
  );
}

// ── Breadcrumb stepper ──
function Breadcrumb({ steps, onJump }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", flexWrap: "wrap",
      gap: "clamp(4px, 1.5vw, 6px)",
      marginBottom: 24,
      overflowX: "auto", scrollbarWidth: "none",
    }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "clamp(4px, 1.5vw, 6px)", flexShrink: 0 }}>
          <motion.button
            whileHover={s.clickable ? { scale: 1.05 } : {}}
            whileTap={s.clickable ? { scale: .95 } : {}}
            onClick={() => s.clickable && onJump(i)}
            style={{
              fontSize: "clamp(11px, 2.8vw, 12.5px)",
              fontWeight: i === steps.length - 1 ? 700 : 500,
              color: i === steps.length - 1 ? "#fff" : "rgba(255,255,255,.4)",
              background: "none", border: "none",
              cursor: s.clickable ? "pointer" : "default",
              padding: "4px 6px", borderRadius: 6,
              fontFamily: "inherit",
              transition: "color .15s, background .15s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              if (s.clickable) {
                e.currentTarget.style.color = "#c4b5fd";
                e.currentTarget.style.background = "rgba(124,58,237,.1)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = i === steps.length - 1 ? "#fff" : "rgba(255,255,255,.4)";
              e.currentTarget.style.background = "none";
            }}
          >
            {s.label}
          </motion.button>
          {i < steps.length - 1 && (
            <ChevronRight size={13} style={{ color: "rgba(255,255,255,.2)", flexShrink: 0 }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Semester button ────────────────────────────────────────────
function SemButton({ s, index, onClick }) {
  const { isMobile } = useBreakpoint();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: isMobile ? "18px 0" : "26px 0",
        borderRadius: 16, textAlign: "center",
        background: hovered ? "rgba(124,58,237,.12)" : "rgba(255,255,255,.04)",
        border: `1px solid ${hovered ? "rgba(124,58,237,.55)" : "rgba(255,255,255,.08)"}`,
        boxShadow: hovered
          ? "0 0 28px rgba(124,58,237,.28), 0 8px 24px rgba(0,0,0,.2)"
          : "none",
        cursor: "pointer", fontFamily: "inherit",
        transition: "all .28s cubic-bezier(.22,1,.36,1)",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Inner glow burst on hover */}
      <motion.div
        animate={hovered
          ? { opacity: [0, .5, 0], scale: [0.4, 1.4, 0.4] }
          : { opacity: 0 }
        }
        transition={{ duration: 1.4, repeat: hovered ? Infinity : 0, ease: "easeInOut" }}
        style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(circle at center, rgba(124,58,237,.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <p style={{
        fontSize: isMobile ? "clamp(18px, 5vw, 24px)" : 24,
        fontWeight: 800,
        color: hovered ? "#fff" : "rgba(255,255,255,.9)",
        marginBottom: 3,
        textShadow: hovered ? "0 0 22px rgba(167,139,250,.7)" : "none",
        transition: "text-shadow .3s, color .25s",
        position: "relative", zIndex: 1,
      }}>
        {s}
      </p>
      <p style={{
        fontSize: "clamp(9px, 2.2vw, 11px)",
        color: hovered ? "rgba(167,139,250,.8)" : "rgba(255,255,255,.35)",
        textTransform: "uppercase", letterSpacing: ".06em",
        transition: "color .25s",
        position: "relative", zIndex: 1,
      }}>
        Semester
      </p>
    </motion.button>
  );
}

// ── Unit row ──────────────────────────────────────────────────
function UnitRow({ unit, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderLeft: `2px solid ${hovered ? "rgba(124,58,237,.8)" : "rgba(124,58,237,.4)"}`,
        paddingLeft: "clamp(12px, 3vw, 16px)",
        paddingTop: 4,
        paddingBottom: 4,
        transition: "border-color .3s",
      }}
    >
      <p style={{
        fontSize: "clamp(13px, 3.2vw, 14px)", fontWeight: 700,
        color: hovered ? "#d8b4fe" : "#c4b5fd",
        marginBottom: 6,
        textShadow: hovered ? "0 0 18px rgba(167,139,250,.5)" : "none",
        transition: "color .3s, text-shadow .3s",
      }}>
        {unit.title}
      </p>
      <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
        {(unit.topics || []).map((topic, j) => (
          <motion.li
            key={j}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.06 + j * 0.03 }}
            style={{
              fontSize: "clamp(12px, 3vw, 13px)",
              color: hovered ? "rgba(255,255,255,.72)" : "rgba(255,255,255,.6)",
              lineHeight: 1.55,
              transition: "color .25s",
            }}
          >
            {topic}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function SyllabusPage() {
  const router = useRouter();
  const { isMobile, isTablet } = useBreakpoint();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [universities, setUniversities] = useState([]);
  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [university, setUniversity] = useState(null);
  const [semester, setSemester] = useState(null);
  const [branch, setBranch] = useState(null);
  const [subject, setSubject] = useState(null);

  const isCommonSemester = semester === 1 || semester === 2;

  // Auth check
  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push("/login");
    };
    check();
  }, [router]);

  // Step 0: load universities
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.from("universities").select("*").order("name");
      setUniversities(data || []);
      setLoading(false);
    };
    load();
  }, []);

  // Step 2: load branches
  useEffect(() => {
    if (step !== 2 || !university) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("branches").select("*")
        .eq("university_id", university.id).order("name");
      setBranches(data || []);
      setLoading(false);
    };
    load();
  }, [step, university]);

  // Step 3: load subjects
  useEffect(() => {
    if (step !== 3 || !university || !semester) return;
    const load = async () => {
      setLoading(true);
      let query = supabase
        .from("syllabus_subjects").select("*")
        .eq("university_id", university.id)
        .eq("semester", semester);
      query = isCommonSemester ? query.is("branch_id", null) : query.eq("branch_id", branch?.id);
      const { data } = await query.order("subject_name");
      setSubjects(data || []);
      setLoading(false);
    };
    load();
  }, [step, university, semester, branch, isCommonSemester]);

  const selectUniversity = (u) => { setUniversity(u); setSemester(null); setBranch(null); setStep(1); };
  const selectSemester = (s) => { setSemester(s); setBranch(null); setStep(s <= 2 ? 3 : 2); };
  const selectBranch = (b) => { setBranch(b); setStep(3); };
  const selectSubject = (s) => { setSubject(s); setStep(4); };

  const jumpTo = (i) => {
    if (i === 0) setStep(0);
    else if (i === 1) setStep(1);
    else if (i === 2) setStep(isCommonSemester ? 1 : 2);
    else if (i === 3) setStep(3);
  };

  const crumbs = [{ label: "University", clickable: true }];
  if (university) crumbs.push({ label: university.code, clickable: true });
  if (semester) crumbs.push({ label: `Sem ${semester}`, clickable: true });
  if (!isCommonSemester && branch) crumbs.push({ label: branch.code, clickable: true });
  if (subject) crumbs.push({ label: subject.subject_code || "Subject", clickable: false });

  const semCols = isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)";

  return (
    <AppShell>
      <AmbientOrbs />
      <div style={{
        padding: `clamp(20px, 5vw, 32px) clamp(14px, 5vw, 28px) clamp(40px, 8vw, 60px)`,
        maxWidth: 900,
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: "clamp(19px, 5.5vw, 26px)", fontWeight: 800, marginBottom: 22,
            background: "linear-gradient(135deg,#fff 0%,#c4b5fd 50%,#818cf8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}
        >
          Syllabus
        </motion.h1>

        <Breadcrumb steps={crumbs} onJump={jumpTo} />

        {/* Loading */}
        {loading && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            color: "rgba(255,255,255,.4)", fontSize: 13, padding: "30px 0",
          }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: .8, repeat: Infinity, ease: "linear" }}>
              <Loader2 size={16} />
            </motion.div>
            Loading…
          </div>
        )}

        {!loading && (
          <AnimatePresence mode="wait">

            {/* STEP 0 — University */}
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {universities.length === 0 ? (
                  <EmptyState text="No universities added yet." />
                ) : (
                  universities.map((u, i) => (
                    <OptionCard key={u.id} icon={GraduationCap} title={u.name} subtitle={u.code} index={i} onClick={() => selectUniversity(u)} />
                  ))
                )}
              </motion.div>
            )}

            {/* STEP 1 — Semester */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                style={{ display: "grid", gridTemplateColumns: semCols, gap: "clamp(8px, 2.5vw, 12px)" }}
              >
                {SEMESTERS.map((s, i) => (
                  <SemButton key={s} s={s} index={i} onClick={() => selectSemester(s)} />
                ))}
              </motion.div>
            )}

            {/* STEP 2 — Branch */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {branches.length === 0 ? (
                  <EmptyState text="No branches added for this university yet." />
                ) : (
                  branches.map((b, i) => (
                    <OptionCard key={b.id} icon={Layers} title={b.name} subtitle={b.code} index={i} onClick={() => selectBranch(b)} />
                  ))
                )}
              </motion.div>
            )}

            {/* STEP 3 — Subject */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {isCommonSemester && (
                  <motion.div
                    initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }}
                    style={{
                      fontSize: "clamp(11px, 2.8vw, 12px)", color: "#a78bfa",
                      background: "rgba(124,58,237,.1)",
                      border: "1px solid rgba(124,58,237,.25)", borderRadius: 10,
                      padding: "8px 12px", marginBottom: 6,
                      display: "inline-block", width: "fit-content",
                      boxShadow: "0 0 18px rgba(124,58,237,.12)",
                    }}
                  >
                    Common syllabus for all branches in Semester {semester}
                  </motion.div>
                )}
                {subjects.length === 0 ? (
                  <EmptyState text="Syllabus for this semester hasn't been added yet." />
                ) : (
                  subjects.map((s, i) => (
                    <OptionCard
                      key={s.id}
                      icon={BookOpen}
                      title={s.subject_name}
                      subtitle={s.subject_code ? `${s.subject_code}${s.credits ? ` · ${s.credits} credits` : ""}` : null}
                      index={i}
                      onClick={() => selectSubject(s)}
                    />
                  ))
                )}
              </motion.div>
            )}

            {/* STEP 4 — Content */}
            {step === 4 && subject && (
              <motion.div
                key="s4"
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8 }}
              >
                <motion.div
                  whileHover={{
                    boxShadow: "0 0 40px rgba(124,58,237,.18), 0 8px 32px rgba(0,0,0,.25)",
                    borderColor: "rgba(124,58,237,.3)",
                  }}
                  style={{
                    background: "rgba(255,255,255,.04)",
                    border: "1px solid rgba(255,255,255,.08)",
                    borderRadius: 20,
                    padding: "clamp(18px, 4.5vw, 28px) clamp(16px, 4vw, 26px)",
                    marginBottom: 16,
                    backdropFilter: "blur(12px)",
                    transition: "box-shadow .35s, border-color .35s",
                  }}
                >
                  {/* Subject header */}
                  <div style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 16, marginBottom: 20,
                    flexDirection: isMobile ? "column" : "row",
                    flexWrap: "wrap",
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <h2 style={{
                        fontSize: "clamp(16px, 4.5vw, 20px)", fontWeight: 800,
                        color: "#fff", marginBottom: 4, wordBreak: "break-word",
                      }}>
                        {subject.subject_name}
                      </h2>
                      <p style={{ fontSize: "clamp(11px, 2.8vw, 12.5px)", color: "rgba(255,255,255,.4)" }}>
                        {subject.subject_code}{subject.credits ? ` · ${subject.credits} credits` : ""}
                      </p>
                    </div>

                    {subject.pdf_url && (
                      <motion.a
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: .96 }}
                        href={subject.pdf_url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "flex", alignItems: "center", gap: 7,
                          fontSize: "clamp(12px, 3vw, 13px)", fontWeight: 700,
                          padding: isMobile ? "10px 14px" : "10px 16px",
                          borderRadius: 11, color: "#fff", textDecoration: "none",
                          background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
                          boxShadow: "0 4px 18px rgba(124,58,237,.4)",
                          transition: "box-shadow .2s",
                          flexShrink: 0,
                          width: isMobile ? "100%" : undefined,
                          justifyContent: isMobile ? "center" : undefined,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 6px 28px rgba(124,58,237,.65)"}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 4px 18px rgba(124,58,237,.4)"}
                      >
                        <Download size={isMobile ? 14 : 15} /> Download PDF
                      </motion.a>
                    )}
                  </div>

                  {/* Units */}
                  {Array.isArray(subject.units) && subject.units.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(12px, 3vw, 16px)" }}>
                      {subject.units.map((unit, i) => (
                        <UnitRow key={i} unit={unit} index={i} />
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        color: "rgba(255,255,255,.35)",
                        fontSize: "clamp(12px, 3vw, 13px)",
                      }}
                    >
                      <FileText size={16} />
                      Detailed unit breakdown not added yet — use the PDF above.
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Back button */}
        {step > 0 && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            whileHover={{ x: -3 }}
            onClick={() => jumpTo(
              step === 4 ? 3 : step === 3 ? (isCommonSemester ? 1 : 2) : step === 2 ? 1 : 0
            )}
            style={{
              display: "flex", alignItems: "center", gap: 6, marginTop: 26,
              fontSize: "clamp(12px, 3vw, 13px)", color: "rgba(255,255,255,.4)",
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "inherit", padding: "6px 4px",
              transition: "color .15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#c4b5fd"}
            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,.4)"}
          >
            <ArrowLeft size={isMobile ? 13 : 14} /> Back
          </motion.button>
        )}
      </div>

      <style>{`
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        div::-webkit-scrollbar { display: none; }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: .01ms !important; transition-duration: .01ms !important; }
        }
      `}</style>
    </AppShell>
  );
}

function EmptyState({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{
        textAlign: "center",
        padding: "clamp(32px, 8vw, 44px) 0",
        color: "rgba(255,255,255,.25)",
        fontSize: "clamp(12px, 3.2vw, 13.5px)",
        border: "1px dashed rgba(255,255,255,.1)", borderRadius: 16,
      }}
    >
      {text}
    </motion.div>
  );
}