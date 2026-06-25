// src/app/coursify/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import { Plus, X, Trash2, PlayCircle, BookOpen, Link2, Sparkles, ChevronRight, Film } from "lucide-react";

const CATEGORIES = ["All", "GATE CS", "GATE EE", "Soft Skills", "Custom"];

const CAT_CONFIG = {
  "GATE CS":    { color: "#818cf8", bg: "rgba(129,140,248,0.10)", border: "rgba(129,140,248,0.3)",  glow: "rgba(129,140,248,0.2)"  },
  "GATE EE":    { color: "#34d399", bg: "rgba(52,211,153,0.10)",  border: "rgba(52,211,153,0.3)",   glow: "rgba(52,211,153,0.2)"   },
  "Soft Skills":{ color: "#fbbf24", bg: "rgba(251,191,36,0.10)",  border: "rgba(251,191,36,0.3)",   glow: "rgba(251,191,36,0.2)"   },
  "Custom":     { color: "#f472b6", bg: "rgba(244,114,182,0.10)", border: "rgba(244,114,182,0.3)",  glow: "rgba(244,114,182,0.2)"  },
};
const DEFAULT_CFG = { color: "#c084fc", bg: "rgba(192,132,252,0.10)", border: "rgba(192,132,252,0.3)", glow: "rgba(192,132,252,0.2)" };
const getCfg = (cat) => CAT_CONFIG[cat] || DEFAULT_CFG;

// ── Ambient orbs ─────────────────────────────────────────────
function AmbientOrbs() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <div style={{ position:"absolute", top:"-18%", left:"-8%", width:560, height:560, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 68%)", filter:"blur(80px)",
        animation:"orbA 14s ease-in-out infinite" }} />
      <div style={{ position:"absolute", bottom:"-12%", right:"-8%", width:440, height:440, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)", filter:"blur(70px)",
        animation:"orbB 18s ease-in-out infinite" }} />
      <div style={{ position:"absolute", top:"45%", right:"25%", width:300, height:300, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(244,114,182,0.06) 0%, transparent 70%)", filter:"blur(50px)",
        animation:"orbC 11s ease-in-out infinite" }} />
      <style>{`
        @keyframes orbA{0%,100%{transform:translate(0,0) scale(1)}40%{transform:translate(35px,45px) scale(1.07)}70%{transform:translate(-18px,20px) scale(0.95)}}
        @keyframes orbB{0%,100%{transform:translate(0,0)}45%{transform:translate(-28px,-35px) scale(1.05)}75%{transform:translate(18px,-12px)}}
        @keyframes orbC{0%,100%{transform:translate(0,0)}50%{transform:translate(22px,28px)}}
        @keyframes skPulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
        @keyframes progressGlow{0%,100%{box-shadow:0 0 6px rgba(124,58,237,0.4)}50%{box-shadow:0 0 14px rgba(124,58,237,0.7)}}
      `}</style>
    </div>
  );
}

// ── Skeleton card ─────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      borderRadius: 20, overflow: "hidden",
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      animation: "skPulse 1.6s ease-in-out infinite",
    }}>
      <div style={{ height: 148, background: "rgba(255,255,255,0.05)" }} />
      <div style={{ padding: "16px 18px" }}>
        <div style={{ height: 14, width: "70%", borderRadius: 6, background: "rgba(255,255,255,0.07)", marginBottom: 10 }} />
        <div style={{ height: 11, width: "40%", borderRadius: 6, background: "rgba(255,255,255,0.04)", marginBottom: 18 }} />
        <div style={{ height: 5, borderRadius: 4, background: "rgba(255,255,255,0.06)" }} />
      </div>
    </div>
  );
}

// ── Filter pills ──────────────────────────────────────────────
function FilterPills({ active, onChange, courses }) {
  const counts = CATEGORIES.reduce((a, c) => {
    a[c] = c === "All" ? courses.length : courses.filter(x => x.category === c).length;
    return a;
  }, {});
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
      {CATEGORIES.map(cat => {
        const isActive = active === cat;
        const cfg = getCfg(cat);
        return (
          <motion.button key={cat} onClick={() => onChange(cat)}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}
            style={{
              padding: "8px 18px", borderRadius: 30, fontFamily: "inherit",
              border: `1px solid ${isActive ? cfg.border : "rgba(255,255,255,0.08)"}`,
              background: isActive ? cfg.bg : "rgba(255,255,255,0.03)",
              color: isActive ? cfg.color : "rgba(255,255,255,0.38)",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              boxShadow: isActive ? `0 0 18px ${cfg.glow}` : "none",
              transition: "all .22s",
              display: "flex", alignItems: "center", gap: 7,
              letterSpacing: "0.02em",
            }}
          >
            {cat !== "All" && <span style={{ width:6, height:6, borderRadius:"50%", background:cfg.color, boxShadow:`0 0 6px ${cfg.color}` }} />}
            {cat}
            <span style={{ padding:"1px 7px", borderRadius:10, background:"rgba(255,255,255,0.07)", fontSize:10, color:"rgba(255,255,255,0.35)", fontWeight:600 }}>
              {counts[cat]}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

// ── Course card ───────────────────────────────────────────────
function CourseCard({ course, prog, onDelete, deletingId, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [delHovered, setDelHovered] = useState(false);
  const cfg = getCfg(course.category);
  const completed = prog?.completed || 0;
  const total = course.total_videos || 1;
  const pct = Math.round((completed / total) * 100);
  const isDeleting = deletingId === course.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      style={{
        borderRadius: 20, overflow: "hidden", cursor: "pointer",
        border: `1px solid ${hovered ? cfg.border : "rgba(255,255,255,0.07)"}`,
        background: "rgba(255,255,255,0.03)",
        boxShadow: hovered ? `0 12px 48px ${cfg.glow}, 0 0 0 1px ${cfg.border}` : "0 2px 8px rgba(0,0,0,0.25)",
        transition: "all .28s cubic-bezier(0.22,1,0.36,1)",
        display: "flex", flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Thumbnail / placeholder */}
      <div style={{ position: "relative", height: 148, overflow: "hidden", flexShrink: 0 }}>
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title}
            style={{ width: "100%", height: "100%", objectFit: "cover",
              transform: hovered ? "scale(1.06)" : "scale(1)",
              transition: "transform .5s cubic-bezier(0.22,1,0.36,1)",
            }} />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: `linear-gradient(135deg, ${cfg.bg}, rgba(0,0,0,0.3))`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Film size={36} style={{ color: cfg.color, opacity: 0.5 }} />
          </div>
        )}

        {/* Dark overlay on hover */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)",
          opacity: hovered ? 1 : 0.4,
          transition: "opacity .3s",
        }} />

        {/* Play icon center */}
        <motion.div
          animate={{ scale: hovered ? 1 : 0.7, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.22 }}
          style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div style={{
            width: 46, height: 46, borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <PlayCircle size={22} style={{ color: "#fff" }} />
          </div>
        </motion.div>

        {/* Category badge top-left */}
        <div style={{
          position: "absolute", top: 10, left: 10,
          padding: "4px 10px", borderRadius: 20,
          background: cfg.bg, border: `1px solid ${cfg.border}`,
          fontSize: 10, fontWeight: 700, color: cfg.color,
          backdropFilter: "blur(8px)",
          boxShadow: `0 0 12px ${cfg.glow}`,
        }}>
          {course.category}
        </div>

        {/* Delete button top-right */}
        <motion.button
          onHoverStart={() => setDelHovered(true)}
          onHoverEnd={() => setDelHovered(false)}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={e => { e.stopPropagation(); onDelete(e, course.id); }}
          disabled={isDeleting}
          style={{
            position: "absolute", top: 10, right: 10,
            width: 30, height: 30, borderRadius: 10,
            background: delHovered ? "rgba(248,113,113,0.25)" : "rgba(0,0,0,0.4)",
            border: `1px solid ${delHovered ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.15)"}`,
            backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all .2s",
            opacity: isDeleting ? 0.5 : 1,
          }}
        >
          <Trash2 size={12} style={{ color: delHovered ? "#f87171" : "rgba(255,255,255,0.6)" }} />
        </motion.button>
      </div>

      {/* Card body */}
      <div style={{ padding: "16px 18px 18px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ marginBottom: 14 }}>
          <p style={{
            fontSize: 14, fontWeight: 700, lineHeight: 1.35,
            color: hovered ? "#fff" : "rgba(255,255,255,0.85)",
            marginBottom: 5, transition: "color .2s",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {course.title}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <PlayCircle size={11} style={{ color: "rgba(255,255,255,0.25)" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{course.total_videos} videos</span>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div style={{
            height: 5, borderRadius: 4,
            background: "rgba(255,255,255,0.07)",
            overflow: "hidden", marginBottom: 6,
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: [0.22,1,0.36,1], delay: 0.2 }}
              style={{
                height: "100%", borderRadius: 4,
                background: pct === 100
                  ? "linear-gradient(90deg, #34d399, #059669)"
                  : `linear-gradient(90deg, ${cfg.color}, ${cfg.color}99)`,
                boxShadow: `0 0 10px ${pct > 0 ? cfg.color : "transparent"}66`,
                animation: pct > 0 && pct < 100 ? "progressGlow 2s ease-in-out infinite" : "none",
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: pct === 100 ? "#34d399" : pct === 0 ? "rgba(255,255,255,0.25)" : cfg.color,
            }}>
              {pct === 100 ? "✓ Completed" : pct === 0 ? "Not started" : `${pct}% · ${completed}/${total}`}
            </span>
            <motion.div
              animate={{ x: hovered ? 2 : 0, opacity: hovered ? 0.7 : 0 }}
              transition={{ duration: 0.18 }}
            >
              <ChevronRight size={13} style={{ color: cfg.color }} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <motion.div
        animate={{ scaleX: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
        initial={{ scaleX: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: 2, transformOrigin: "left",
          background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)`,
        }}
      />
    </motion.div>
  );
}

// ── Add course panel ──────────────────────────────────────────
function AddCoursePanel({ onSubmit, adding, addError, playlistUrl, setPlaylistUrl, customTitle, setCustomTitle }) {
  const [urlFocused, setUrlFocused] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);

  const inputStyle = (focused) => ({
    width: "100%", padding: "12px 16px", borderRadius: 12,
    border: `1px solid ${focused ? "rgba(124,58,237,0.55)" : "rgba(255,255,255,0.09)"}`,
    background: focused ? "rgba(124,58,237,0.06)" : "rgba(255,255,255,0.03)",
    boxShadow: focused ? "0 0 0 3px rgba(124,58,237,0.12)" : "none",
    color: "rgba(255,255,255,0.88)", fontSize: 13, fontFamily: "inherit",
    outline: "none", transition: "all .22s", boxSizing: "border-box",
  });

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, y: -10 }}
      animate={{ opacity: 1, height: "auto", y: 0 }}
      exit={{ opacity: 0, height: 0, y: -10 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{ overflow: "hidden", marginBottom: 28 }}
    >
      <div style={{
        padding: "24px 24px 22px",
        borderRadius: 20,
        border: "1px solid rgba(124,58,237,0.28)",
        background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(255,255,255,0.02))",
        boxShadow: "0 8px 40px rgba(124,58,237,0.12)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 12px rgba(124,58,237,0.25)",
          }}>
            <Link2 size={13} style={{ color: "#a78bfa" }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.88)" }}>
            Add YouTube Playlist
          </span>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>
          Paste any public YouTube playlist URL and it becomes a structured course.
        </p>

        {/* Error */}
        <AnimatePresence>
          {addError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                padding: "10px 14px", borderRadius: 10, marginBottom: 14,
                background: "rgba(248,113,113,0.10)",
                border: "1px solid rgba(248,113,113,0.3)",
                fontSize: 12, color: "#f87171",
              }}
            >
              {addError}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            type="text" value={playlistUrl} onChange={e => setPlaylistUrl(e.target.value)}
            placeholder="https://youtube.com/playlist?list=PLxxxxx"
            required onFocus={() => setUrlFocused(true)} onBlur={() => setUrlFocused(false)}
            style={inputStyle(urlFocused)}
          />
          <input
            type="text" value={customTitle} onChange={e => setCustomTitle(e.target.value)}
            placeholder="Course title (optional — auto-detected)"
            onFocus={() => setTitleFocused(true)} onBlur={() => setTitleFocused(false)}
            style={inputStyle(titleFocused)}
          />
          <motion.button
            type="submit" disabled={adding}
            whileHover={{ scale: adding ? 1 : 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: "13px 20px", borderRadius: 12, marginTop: 4,
              background: adding ? "rgba(124,58,237,0.3)" : "linear-gradient(135deg, #7c3aed, #5b21b6)",
              border: "1px solid rgba(124,58,237,0.5)",
              color: "#fff", fontSize: 13, fontWeight: 700,
              cursor: adding ? "not-allowed" : "pointer", fontFamily: "inherit",
              boxShadow: adding ? "none" : "0 4px 20px rgba(124,58,237,0.4)",
              transition: "all .22s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {adding ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%" }} />
                Fetching playlist…
              </>
            ) : (
              <><Sparkles size={14} /> Convert to Course</>
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function CoursifyPage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setUserId(session.user.id);
      await loadCourses(session.user.id);
    };
    init();
  }, [router]);

  const loadCourses = async (uid) => {
    setLoading(true);
    const { data: coursesData } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
    const { data: progressData } = await supabase.from("user_progress").select("course_id, video_id, completed").eq("user_id", uid);
    const progressMap = {};
    (progressData || []).forEach(p => {
      if (!progressMap[p.course_id]) progressMap[p.course_id] = { completed: 0 };
      if (p.completed) progressMap[p.course_id].completed++;
    });
    setCourses(coursesData || []);
    setProgress(progressMap);
    setLoading(false);
  };

  const extractPlaylistId = (url) => { const m = url.match(/[?&]list=([^&]+)/); return m ? m[1] : null; };

  const handleDelete = async (e, courseId) => {
    e.stopPropagation();
    if (!confirm("Delete this course? This cannot be undone.")) return;
    setDeletingId(courseId);
    await supabase.from("course_videos").delete().eq("course_id", courseId);
    await supabase.from("user_progress").delete().eq("course_id", courseId);
    await supabase.from("courses").delete().eq("id", courseId);
    setCourses(prev => prev.filter(c => c.id !== courseId));
    setDeletingId(null);
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setAddError("");
    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) { setAddError("Invalid YouTube playlist URL — make sure it contains '?list=' or '&list='"); return; }
    setAdding(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
      const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`);
      const data = await res.json();
      if (data.error) { setAddError("Could not fetch playlist. Make sure it's public."); setAdding(false); return; }
      const items = data.items || [];
      if (items.length === 0) { setAddError("Playlist is empty or private."); setAdding(false); return; }
      const firstVideo = items[0]?.snippet;
      const thumbnail = firstVideo?.thumbnails?.medium?.url || "";
      const title = customTitle || firstVideo?.channelTitle || "My Course";
      const { data: courseData, error: courseError } = await supabase.from("courses").insert({
        created_by: userId, title, playlist_id: playlistId, thumbnail,
        category: "Custom", is_public: false, total_videos: items.length,
      }).select().single();
      if (courseError) { setAddError(courseError.message); setAdding(false); return; }
      const videos = items.map((item, index) => ({
        course_id: courseData.id, video_id: item.snippet?.resourceId?.videoId,
        title: item.snippet?.title, thumbnail: item.snippet?.thumbnails?.medium?.url, position: index,
      }));
      await supabase.from("course_videos").insert(videos);
      setCourses([courseData, ...courses]);
      setPlaylistUrl(""); setCustomTitle(""); setShowAdd(false);
    } catch { setAddError("Something went wrong. Please try again."); }
    setAdding(false);
  };

  const filtered = activeCategory === "All" ? courses : courses.filter(c => c.category === activeCategory);

  return (
    <AppShell>
      <AmbientOrbs />
      <div style={{ position: "relative", zIndex: 1, padding: "32px 24px 64px", maxWidth: 900, margin: "0 auto" }}>

        {/* ── Header row ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, gap: 16, flexWrap: "wrap" }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <motion.div animate={{ rotate: [0, 12, -8, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 7 }}>
                <BookOpen size={17} style={{ color: "#c084fc" }} />
              </motion.div>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(192,132,252,0.7)" }}>
                Video Learning Portal
              </span>
            </div>
            <h1 style={{
              fontSize: 30, fontWeight: 800, lineHeight: 1.15, marginBottom: 6,
              background: "linear-gradient(135deg, #fff 0%, #e2d9f3 40%, #c084fc 80%, #818cf8 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Coursify
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
              Turn YouTube playlists into structured learning portals
            </p>
          </div>

          <motion.button
            onClick={() => setShowAdd(v => !v)}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}
            style={{
              display: "flex", alignItems: "center", gap: 7, padding: "11px 20px",
              borderRadius: 12, fontFamily: "inherit", cursor: "pointer",
              background: showAdd ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #7c3aed, #5b21b6)",
              border: `1px solid ${showAdd ? "rgba(255,255,255,0.12)" : "rgba(124,58,237,0.6)"}`,
              color: "#fff", fontSize: 13, fontWeight: 700,
              boxShadow: showAdd ? "none" : "0 4px 20px rgba(124,58,237,0.4)",
              transition: "all .22s",
            }}
          >
            <motion.div animate={{ rotate: showAdd ? 45 : 0 }} transition={{ duration: 0.22 }}>
              <Plus size={15} />
            </motion.div>
            {showAdd ? "Close" : "Add Playlist"}
          </motion.button>
        </motion.div>

        {/* ── Add panel ── */}
        <AnimatePresence>
          {showAdd && (
            <AddCoursePanel
              onSubmit={handleAddCourse} adding={adding} addError={addError}
              playlistUrl={playlistUrl} setPlaylistUrl={setPlaylistUrl}
              customTitle={customTitle} setCustomTitle={setCustomTitle}
            />
          )}
        </AnimatePresence>

        {/* ── Filter pills ── */}
        {!loading && <FilterPills active={activeCategory} onChange={setActiveCategory} courses={courses} />}

        {/* ── Content ── */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: "center", padding: "64px 0" }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: 20, margin: "0 auto 20px",
              background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Film size={28} style={{ color: "#a78bfa", opacity: 0.6 }} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>No courses yet</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>Paste a YouTube playlist to create your first course</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {filtered.map((course, i) => (
                <CourseCard
                  key={course.id} course={course} prog={progress[course.id]}
                  onDelete={handleDelete} deletingId={deletingId}
                  onClick={() => router.push(`/coursify/${course.id}`)}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </AppShell>
  );
}