// src/app/notes/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import {
  Search, Download, Eye,
  Upload, FileText, CheckCircle2, AlertCircle,
  BookMarked, Share2, Sparkles, X,
} from "lucide-react";

const COURSES  = ["B.Tech Computer Science","B.Tech EE","B.Tech ME","B.Tech CE","B.Com","B.Sc","BA","BCA","MCA"];
const SEMESTERS = ["Semester 1","Semester 2","Semester 3","Semester 4","Semester 5","Semester 6","Semester 7","Semester 8"];

// ─── Shared style helpers ──────────────────────────────────────
const glassInput = (focused) => ({
  width: "100%", padding: "clamp(9px,2.5vw,11px) 14px",
  background: focused ? "rgba(124,58,237,.08)" : "rgba(255,255,255,.04)",
  border: `1px solid ${focused ? "rgba(124,58,237,.55)" : "rgba(255,255,255,.1)"}`,
  borderRadius: 12, fontSize: "clamp(12px,3.5vw,13px)", color: "rgba(255,255,255,.9)",
  outline: "none", fontFamily: "inherit",
  boxShadow: focused ? "0 0 0 3px rgba(124,58,237,.12)" : "none",
  transition: "all .2s", boxSizing: "border-box",
});

function Label({ children }) {
  return (
    <p style={{
      fontSize: "clamp(9px,2.5vw,11px)", fontWeight: 700,
      textTransform: "uppercase", letterSpacing: ".1em",
      color: "rgba(255,255,255,.3)", marginBottom: 7,
    }}>
      {children}
    </p>
  );
}

// ─── Glass select ──────────────────────────────────────────────
function GlassSelect({ value, onChange, children, style: extraStyle }) {
  const [f, setF] = useState(false);
  return (
    <select
      value={value} onChange={onChange}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
      style={{
        ...glassInput(f),
        cursor: "pointer", appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,.3)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
        paddingRight: 34,
        ...extraStyle,
      }}
    >
      {children}
    </select>
  );
}

// ─── NoteCard ──────────────────────────────────────────────────
function NoteCard({ note, onView, onDownload, downloading, index }) {
  const [hov, setHov] = useState(false);
  const dl = downloading === note.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05, duration: .3, ease: [.22,1,.36,1] }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center",
        gap: "clamp(10px,3vw,16px)",
        padding: "clamp(12px,3vw,16px) clamp(12px,3.5vw,18px)",
        borderRadius: 18,
        background: hov ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.03)",
        border: `1px solid ${hov ? "rgba(167,139,250,.3)" : "rgba(255,255,255,.07)"}`,
        boxShadow: hov ? "0 0 32px rgba(167,139,250,.14), inset 0 1px 0 rgba(255,255,255,.04)" : "none",
        transition: "all .26s cubic-bezier(.22,1,.36,1)",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Shimmer sweep on hover */}
      <motion.div
        animate={{ x: hov ? "260%" : "-100%" }}
        transition={{ duration: .55, ease: "easeInOut" }}
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(105deg,transparent 35%,rgba(167,139,250,.06) 50%,transparent 65%)",
        }}
      />

      {/* PDF badge */}
      <motion.div
        animate={{ scale: hov ? 1.07 : 1 }}
        transition={{ duration: .22 }}
        style={{
          width: "clamp(36px,9vw,44px)", height: "clamp(36px,9vw,44px)",
          borderRadius: 11, flexShrink: 0,
          background: "rgba(239,68,68,.12)", border: "1px solid rgba(239,68,68,.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: hov ? "0 0 18px rgba(239,68,68,.25)" : "none",
          transition: "box-shadow .26s",
        }}
      >
        <span style={{ fontSize: "clamp(8px,2vw,10px)", fontWeight: 800, color: "#f87171", letterSpacing: ".04em" }}>
          PDF
        </span>
      </motion.div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: "clamp(12px,3.5vw,14px)", fontWeight: 600,
          color: hov ? "#fff" : "rgba(255,255,255,.88)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          marginBottom: 3, transition: "color .2s",
          textShadow: hov ? "0 0 18px rgba(167,139,250,.4)" : "none",
        }}>
          {note.title}
        </p>
        <p style={{ fontSize: "clamp(10px,2.8vw,12px)", color: "rgba(255,255,255,.4)" }}>
          {note.subject} · {note.course}
        </p>
        <p style={{ fontSize: "clamp(9px,2.5vw,11px)", color: "rgba(255,255,255,.22)", marginTop: 2 }}>
          {note.semester} · {note.downloads} downloads
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "clamp(5px,2vw,8px)", flexShrink: 0 }}>
        <motion.button
          whileHover={{ scale: 1.08 }} whileTap={{ scale: .92 }}
          onClick={() => onView(note)}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "clamp(6px,2vw,8px) clamp(8px,2.5vw,14px)",
            borderRadius: 10, fontSize: "clamp(10px,2.8vw,12px)", fontWeight: 600,
            background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
            color: "rgba(255,255,255,.55)", cursor: "pointer", fontFamily: "inherit",
            transition: "all .2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,.12)"; e.currentTarget.style.color="#fff"; e.currentTarget.style.borderColor="rgba(255,255,255,.22)"; }}
          onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,.05)"; e.currentTarget.style.color="rgba(255,255,255,.55)"; e.currentTarget.style.borderColor="rgba(255,255,255,.1)"; }}
        >
          <Eye size={11} />
          <span className="hide-xs">View</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.08 }} whileTap={{ scale: .92 }}
          onClick={() => onDownload(note)}
          disabled={dl}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "clamp(6px,2vw,8px) clamp(8px,2.5vw,14px)",
            borderRadius: 10, fontSize: "clamp(10px,2.8vw,12px)", fontWeight: 600,
            background: dl ? "rgba(167,139,250,.08)" : "rgba(124,58,237,.2)",
            border: "1px solid rgba(124,58,237,.38)", color: "#c4b5fd",
            cursor: dl ? "wait" : "pointer", fontFamily: "inherit",
            boxShadow: "0 0 14px rgba(124,58,237,.22)", transition: "all .2s",
          }}
          onMouseEnter={e => { if(!dl){ e.currentTarget.style.background="rgba(124,58,237,.32)"; e.currentTarget.style.boxShadow="0 0 24px rgba(124,58,237,.45)"; }}}
          onMouseLeave={e => { e.currentTarget.style.background=dl?"rgba(167,139,250,.08)":"rgba(124,58,237,.2)"; e.currentTarget.style.boxShadow="0 0 14px rgba(124,58,237,.22)"; }}
        >
          <Download size={11} />
          <span className="hide-xs">{dl ? "Saving…" : "Download"}</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────
export default function NotesPage() {
  const router = useRouter();
  const [tab,           setTab]           = useState("discover");
  const [userId,        setUserId]        = useState(null);
  const [notes,         setNotes]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [filterCourse,  setFilterCourse]  = useState("");
  const [filterSem,     setFilterSem]     = useState("");
  const [search,        setSearch]        = useState("");
  const [downloadingId, setDownloadingId] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);

  // Upload form
  const [title,         setTitle]         = useState("");
  const [subject,       setSubject]       = useState("");
  const [course,        setCourse]        = useState(COURSES[0]);
  const [semester,      setSemester]      = useState(SEMESTERS[0]);
  const [file,          setFile]          = useState(null);
  const [uploading,     setUploading]     = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError,   setUploadError]   = useState("");
  const [dragOver,      setDragOver]      = useState(false);

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
    let q = supabase.from("notes").select("*").eq("status","approved").order("created_at",{ ascending:false });
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
      const res = await fetch(url); const blob = await res.blob();
      const burl = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href=burl; a.download=filename||"note.pdf";
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(burl);
    } catch { window.open(url,"_blank"); }
  };

  const handleDownload = async (note) => {
    setDownloadingId(note.id);
    await supabase.from("notes").update({ downloads: note.downloads+1 }).eq("id", note.id);
    setNotes(notes.map(n => n.id===note.id ? {...n, downloads:n.downloads+1} : n));
    await forceDownload(note.file_url, `${note.title}.pdf`);
    setDownloadingId(null);
  };

  const handleUpload = async (e) => {
    e?.preventDefault?.();
    if (!file)                              { setUploadError("Please select a PDF file."); return; }
    if (file.type !== "application/pdf")   { setUploadError("Only PDF files are allowed."); return; }
    if (file.size > 10*1024*1024)          { setUploadError("File must be under 10MB."); return; }
    setUploading(true); setUploadError("");

    const filePath = `notes/${userId}/${Date.now()}_${file.name.replace(/\s+/g,"_")}`;
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
    !search ||
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes spin  { to{transform:rotate(360deg)} }
        /* Hide button text on very small screens */
        @media(max-width:380px){ .hide-xs{ display:none; } }
      `}</style>

      <div style={{
        padding: "clamp(20px,5vw,36px) clamp(14px,5vw,28px)",
        maxWidth: 820, margin: "0 auto",
      }}>

        {/* ── Heading ── */}
        <motion.h1
          initial={{ opacity:0, y:-14 }} animate={{ opacity:1, y:0 }}
          style={{
            fontSize: "clamp(20px,5vw,26px)", fontWeight: 800,
            marginBottom: "clamp(18px,5vw,28px)",
            background: "linear-gradient(135deg,#fff 0%,#c4b5fd 50%,#818cf8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}
        >
          Community Notes
        </motion.h1>

        {/* ── Tab pills ── */}
        <motion.div
          initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:.06 }}
          style={{
            display: "flex", gap: "clamp(4px,2vw,8px)",
            marginBottom: "clamp(18px,5vw,28px)", flexWrap: "wrap",
          }}
        >
          {[
            { key:"discover", label:"Discover", icon:BookMarked },
            { key:"share",    label:"Share",    icon:Share2 },
          ].map(({ key, label, icon: Icon }) => {
            const active = tab === key;
            return (
              <motion.button
                key={key} whileHover={{ scale:1.05 }} whileTap={{ scale:.94 }}
                onClick={() => setTab(key)}
                style={{
                  display:"flex", alignItems:"center", gap: "clamp(5px,1.5vw,7px)",
                  padding: "clamp(7px,2vw,10px) clamp(14px,4vw,22px)",
                  borderRadius: 30,
                  background: active ? "rgba(124,58,237,.25)" : "rgba(255,255,255,.04)",
                  border: `1px solid ${active ? "rgba(124,58,237,.6)" : "rgba(255,255,255,.1)"}`,
                  color: active ? "#c4b5fd" : "rgba(255,255,255,.38)",
                  fontSize: "clamp(11px,3vw,13px)", fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                  boxShadow: active ? "0 0 22px rgba(124,58,237,.28)" : "none",
                  transition: "all .25s",
                }}
              >
                <Icon size={12} /> {label}
              </motion.button>
            );
          })}
        </motion.div>

        {/* ══ DISCOVER ══════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {tab === "discover" && (
            <motion.div
              key="discover"
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
            >
              {/* Search + filters — stack on mobile */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "clamp(140px,40%,1fr) 1fr 1fr",
                gap: "clamp(6px,2vw,10px)",
                marginBottom: "clamp(12px,3vw,18px)",
              }}
              className="notes-filter-grid"
              >
                {/* Search */}
                <div style={{ position:"relative", gridColumn:"1/-1" }}>
                  <Search size={13} style={{
                    position:"absolute", left:13, top:"50%",
                    transform:"translateY(-50%)", pointerEvents:"none",
                    color: searchFocused ? "#a78bfa" : "rgba(255,255,255,.28)",
                    transition:"color .2s",
                  }}/>
                  <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search notes or subjects…"
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    style={{
                      ...glassInput(searchFocused),
                      paddingLeft: 36, paddingRight: search ? 36 : 14,
                    }}
                  />
                  <AnimatePresence>
                    {search && (
                      <motion.button
                        initial={{ opacity:0, scale:.7 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:.7 }}
                        onClick={() => setSearch("")}
                        style={{
                          position:"absolute", right:11, top:"50%", transform:"translateY(-50%)",
                          background:"none", border:"none", cursor:"pointer", padding:4,
                          color:"rgba(255,255,255,.3)", display:"flex", alignItems:"center",
                          transition:"color .2s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.color="#f87171"}
                        onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,.3)"}
                      >
                        <X size={13}/>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

                {/* Course filter */}
                <GlassSelect value={filterCourse} onChange={e => handleFilterChange(e.target.value, filterSem)}>
                  <option value="">All courses</option>
                  {COURSES.map(c => <option key={c}>{c}</option>)}
                </GlassSelect>

                {/* Semester filter */}
                <GlassSelect value={filterSem} onChange={e => handleFilterChange(filterCourse, e.target.value)}>
                  <option value="">All sems</option>
                  {SEMESTERS.map(s => <option key={s}>{s}</option>)}
                </GlassSelect>
              </div>

              {/* Results count */}
              <AnimatePresence>
                {!loading && notes.length > 0 && (
                  <motion.p
                    initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                    style={{ fontSize:"clamp(10px,2.5vw,12px)", color:"rgba(255,255,255,.22)", marginBottom:"clamp(10px,2.5vw,14px)" }}
                  >
                    {filtered.length} note{filtered.length!==1?"s":""} found
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Cards / skeleton / empty */}
              {loading ? (
                <div style={{ display:"flex", flexDirection:"column", gap:"clamp(7px,2vw,10px)" }}>
                  {[1,2,3].map(i => (
                    <motion.div key={i}
                      animate={{ opacity:[.4,1,.4] }}
                      transition={{ duration:1.6, repeat:Infinity, delay:i*.18 }}
                      style={{ height:"clamp(68px,18vw,82px)", borderRadius:18, background:"rgba(255,255,255,.04)" }}
                    />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                  style={{ textAlign:"center", padding:"clamp(36px,10vw,56px) 0" }}>
                  <FileText size={34} style={{ color:"rgba(255,255,255,.1)", margin:"0 auto 12px" }}/>
                  <p style={{ fontSize:"clamp(12px,3.5vw,14px)", color:"rgba(255,255,255,.25)" }}>No notes found</p>
                  <p style={{ fontSize:"clamp(10px,2.8vw,12px)", color:"rgba(255,255,255,.15)", marginTop:4 }}>
                    Be the first to share — switch to the Share tab
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence>
                  <div style={{ display:"flex", flexDirection:"column", gap:"clamp(7px,2vw,10px)" }}>
                    {filtered.map((note, i) => (
                      <NoteCard
                        key={note.id} note={note} index={i}
                        onView={handleView} onDownload={handleDownload}
                        downloading={downloadingId}
                      />
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </motion.div>
          )}

          {/* ══ SHARE ═════════════════════════════════════════ */}
          {tab === "share" && (
            <motion.div
              key="share"
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
            >
              {/* Banners */}
              <AnimatePresence>
                {uploadSuccess && (
                  <motion.div
                    initial={{ opacity:0, y:-10, scale:.95 }}
                    animate={{ opacity:1, y:0,   scale:1   }}
                    exit={{ opacity:0, y:-10 }}
                    style={{
                      display:"flex", alignItems:"center", gap:9,
                      padding:"clamp(10px,3vw,13px) clamp(14px,4vw,18px)",
                      borderRadius:14, marginBottom:"clamp(14px,4vw,20px)",
                      background:"rgba(52,211,153,.1)", border:"1px solid rgba(52,211,153,.3)",
                      color:"#6ee7b7", fontSize:"clamp(11px,3vw,13px)", fontWeight:600,
                      boxShadow:"0 0 24px rgba(52,211,153,.15)",
                    }}
                  >
                    <CheckCircle2 size={14}/>
                    Notes uploaded! It'll appear in Discover once approved.
                  </motion.div>
                )}
                {uploadError && (
                  <motion.div
                    initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                    style={{
                      display:"flex", alignItems:"flex-start", gap:9,
                      padding:"clamp(10px,3vw,13px) clamp(14px,4vw,18px)",
                      borderRadius:14, marginBottom:"clamp(14px,4vw,20px)",
                      background:"rgba(248,113,113,.1)", border:"1px solid rgba(248,113,113,.3)",
                      color:"#fca5a5", fontSize:"clamp(11px,3vw,13px)", fontWeight:600,
                    }}
                  >
                    <AlertCircle size={14} style={{ flexShrink:0, marginTop:1 }}/> {uploadError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form card */}
              <motion.div
                style={{
                  background:"rgba(255,255,255,.03)",
                  border:"1px solid rgba(255,255,255,.08)",
                  borderRadius:"clamp(18px,4vw,24px)",
                  padding:"clamp(20px,5vw,30px) clamp(16px,5vw,28px)",
                  backdropFilter:"blur(16px)",
                }}
              >
                {/* Card header */}
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                  <motion.div
                    whileHover={{ scale:1.1, rotate:6 }}
                    style={{
                      width:32, height:32, borderRadius:10, flexShrink:0,
                      background:"rgba(124,58,237,.2)", border:"1px solid rgba(124,58,237,.38)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      boxShadow:"0 0 16px rgba(124,58,237,.22)",
                    }}
                  >
                    <Share2 size={13} style={{ color:"#a78bfa" }}/>
                  </motion.div>
                  <h2 style={{ fontSize:"clamp(14px,4vw,16px)", fontWeight:700, color:"rgba(255,255,255,.9)" }}>
                    Share your notes
                  </h2>
                </div>
                <p style={{
                  fontSize:"clamp(11px,3vw,13px)", color:"rgba(255,255,255,.3)",
                  marginBottom:"clamp(18px,5vw,26px)", marginLeft:42,
                }}>
                  Help your batchmates by sharing high-quality lecture notes
                </p>

                {/* Fields */}
                <div style={{ display:"flex", flexDirection:"column", gap:"clamp(14px,4vw,18px)" }}>

                  {/* Title */}
                  <div>
                    <Label>Note title</Label>
                    <FocusInput
                      value={title} onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Unit 1 — Introduction to OS" required
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <Label>Subject name</Label>
                    <FocusInput
                      value={subject} onChange={e => setSubject(e.target.value)}
                      placeholder="e.g. Operating Systems" required
                    />
                  </div>

                  {/* Course + Semester — single col on tiny screens */}
                  <div style={{
                    display:"grid",
                    gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",
                    gap:"clamp(8px,2.5vw,12px)",
                  }}>
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

                  {/* Drag-drop zone */}
                  <div>
                    <Label>PDF file (max 10MB)</Label>
                    <motion.label
                      whileHover={{ scale:1.01 }}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={e => { e.preventDefault(); setDragOver(false); const f=e.dataTransfer.files[0]; if(f) setFile(f); }}
                      style={{
                        display:"flex", flexDirection:"column",
                        alignItems:"center", justifyContent:"center",
                        gap:"clamp(7px,2vw,10px)",
                        padding:"clamp(20px,6vw,30px) clamp(12px,4vw,20px)",
                        borderRadius:16, cursor:"pointer",
                        background: dragOver ? "rgba(124,58,237,.12)" : file ? "rgba(52,211,153,.07)" : "rgba(255,255,255,.03)",
                        border: `2px dashed ${dragOver ? "rgba(124,58,237,.65)" : file ? "rgba(52,211,153,.45)" : "rgba(255,255,255,.12)"}`,
                        boxShadow: dragOver ? "0 0 32px rgba(124,58,237,.22)" : file ? "0 0 22px rgba(52,211,153,.12)" : "none",
                        transition:"all .26s",
                      }}
                    >
                      <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} style={{ display:"none" }}/>

                      {file ? (
                        <>
                          <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:"spring", stiffness:340, damping:18 }}>
                            <CheckCircle2 size={26} style={{ color:"#34d399" }}/>
                          </motion.div>
                          <div style={{ textAlign:"center" }}>
                            <p style={{ fontSize:"clamp(11px,3vw,13px)", fontWeight:600, color:"#6ee7b7" }}>{file.name}</p>
                            <p style={{ fontSize:"clamp(9px,2.5vw,11px)", color:"rgba(255,255,255,.3)", marginTop:3 }}>
                              {(file.size/1024/1024).toFixed(2)} MB
                            </p>
                          </div>
                          <motion.button
                            type="button" whileHover={{ scale:1.06 }} whileTap={{ scale:.94 }}
                            onClick={e => { e.preventDefault(); setFile(null); }}
                            style={{
                              display:"flex", alignItems:"center", gap:4, background:"none", border:"none",
                              color:"rgba(255,255,255,.28)", cursor:"pointer",
                              fontSize:"clamp(10px,2.8vw,12px)", fontFamily:"inherit",
                              transition:"color .2s",
                            }}
                            onMouseEnter={e => e.currentTarget.style.color="#f87171"}
                            onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,.28)"}
                          >
                            <X size={11}/> Remove
                          </motion.button>
                        </>
                      ) : (
                        <>
                          <motion.div
                            animate={{ y:[0,-4,0] }}
                            transition={{ duration:2.2, repeat:Infinity, ease:"easeInOut" }}
                          >
                            <Upload size={22} style={{ color:"rgba(255,255,255,.25)" }}/>
                          </motion.div>
                          <div style={{ textAlign:"center" }}>
                            <p style={{ fontSize:"clamp(12px,3.5vw,13px)", fontWeight:600, color:"rgba(255,255,255,.5)" }}>
                              Drop your PDF here
                            </p>
                            <p style={{ fontSize:"clamp(10px,2.8vw,11px)", color:"rgba(255,255,255,.25)", marginTop:3 }}>
                              or tap to browse
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
                    whileHover={!uploading ? { scale:1.02 } : {}}
                    whileTap={!uploading ? { scale:.97 } : {}}
                    style={{
                      width:"100%",
                      padding:"clamp(12px,3vw,15px) 0",
                      background: uploading ? "rgba(255,255,255,.05)" : "linear-gradient(135deg,#7c3aed,#5b21b6)",
                      border:"none", borderRadius:14,
                      color: uploading ? "rgba(255,255,255,.3)" : "#fff",
                      fontSize:"clamp(13px,3.5vw,14px)", fontWeight:700,
                      cursor: uploading ? "not-allowed" : "pointer",
                      fontFamily:"inherit",
                      boxShadow: uploading ? "none" : "0 4px 24px rgba(124,58,237,.4)",
                      transition:"all .3s",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                    }}
                    onMouseEnter={e => { if(!uploading) e.currentTarget.style.boxShadow="0 7px 34px rgba(124,58,237,.65)"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = uploading ? "none" : "0 4px 24px rgba(124,58,237,.4)"; }}
                  >
                    {uploading ? (
                      <>
                        <motion.div
                          animate={{ rotate:360 }}
                          transition={{ duration:1, repeat:Infinity, ease:"linear" }}
                          style={{
                            width:14, height:14, borderRadius:"50%",
                            border:"2px solid rgba(255,255,255,.25)", borderTopColor:"#fff",
                          }}
                        />
                        Uploading…
                      </>
                    ) : (
                      <><Sparkles size={14}/> Share with Community</>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Responsive grid override — 1 col on mobile for filters */}
      <style>{`
        @media(max-width:500px){
          .notes-filter-grid {
            grid-template-columns: 1fr !important;
          }
          .notes-filter-grid > *:first-child {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </AppShell>
  );
}

// ─── Controlled input with live focus glow ─────────────────────
function FocusInput({ value, onChange, placeholder, required }) {
  const [f, setF] = useState(false);
  return (
    <input
      type="text" value={value} onChange={onChange}
      placeholder={placeholder} required={required}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
      style={glassInput(f)}
    />
  );
}