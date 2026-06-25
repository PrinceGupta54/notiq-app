// src/app/notes/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import {
  Search, SlidersHorizontal, Download, Eye,
  Upload, FileText, CheckCircle2, AlertCircle,
  BookMarked, Share2, Sparkles, X
} from "lucide-react";

const COURSES = ["B.Tech Computer Science","B.Tech EE","B.Tech ME","B.Tech CE","B.Com","B.Sc","BA","BCA","MCA"];
const SEMESTERS = ["Semester 1","Semester 2","Semester 3","Semester 4","Semester 5","Semester 6","Semester 7","Semester 8"];

// ── Tiny helpers ──────────────────────────────────────────────
function inputStyle(focused) {
  return {
    width: "100%", padding: "11px 14px",
    background: focused ? "rgba(124,58,237,.08)" : "rgba(255,255,255,.04)",
    border: `1px solid ${focused ? "rgba(124,58,237,.55)" : "rgba(255,255,255,.1)"}`,
    borderRadius: 12, fontSize: 13, color: "rgba(255,255,255,.9)",
    outline: "none", fontFamily: "inherit",
    boxShadow: focused ? "0 0 0 3px rgba(124,58,237,.12)" : "none",
    transition: "all .2s", boxSizing: "border-box",
  };
}

function useFocus() {
  const [f, setF] = useState(false);
  return [f, { onFocus: () => setF(true), onBlur: () => setF(false) }];
}

function Label({ children }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: ".1em", color: "rgba(255,255,255,.3)", marginBottom: 8 }}>
      {children}
    </p>
  );
}

// ── Glass select ──────────────────────────────────────────────
function GlassSelect({ value, onChange, children, flex }) {
  const [f, fProps] = useFocus();
  return (
    <select value={value} onChange={onChange} {...fProps}
      style={{ ...inputStyle(f), flex: flex || undefined, width: flex ? undefined : "100%",
        cursor: "pointer", appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,.3)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
        paddingRight: 34,
      }}>
      {children}
    </select>
  );
}

// ── PDF note card ─────────────────────────────────────────────
function NoteCard({ note, onView, onDownload, downloading }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "16px 18px", borderRadius: 18,
        background: hovered ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.03)",
        border: `1px solid ${hovered ? "rgba(167,139,250,.25)" : "rgba(255,255,255,.07)"}`,
        boxShadow: hovered ? "0 0 28px rgba(167,139,250,.1)" : "none",
        transition: "all .25s",
      }}
    >
      {/* PDF badge */}
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: "rgba(239,68,68,.12)", border: "1px solid rgba(239,68,68,.25)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: hovered ? "0 0 16px rgba(239,68,68,.2)" : "none",
        transition: "box-shadow .25s",
      }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: "#f87171", letterSpacing: ".04em" }}>PDF</span>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,.88)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 3 }}>
          {note.title}
        </p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>
          {note.subject} · {note.course}
        </p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,.22)", marginTop: 2 }}>
          {note.semester} · {note.downloads} downloads
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: .93 }}
          onClick={() => onView(note)}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "7px 14px", borderRadius: 10,
            background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
            color: "rgba(255,255,255,.55)", fontSize: 12, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit", transition: "all .2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.1)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.05)"; e.currentTarget.style.color = "rgba(255,255,255,.55)"; }}
        >
          <Eye size={12} /> View
        </motion.button>

        <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: .93 }}
          onClick={() => onDownload(note)}
          disabled={downloading === note.id}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "7px 14px", borderRadius: 10,
            background: downloading === note.id ? "rgba(167,139,250,.1)" : "rgba(124,58,237,.18)",
            border: "1px solid rgba(124,58,237,.35)",
            color: "#c4b5fd", fontSize: 12, fontWeight: 600,
            cursor: downloading === note.id ? "wait" : "pointer",
            fontFamily: "inherit", transition: "all .2s",
            boxShadow: "0 0 14px rgba(124,58,237,.2)",
          }}
          onMouseEnter={e => { if (downloading !== note.id) { e.currentTarget.style.background = "rgba(124,58,237,.3)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(124,58,237,.4)"; }}}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(124,58,237,.18)"; e.currentTarget.style.boxShadow = "0 0 14px rgba(124,58,237,.2)"; }}
        >
          <Download size={12} />
          {downloading === note.id ? "Saving…" : "Download"}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function NotesPage() {
  const router = useRouter();
  const [tab, setTab]                   = useState("discover");
  const [userId, setUserId]             = useState(null);
  const [notes, setNotes]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filterCourse, setFilterCourse] = useState("");
  const [filterSem, setFilterSem]       = useState("");
  const [search, setSearch]             = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  // Upload form
  const [title, setTitle]     = useState("");
  const [subject, setSubject] = useState("");
  const [course, setCourse]   = useState(COURSES[0]);
  const [semester, setSemester] = useState(SEMESTERS[0]);
  const [file, setFile]       = useState(null);
  const [uploading, setUploading]     = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError]   = useState("");
  const [dragOver, setDragOver]         = useState(false);

  // Focus states
  const [titleF, titleFProps]     = [useState(false), {}];
  const [subjectF, subjectFProps] = [useState(false), {}];
  const [searchF, searchFProps]   = [useState(false), {}];

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setUserId(session.user.id);
      await fetchNotes();
    };
    init();
  }, [router]);

  const fetchNotes = async (c = "", s = "") => {
    setLoading(true);
    let q = supabase.from("notes").select("*").eq("status", "approved").order("created_at", { ascending: false });
    if (c) q = q.eq("course", c);
    if (s) q = q.eq("semester", s);
    const { data } = await q;
    setNotes(data || []);
    setLoading(false);
  };

  const handleFilterChange = (c, s) => { setFilterCourse(c); setFilterSem(s); fetchNotes(c, s); };

  const handleView = (note) => window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(note.file_url)}&embedded=false`, "_blank");

  const forceDownload = async (url, filename) => {
    try {
      const res  = await fetch(url);
      const blob = await res.blob();
      const burl = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = burl; a.download = filename || "note.pdf";
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(burl);
    } catch { window.open(url, "_blank"); }
  };

  const handleDownload = async (note) => {
    setDownloadingId(note.id);
    await supabase.from("notes").update({ downloads: note.downloads + 1 }).eq("id", note.id);
    setNotes(notes.map(n => n.id === note.id ? { ...n, downloads: n.downloads + 1 } : n));
    await forceDownload(note.file_url, `${note.title}.pdf`);
    setDownloadingId(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) { setUploadError("Please select a PDF file."); return; }
    if (file.type !== "application/pdf") { setUploadError("Only PDF files are allowed."); return; }
    if (file.size > 10 * 1024 * 1024) { setUploadError("File must be under 10MB."); return; }
    setUploading(true); setUploadError("");

    const filePath = `notes/${userId}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const { error: se } = await supabase.storage.from("notiq-files").upload(filePath, file);
    if (se) { setUploadError(se.message); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from("notiq-files").getPublicUrl(filePath);
    const { error: de } = await supabase.from("notes").insert({
      uploader_id: userId, title, subject, course, semester,
      file_path: filePath, file_url: urlData.publicUrl,
    });
    if (de) { setUploadError(de.message); setUploading(false); return; }

    setUploading(false); setUploadSuccess(true);
    setTitle(""); setSubject(""); setFile(null);
    setTimeout(() => setUploadSuccess(false), 4000);
  };

  const filtered = notes.filter(n =>
    !search || n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div style={{ padding: "32px 28px", maxWidth: 780, margin: "0 auto" }}>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: 26, fontWeight: 800, marginBottom: 28,
            background: "linear-gradient(135deg,#fff 0%,#c4b5fd 50%,#818cf8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}
        >
          Community Notes
        </motion.h1>

        {/* Tab pills */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .06 }}
          style={{ display: "flex", gap: 6, marginBottom: 28 }}
        >
          {[
            { key: "discover", label: "Discover", icon: BookMarked },
            { key: "share",    label: "Share",    icon: Share2     },
          ].map(({ key, label, icon: Icon }) => {
            const active = tab === key;
            return (
              <motion.button key={key} whileHover={{ scale: 1.04 }} whileTap={{ scale: .96 }}
                onClick={() => setTab(key)}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "9px 20px", borderRadius: 30,
                  background: active ? "rgba(124,58,237,.25)" : "rgba(255,255,255,.04)",
                  border: `1px solid ${active ? "rgba(124,58,237,.55)" : "rgba(255,255,255,.1)"}`,
                  color: active ? "#c4b5fd" : "rgba(255,255,255,.4)",
                  fontSize: 13, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                  boxShadow: active ? "0 0 20px rgba(124,58,237,.25)" : "none",
                  transition: "all .25s",
                }}
              >
                <Icon size={13} /> {label}
              </motion.button>
            );
          })}
        </motion.div>

        {/* ── DISCOVER TAB ────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {tab === "discover" && (
            <motion.div key="discover" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

              {/* Search + filters */}
              <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
                {/* Search box */}
                <div style={{ position: "relative", flex: 2, minWidth: 180 }}>
                  <Search size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.3)", pointerEvents: "none" }} />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search notes or subjects…"
                    style={{
                      width: "100%", padding: "11px 14px 11px 36px",
                      background: "rgba(255,255,255,.04)",
                      border: "1px solid rgba(255,255,255,.1)",
                      borderRadius: 12, fontSize: 13, color: "rgba(255,255,255,.9)",
                      outline: "none", fontFamily: "inherit",
                      transition: "all .2s", boxSizing: "border-box",
                    }}
                    onFocus={e => { e.target.style.borderColor = "rgba(124,58,237,.55)"; e.target.style.background = "rgba(124,58,237,.08)"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,.12)"; }}
                    onBlur={e  => { e.target.style.borderColor = "rgba(255,255,255,.1)";  e.target.style.background = "rgba(255,255,255,.04)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
                <GlassSelect value={filterCourse} onChange={e => handleFilterChange(e.target.value, filterSem)} flex="1.2">
                  <option value="">All courses</option>
                  {COURSES.map(c => <option key={c}>{c}</option>)}
                </GlassSelect>
                <GlassSelect value={filterSem} onChange={e => handleFilterChange(filterCourse, e.target.value)} flex="1">
                  <option value="">All sems</option>
                  {SEMESTERS.map(s => <option key={s}>{s}</option>)}
                </GlassSelect>
              </div>

              {/* Results count */}
              {!loading && notes.length > 0 && (
                <p style={{ fontSize: 12, color: "rgba(255,255,255,.25)", marginBottom: 14 }}>
                  {filtered.length} note{filtered.length !== 1 ? "s" : ""} found
                </p>
              )}

              {/* Cards */}
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ height: 82, borderRadius: 18, background: "rgba(255,255,255,.04)", animation: "pulse 1.5s infinite" }} />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "56px 0" }}>
                  <FileText size={36} style={{ color: "rgba(255,255,255,.1)", margin: "0 auto 12px" }} />
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,.25)" }}>No notes found</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,.15)", marginTop: 4 }}>Be the first to share — switch to the Share tab</p>
                </div>
              ) : (
                <AnimatePresence>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {filtered.map((note, i) => (
                      <motion.div key={note.id} transition={{ delay: i * 0.04 }}>
                        <NoteCard note={note} onView={handleView} onDownload={handleDownload} downloading={downloadingId} />
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </motion.div>
          )}

          {/* ── SHARE TAB ─────────────────────────────────── */}
          {tab === "share" && (
            <motion.div key="share" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

              {/* Success banner */}
              <AnimatePresence>
                {uploadSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: .95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "12px 18px", borderRadius: 14, marginBottom: 20,
                      background: "rgba(52,211,153,.1)", border: "1px solid rgba(52,211,153,.3)",
                      color: "#6ee7b7", fontSize: 13, fontWeight: 600,
                      boxShadow: "0 0 24px rgba(52,211,153,.15)",
                    }}
                  >
                    <CheckCircle2 size={15} />
                    Notes uploaded! It'll appear in Discover once approved.
                  </motion.div>
                )}
                {uploadError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "12px 18px", borderRadius: 14, marginBottom: 20,
                      background: "rgba(248,113,113,.1)", border: "1px solid rgba(248,113,113,.3)",
                      color: "#fca5a5", fontSize: 13, fontWeight: 600,
                    }}
                  >
                    <AlertCircle size={15} /> {uploadError}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                style={{
                  background: "rgba(255,255,255,.03)",
                  border: "1px solid rgba(255,255,255,.08)",
                  borderRadius: 24, padding: "28px 28px",
                  backdropFilter: "blur(16px)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(124,58,237,.2)", border: "1px solid rgba(124,58,237,.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Share2 size={14} style={{ color: "#a78bfa" }} />
                  </div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,.9)" }}>Share your notes</h2>
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,.3)", marginBottom: 24, marginLeft: 42 }}>
                  Help your batchmates by sharing high-quality lecture notes
                </p>

                {/* Form fields */}
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                  {/* Title */}
                  <div>
                    <Label>Note title</Label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Unit 1 — Introduction to OS" required
                      style={inputStyle(false)}
                      onFocus={e => { e.target.style.borderColor = "rgba(124,58,237,.55)"; e.target.style.background = "rgba(124,58,237,.08)"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,.12)"; }}
                      onBlur={e  => { e.target.style.borderColor = "rgba(255,255,255,.1)";  e.target.style.background = "rgba(255,255,255,.04)"; e.target.style.boxShadow = "none"; }}
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <Label>Subject name</Label>
                    <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                      placeholder="e.g. Operating Systems" required
                      style={inputStyle(false)}
                      onFocus={e => { e.target.style.borderColor = "rgba(124,58,237,.55)"; e.target.style.background = "rgba(124,58,237,.08)"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,.12)"; }}
                      onBlur={e  => { e.target.style.borderColor = "rgba(255,255,255,.1)";  e.target.style.background = "rgba(255,255,255,.04)"; e.target.style.boxShadow = "none"; }}
                    />
                  </div>

                  {/* Course + Semester */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <Label>Course</Label>
                      <GlassSelect value={course} onChange={e => setCourse(e.target.value)}>
                        {COURSES.map(c => <option key={c}>{c}</option>)}
                      </GlassSelect>
                    </div>
                    <div>
                      <Label>Semester</Label>
                      <GlassSelect value={semester} onChange={e => setSemester(e.target.value)}>
                        {SEMESTERS.map(s => <option key={s}>{s}</option>)}
                      </GlassSelect>
                    </div>
                  </div>

                  {/* Drag & Drop file zone */}
                  <div>
                    <Label>PDF file (max 10MB)</Label>
                    <motion.label
                      whileHover={{ scale: 1.01 }}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        gap: 10, padding: "28px 20px", borderRadius: 16, cursor: "pointer",
                        background: dragOver ? "rgba(124,58,237,.12)" : file ? "rgba(52,211,153,.06)" : "rgba(255,255,255,.03)",
                        border: `2px dashed ${dragOver ? "rgba(124,58,237,.6)" : file ? "rgba(52,211,153,.4)" : "rgba(255,255,255,.12)"}`,
                        boxShadow: dragOver ? "0 0 28px rgba(124,58,237,.2)" : file ? "0 0 20px rgba(52,211,153,.1)" : "none",
                        transition: "all .25s",
                      }}
                    >
                      <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} style={{ display: "none" }} />
                      {file ? (
                        <>
                          <CheckCircle2 size={24} style={{ color: "#34d399" }} />
                          <div style={{ textAlign: "center" }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "#6ee7b7" }}>{file.name}</p>
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 3 }}>
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <button type="button" onClick={e => { e.preventDefault(); setFile(null); }}
                            style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none",
                              color: "rgba(255,255,255,.3)", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>
                            <X size={11} /> Remove
                          </button>
                        </>
                      ) : (
                        <>
                          <Upload size={22} style={{ color: "rgba(255,255,255,.25)" }} />
                          <div style={{ textAlign: "center" }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.5)" }}>
                              Drop your PDF here
                            </p>
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,.25)", marginTop: 3 }}>
                              or click to browse
                            </p>
                          </div>
                        </>
                      )}
                    </motion.label>
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading}
                    whileHover={!uploading ? { scale: 1.02 } : {}}
                    whileTap={!uploading ? { scale: .97 } : {}}
                    style={{
                      width: "100%", padding: "14px 0",
                      background: uploading
                        ? "rgba(255,255,255,.05)"
                        : "linear-gradient(135deg,#7c3aed,#5b21b6)",
                      border: "none", borderRadius: 14,
                      color: uploading ? "rgba(255,255,255,.3)" : "#fff",
                      fontSize: 14, fontWeight: 700,
                      cursor: uploading ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                      boxShadow: uploading ? "none" : "0 4px 24px rgba(124,58,237,.4)",
                      transition: "all .3s",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                    onMouseEnter={e => { if (!uploading) e.currentTarget.style.boxShadow = "0 6px 32px rgba(124,58,237,.6)"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = uploading ? "none" : "0 4px 24px rgba(124,58,237,.4)"; }}
                  >
                    {uploading
                      ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%" }} /> Uploading…</>
                      : <><Sparkles size={14} /> Share with Community</>
                    }
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </AppShell>
  );
}