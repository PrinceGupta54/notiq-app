// src/app/ebooks/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import { Search, Download, Eye, BookOpen, Library, SlidersHorizontal } from "lucide-react";

const COURSES = ["All","B.Tech Computer Science","B.Tech EE","B.Tech ME","B.Com","B.Sc","BA","BCA"];

// ── Spine color per course ─────────────────────────────────────
const COURSE_COLORS = {
  "B.Tech Computer Science": { color: "#818cf8", glow: "rgba(129,140,248,.35)", bg: "rgba(129,140,248,.1)"  },
  "B.Tech EE":               { color: "#fbbf24", glow: "rgba(251,191,36,.35)",  bg: "rgba(251,191,36,.1)"  },
  "B.Tech ME":               { color: "#f87171", glow: "rgba(248,113,113,.35)", bg: "rgba(248,113,113,.1)" },
  "B.Com":                   { color: "#34d399", glow: "rgba(52,211,153,.35)",  bg: "rgba(52,211,153,.1)"  },
  "B.Sc":                    { color: "#60a5fa", glow: "rgba(96,165,250,.35)",  bg: "rgba(96,165,250,.1)"  },
  "BA":                      { color: "#f472b6", glow: "rgba(244,114,182,.35)", bg: "rgba(244,114,182,.1)" },
  "BCA":                     { color: "#a78bfa", glow: "rgba(167,139,250,.35)", bg: "rgba(167,139,250,.1)" },
};
const DEFAULT_ACCENT = { color: "#c4b5fd", glow: "rgba(196,181,253,.3)", bg: "rgba(196,181,253,.08)" };
const accent = (course) => COURSE_COLORS[course] || DEFAULT_ACCENT;

// ── Book spine thumb ───────────────────────────────────────────
function BookSpine({ course }) {
  const { color, glow, bg } = accent(course);
  return (
    <div style={{
      width: 48, height: 64, borderRadius: 10, flexShrink: 0,
      background: bg, border: `1px solid ${color}33`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 0 18px ${glow}`,
      position: "relative", overflow: "hidden",
    }}>
      {/* spine line */}
      <div style={{ position: "absolute", left: 8, top: 8, bottom: 8, width: 2, borderRadius: 2, background: `${color}55` }} />
      <BookOpen size={16} style={{ color, marginLeft: 6 }} />
    </div>
  );
}

// ── Ebook card ─────────────────────────────────────────────────
function EbookCard({ ebook, onView, onDownload, downloading, index }) {
  const [hovered, setHovered] = useState(false);
  const { color, glow } = accent(ebook.course);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05, duration: .3, ease: [0.22,1,.36,1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "16px 18px", borderRadius: 18,
        background: hovered ? "rgba(255,255,255,.055)" : "rgba(255,255,255,.03)",
        border: `1px solid ${hovered ? color + "33" : "rgba(255,255,255,.07)"}`,
        boxShadow: hovered ? `0 0 32px ${glow}` : "none",
        transition: "all .28s cubic-bezier(.22,1,.36,1)",
      }}
    >
      <BookSpine course={ebook.course} />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,.9)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          marginBottom: 4,
          textShadow: hovered ? `0 0 20px ${color}55` : "none",
          transition: "text-shadow .3s",
        }}>
          {ebook.title}
        </p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginBottom: 2 }}>
          {ebook.subject} · <span style={{ color: color + "cc" }}>{ebook.course}</span>
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {ebook.author && (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.22)" }}>by {ebook.author}</span>
          )}
          <span style={{ fontSize: 11, color: "rgba(255,255,255,.2)" }}>·</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,.22)" }}>
            {ebook.downloads} downloads
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <motion.button
          whileHover={{ scale: 1.06 }} whileTap={{ scale: .93 }}
          onClick={() => onView(ebook)}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "7px 14px", borderRadius: 10,
            background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
            color: "rgba(255,255,255,.5)", fontSize: 12, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit", transition: "all .2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.1)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.05)"; e.currentTarget.style.color = "rgba(255,255,255,.5)"; }}
        >
          <Eye size={12} /> View
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.06 }} whileTap={{ scale: .93 }}
          onClick={() => onDownload(ebook)}
          disabled={downloading === ebook.id}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "7px 14px", borderRadius: 10,
            background: downloading === ebook.id ? "rgba(255,255,255,.04)" : `${color}22`,
            border: `1px solid ${color}44`,
            color: color, fontSize: 12, fontWeight: 600,
            cursor: downloading === ebook.id ? "wait" : "pointer",
            fontFamily: "inherit", transition: "all .2s",
            boxShadow: `0 0 12px ${glow}`,
          }}
          onMouseEnter={e => { if (downloading !== ebook.id) { e.currentTarget.style.background = `${color}33`; e.currentTarget.style.boxShadow = `0 0 22px ${glow}`; }}}
          onMouseLeave={e => { e.currentTarget.style.background = `${color}22`; e.currentTarget.style.boxShadow = `0 0 12px ${glow}`; }}
        >
          <Download size={12} />
          {downloading === ebook.id ? "Saving…" : "Download"}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── Glass select ───────────────────────────────────────────────
function GlassSelect({ value, onChange, children }) {
  const [f, setF] = useState(false);
  return (
    <select value={value} onChange={onChange}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
      style={{
        padding: "11px 34px 11px 14px",
        background: f ? "rgba(124,58,237,.08)" : "rgba(255,255,255,.04)",
        border: `1px solid ${f ? "rgba(124,58,237,.55)" : "rgba(255,255,255,.1)"}`,
        borderRadius: 12, fontSize: 13, color: "rgba(255,255,255,.8)",
        outline: "none", fontFamily: "inherit", cursor: "pointer",
        boxShadow: f ? "0 0 0 3px rgba(124,58,237,.12)" : "none",
        transition: "all .2s", appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,.3)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
      }}
    >
      {children}
    </select>
  );
}

// ── Course filter pills ────────────────────────────────────────
function CoursePills({ active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
      {COURSES.map(c => {
        const isActive = active === c;
        const { color, glow } = c === "All" ? { color: "#a78bfa", glow: "rgba(167,139,250,.3)" } : accent(c);
        return (
          <motion.button
            key={c} whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }}
            onClick={() => onChange(c)}
            style={{
              padding: "5px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: isActive ? `${color}20` : "rgba(255,255,255,.03)",
              border: `1px solid ${isActive ? color + "55" : "rgba(255,255,255,.08)"}`,
              color: isActive ? color : "rgba(255,255,255,.3)",
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: isActive ? `0 0 14px ${glow}` : "none",
              transition: "all .2s",
            }}
          >
            {c === "All" ? "All courses" : c}
          </motion.button>
        );
      })}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────
export default function EbooksPage() {
  const router = useRouter();
  const [ebooks, setEbooks]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filterCourse, setFilterCourse] = useState("All");
  const [search, setSearch]             = useState("");
  const [downloadingId, setDownloadingId] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const { data } = await supabase.from("ebooks").select("*").order("created_at", { ascending: false });
      setEbooks(data || []);
      setLoading(false);
    };
    init();
  }, [router]);

  const handleView = (ebook) =>
    window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(ebook.file_url)}&embedded=false`, "_blank");

  const forceDownload = async (url, filename) => {
    try {
      const res  = await fetch(url);
      const blob = await res.blob();
      const burl = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = burl; a.download = filename || "ebook.pdf";
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(burl);
    } catch { window.open(url, "_blank"); }
  };

  const handleDownload = async (ebook) => {
    setDownloadingId(ebook.id);
    await supabase.from("ebooks").update({ downloads: ebook.downloads + 1 }).eq("id", ebook.id);
    setEbooks(ebooks.map(e => e.id === ebook.id ? { ...e, downloads: e.downloads + 1 } : e));
    await forceDownload(ebook.file_url, `${ebook.title}.pdf`);
    setDownloadingId(null);
  };

  const filtered = ebooks.filter(e => {
    const matchesCourse = filterCourse === "All" || e.course === filterCourse;
    const matchesSearch = !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.subject?.toLowerCase().includes(search.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  return (
    <AppShell>
      <div style={{ padding: "32px 28px", maxWidth: 860, margin: "0 auto" }}>

        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "rgba(167,139,250,.15)", border: "1px solid rgba(167,139,250,.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px rgba(167,139,250,.2)",
          }}>
            <Library size={18} style={{ color: "#a78bfa" }} />
          </div>
          <h1 style={{
            fontSize: 26, fontWeight: 800,
            background: "linear-gradient(135deg,#fff 0%,#c4b5fd 50%,#818cf8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            E-Books Library
          </h1>
        </motion.div>

        {/* Search bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .07 }}
          style={{ position: "relative", marginBottom: 20 }}>
          <Search size={15} style={{
            position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
            color: searchFocused ? "#a78bfa" : "rgba(255,255,255,.25)",
            pointerEvents: "none", transition: "color .2s",
          }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or subject…"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              width: "100%", padding: "13px 14px 13px 40px",
              background: searchFocused ? "rgba(124,58,237,.08)" : "rgba(255,255,255,.04)",
              border: `1px solid ${searchFocused ? "rgba(124,58,237,.55)" : "rgba(255,255,255,.1)"}`,
              borderRadius: 14, fontSize: 14, color: "rgba(255,255,255,.9)",
              outline: "none", fontFamily: "inherit",
              boxShadow: searchFocused ? "0 0 0 3px rgba(124,58,237,.12)" : "none",
              transition: "all .2s", boxSizing: "border-box",
            }}
          />
          {search && (
            <motion.button initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }}
              onClick={() => setSearch("")}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(255,255,255,.3)", fontSize: 16, lineHeight: 1, padding: 4,
              }}>×</motion.button>
          )}
        </motion.div>

        {/* Course pills */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }}>
          <CoursePills active={filterCourse} onChange={setFilterCourse} />
        </motion.div>

        {/* Results count */}
        <AnimatePresence>
          {!loading && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ fontSize: 12, color: "rgba(255,255,255,.22)", marginBottom: 14 }}>
              {filtered.length} book{filtered.length !== 1 ? "s" : ""} found
            </motion.p>
          )}
        </AnimatePresence>

        {/* Content */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1,2,3,4].map(i => (
              <motion.div key={i} animate={{ opacity: [.4,1,.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * .15 }}
                style={{ height: 88, borderRadius: 18, background: "rgba(255,255,255,.04)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: "center", padding: "60px 0" }}>
            <motion.div
              animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ fontSize: 48, marginBottom: 16 }}>📚</motion.div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.3)", marginBottom: 6 }}>No e-books found</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.18)" }}>Try a different course or search term</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map((ebook, i) => (
                <EbookCard
                  key={ebook.id} ebook={ebook} index={i}
                  onView={handleView} onDownload={handleDownload}
                  downloading={downloadingId}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </AppShell>
  );
}