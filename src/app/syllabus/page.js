// src/app/syllabus/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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

// ── Reusable cinematic option card ──
function OptionCard({ icon: Icon, title, subtitle, onClick, index = 0, badge }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "18px 18px",
        borderRadius: 16,
        background: "rgba(255,255,255,.04)",
        border: "1px solid rgba(255,255,255,.08)",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "inherit",
        width: "100%",
        transition: "border-color .2s, box-shadow .2s, background .2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(124,58,237,.5)";
        e.currentTarget.style.boxShadow = "0 0 24px rgba(124,58,237,.18)";
        e.currentTarget.style.background = "rgba(124,58,237,.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,.08)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.background = "rgba(255,255,255,.04)";
      }}
    >
      {Icon && (
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 11,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg,rgba(124,58,237,.25),rgba(91,33,182,.25))",
            border: "1px solid rgba(167,139,250,.25)",
          }}
        >
          <Icon size={19} style={{ color: "#c4b5fd" }} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14.5, fontWeight: 700, color: "#fff", marginBottom: subtitle ? 2 : 0 }}>
          {title}
        </p>
        {subtitle && (
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>{subtitle}</p>
        )}
      </div>
      {badge && (
        <span
          style={{
            fontSize: 11, fontWeight: 600, color: "#a78bfa",
            background: "rgba(124,58,237,.14)", border: "1px solid rgba(124,58,237,.3)",
            borderRadius: 20, padding: "3px 10px", flexShrink: 0,
          }}
        >
          {badge}
        </span>
      )}
      <ChevronRight size={16} style={{ color: "rgba(255,255,255,.25)", flexShrink: 0 }} />
    </motion.button>
  );
}

// ── Breadcrumb stepper ──
function Breadcrumb({ steps, onJump }) {
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            onClick={() => s.clickable && onJump(i)}
            style={{
              fontSize: 12.5,
              fontWeight: i === steps.length - 1 ? 700 : 500,
              color: i === steps.length - 1 ? "#fff" : "rgba(255,255,255,.4)",
              background: "none",
              border: "none",
              cursor: s.clickable ? "pointer" : "default",
              padding: "4px 6px",
              borderRadius: 6,
              fontFamily: "inherit",
              transition: "color .15s, background .15s",
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
          </button>
          {i < steps.length - 1 && (
            <ChevronRight size={13} style={{ color: "rgba(255,255,255,.2)" }} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function SyllabusPage() {
  const router = useRouter();

  const [step, setStep] = useState(0); // 0 university, 1 semester, 2 branch, 3 subject, 4 content
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

  // Step 2: load branches when entering branch step
  useEffect(() => {
    if (step !== 2 || !university) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("branches")
        .select("*")
        .eq("university_id", university.id)
        .order("name");
      setBranches(data || []);
      setLoading(false);
    };
    load();
  }, [step, university]);

  // Step 3: load subjects when entering subject step
  useEffect(() => {
    if (step !== 3 || !university || !semester) return;
    const load = async () => {
      setLoading(true);
      let query = supabase
        .from("syllabus_subjects")
        .select("*")
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
  const selectSemester = (s) => {
    setSemester(s); setBranch(null);
    setStep(s <= 2 ? 3 : 2); // skip branch step for common semesters
  };
  const selectBranch = (b) => { setBranch(b); setStep(3); };
  const selectSubject = (s) => { setSubject(s); setStep(4); };

  const jumpTo = (i) => {
    if (i === 0) { setStep(0); }
    else if (i === 1) { setStep(1); }
    else if (i === 2) { setStep(isCommonSemester ? 1 : 2); }
    else if (i === 3) { setStep(3); }
  };

  const crumbs = [{ label: "University", clickable: true }];
  if (university) crumbs.push({ label: university.code, clickable: true });
  if (semester) crumbs.push({ label: `Sem ${semester}`, clickable: true });
  if (!isCommonSemester && branch) crumbs.push({ label: branch.code, clickable: true });
  if (subject) crumbs.push({ label: subject.subject_code || "Subject", clickable: false });

  return (
    <AppShell>
      <div style={{ padding: "32px 28px 60px", maxWidth: 880, margin: "0 auto" }}>
        <motion.h1
          initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: 26, fontWeight: 800, marginBottom: 22,
            background: "linear-gradient(135deg,#fff 0%,#c4b5fd 50%,#818cf8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}
        >
          Syllabus
        </motion.h1>

        <Breadcrumb steps={crumbs} onJump={jumpTo} />

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,.4)", fontSize: 13, padding: "30px 0" }}>
            <Loader2 size={16} style={{ animation: "spin .8s linear infinite" }} /> Loading...
          </div>
        )}

        {!loading && (
          <AnimatePresence mode="wait">

            {/* STEP 0 — University */}
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {universities.length === 0 ? (
                  <EmptyState text="No universities added yet." />
                ) : (
                  universities.map((u, i) => (
                    <OptionCard
                      key={u.id}
                      icon={GraduationCap}
                      title={u.name}
                      subtitle={u.code}
                      index={i}
                      onClick={() => selectUniversity(u)}
                    />
                  ))
                )}
              </motion.div>
            )}

            {/* STEP 1 — Semester */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}
              >
                {SEMESTERS.map((s, i) => (
                  <motion.button
                    key={s}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={{ y: -3, scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={() => selectSemester(s)}
                    style={{
                      padding: "26px 0", borderRadius: 16, textAlign: "center",
                      background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
                      cursor: "pointer", fontFamily: "inherit", transition: "all .2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(124,58,237,.5)";
                      e.currentTarget.style.boxShadow = "0 0 24px rgba(124,58,237,.2)";
                      e.currentTarget.style.background = "rgba(124,58,237,.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,.08)";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.background = "rgba(255,255,255,.04)";
                    }}
                  >
                    <p style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 3 }}>{s}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,.35)", textTransform: "uppercase", letterSpacing: ".06em" }}>
                      Semester
                    </p>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* STEP 2 — Branch */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {branches.length === 0 ? (
                  <EmptyState text="No branches added for this university yet." />
                ) : (
                  branches.map((b, i) => (
                    <OptionCard
                      key={b.id}
                      icon={Layers}
                      title={b.name}
                      subtitle={b.code}
                      index={i}
                      onClick={() => selectBranch(b)}
                    />
                  ))
                )}
              </motion.div>
            )}

            {/* STEP 3 — Subject */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {isCommonSemester && (
                  <div style={{
                    fontSize: 12, color: "#a78bfa", background: "rgba(124,58,237,.1)",
                    border: "1px solid rgba(124,58,237,.25)", borderRadius: 10,
                    padding: "8px 12px", marginBottom: 6, display: "inline-block", width: "fit-content",
                  }}>
                    Common syllabus for all branches in Semester {semester}
                  </div>
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
              <motion.div key="s4" initial={{ opacity: 0, y: 10, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -8 }}>
                <div
                  style={{
                    background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
                    borderRadius: 20, padding: "28px 26px", marginBottom: 16,
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
                    <div>
                      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
                        {subject.subject_name}
                      </h2>
                      <p style={{ fontSize: 12.5, color: "rgba(255,255,255,.4)" }}>
                        {subject.subject_code}{subject.credits ? ` · ${subject.credits} credits` : ""}
                      </p>
                    </div>
                    {subject.pdf_url && (
                      <motion.a
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                        href={subject.pdf_url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "flex", alignItems: "center", gap: 7,
                          fontSize: 13, fontWeight: 700, padding: "10px 16px",
                          borderRadius: 11, color: "#fff", textDecoration: "none",
                          background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
                          boxShadow: "0 4px 18px rgba(124,58,237,.4)",
                          transition: "box-shadow .2s", flexShrink: 0,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 6px 24px rgba(124,58,237,.6)"}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 4px 18px rgba(124,58,237,.4)"}
                      >
                        <Download size={15} /> Download PDF
                      </motion.a>
                    )}
                  </div>

                  {Array.isArray(subject.units) && subject.units.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {subject.units.map((unit, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          style={{
                            borderLeft: "2px solid rgba(124,58,237,.4)",
                            paddingLeft: 16,
                          }}
                        >
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#c4b5fd", marginBottom: 6 }}>
                            {unit.title}
                          </p>
                          <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                            {(unit.topics || []).map((topic, j) => (
                              <li key={j} style={{ fontSize: 13, color: "rgba(255,255,255,.6)", lineHeight: 1.5 }}>
                                {topic}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,.35)", fontSize: 13 }}>
                      <FileText size={16} />
                      Detailed unit breakdown not added yet — use the PDF above.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Back button */}
        {step > 0 && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => jumpTo(
              step === 4 ? 3 : step === 3 ? (isCommonSemester ? 1 : 2) : step === 2 ? 1 : 0
            )}
            style={{
              display: "flex", alignItems: "center", gap: 6, marginTop: 26,
              fontSize: 13, color: "rgba(255,255,255,.4)", background: "none",
              border: "none", cursor: "pointer", fontFamily: "inherit", padding: "6px 4px",
              transition: "color .15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#c4b5fd"}
            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,.4)"}
          >
            <ArrowLeft size={14} /> Back
          </motion.button>
        )}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </AppShell>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{
      textAlign: "center", padding: "44px 0", color: "rgba(255,255,255,.25)", fontSize: 13.5,
      border: "1px dashed rgba(255,255,255,.1)", borderRadius: 16,
    }}>
      {text}
    </div>
  );
}