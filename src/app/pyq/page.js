// src/app/pyq/page.js
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
  Eye,
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

export default function PyqPage() {
  const router = useRouter();

  const [step, setStep] = useState(0); // 0 university, 1 semester, 2 branch, 3 subject, 4 papers
  const [loading, setLoading] = useState(false);

  const [universities, setUniversities] = useState([]);
  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState([]); // distinct subject names
  const [papers, setPapers] = useState([]);

  const [university, setUniversity] = useState(null);
  const [semester, setSemester] = useState(null);
  const [branch, setBranch] = useState(null);
  const [subject, setSubject] = useState(null); // { subject_name, subject_code }

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
        .from("branches")
        .select("*")
        .eq("university_id", university.id)
        .order("name");
      setBranches(data || []);
      setLoading(false);
    };
    load();
  }, [step, university]);

  // Step 3: load distinct subjects for this uni/sem/branch
  useEffect(() => {
    if (step !== 3 || !university || !semester) return;
    const load = async () => {
      setLoading(true);
      let query = supabase
        .from("pyq_papers")
        .select("subject_name, subject_code")
        .eq("university_id", university.id)
        .eq("semester", semester);

      query = isCommonSemester ? query.is("branch_id", null) : query.eq("branch_id", branch?.id);

      const { data } = await query;
      const seen = new Map();
      (data || []).forEach((row) => {
        if (!seen.has(row.subject_name)) seen.set(row.subject_name, row);
      });
      setSubjects(Array.from(seen.values()).sort((a, b) => a.subject_name.localeCompare(b.subject_name)));
      setLoading(false);
    };
    load();
  }, [step, university, semester, branch, isCommonSemester]);

  // Step 4: load all papers for chosen subject
  useEffect(() => {
    if (step !== 4 || !university || !semester || !subject) return;
    const load = async () => {
      setLoading(true);
      let query = supabase
        .from("pyq_papers")
        .select("*")
        .eq("university_id", university.id)
        .eq("semester", semester)
        .eq("subject_name", subject.subject_name);

      query = isCommonSemester ? query.is("branch_id", null) : query.eq("branch_id", branch?.id);

      const { data } = await query.order("year", { ascending: false });
      setPapers(data || []);
      setLoading(false);
    };
    load();
  }, [step, university, semester, branch, subject, isCommonSemester]);

  const selectUniversity = (u) => { setUniversity(u); setSemester(null); setBranch(null); setStep(1); };
  const selectSemester = (s) => {
    setSemester(s); setBranch(null);
    setStep(s <= 2 ? 3 : 2);
  };
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
  if (subject) crumbs.push({ label: subject.subject_code || subject.subject_name, clickable: false });

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
          Previous Year Questions
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
                    <OptionCard key={u.id} icon={GraduationCap} title={u.name} subtitle={u.code} index={i} onClick={() => selectUniversity(u)} />
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
                    <OptionCard key={b.id} icon={Layers} title={b.name} subtitle={b.code} index={i} onClick={() => selectBranch(b)} />
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
                    Common subjects for all branches in Semester {semester}
                  </div>
                )}
                {subjects.length === 0 ? (
                  <EmptyState text="No PYQ papers added for this semester yet." />
                ) : (
                  subjects.map((s, i) => (
                    <OptionCard
                      key={s.subject_name}
                      icon={BookOpen}
                      title={s.subject_name}
                      subtitle={s.subject_code}
                      index={i}
                      onClick={() => selectSubject(s)}
                    />
                  ))
                )}
              </motion.div>
            )}

            {/* STEP 4 — Papers list */}
            {step === 4 && subject && (
              <motion.div key="s4" initial={{ opacity: 0, y: 10, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -8 }}>
                <div style={{ marginBottom: 18 }}>
                  <h2 style={{ fontSize: 19, fontWeight: 800, color: "#fff", marginBottom: 3 }}>
                    {subject.subject_name}
                  </h2>
                  {subject.subject_code && (
                    <p style={{ fontSize: 12.5, color: "rgba(255,255,255,.4)" }}>{subject.subject_code}</p>
                  )}
                </div>

                {papers.length === 0 ? (
                  <EmptyState text="No papers added for this subject yet." />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {papers.map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        style={{
                          display: "flex", alignItems: "center", gap: 14,
                          background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
                          borderRadius: 14, padding: "14px 16px",
                        }}
                      >
                        <div
                          style={{
                            width: 42, height: 42, borderRadius: 11, flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: "linear-gradient(135deg,rgba(124,58,237,.25),rgba(91,33,182,.25))",
                            border: "1px solid rgba(167,139,250,.25)",
                          }}
                        >
                          <FileText size={18} style={{ color: "#c4b5fd" }} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{p.year}</p>
                          {p.exam_type && (
                            <p style={{ fontSize: 11.5, color: "rgba(255,255,255,.4)" }}>{p.exam_type}</p>
                          )}
                        </div>

                        <motion.a
                          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                          href={p.pdf_url} target="_blank" rel="noopener noreferrer"
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,.7)",
                            background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)",
                            borderRadius: 9, padding: "8px 13px", textDecoration: "none",
                            transition: "all .2s",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.1)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.06)"; }}
                        >
                          <Eye size={14} /> View
                        </motion.a>

                        <motion.a
                          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                          href={p.pdf_url} download target="_blank" rel="noopener noreferrer"
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            fontSize: 12.5, fontWeight: 700, color: "#fff",
                            background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
                            borderRadius: 9, padding: "8px 13px", textDecoration: "none",
                            boxShadow: "0 3px 14px rgba(124,58,237,.4)",
                            transition: "box-shadow .2s",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 5px 20px rgba(124,58,237,.6)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 3px 14px rgba(124,58,237,.4)"; }}
                        >
                          <Download size={14} /> Download
                        </motion.a>
                      </motion.div>
                    ))}
                  </div>
                )}
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