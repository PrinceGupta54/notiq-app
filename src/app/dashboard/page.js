// src/app/dashboard/page.js — FULLY RESPONSIVE VERSION + EDIT PROFILE CARD
// Paste this ENTIRE file into src/app/dashboard/page.js

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import {
  CheckSquare, Calculator, Timer, PlayCircle,
  MessageCircle, Trophy, FileText, BookOpen,
  Bell, Award, Building2, Plus, Trash2,
  TrendingUp, Zap, Target, ArrowUpRight, Layers,
  ClipboardList, Palmtree, User, Pencil, Sparkles,
} from "lucide-react";

/* ─── helpers ─── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
function formatDate() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

/* ─── Attendance SVG Ring ─── */
function AttendanceRing({ pct }) {
  const r = 38, circ = 2 * Math.PI * r;
  const safe  = pct !== null && pct >= 75;
  const color = pct === null ? "#52525b" : safe ? "#86efac" : "#fda4af";
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    if (pct === null) return;
    let start = null;
    const animate = (ts) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / 900, 1);
      setDisplayed(Math.round(prog * pct));
      if (prog < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [pct]);
  return (
    <div style={{ position: "relative", width: 96, height: 96, flexShrink: 0 }}>
      <svg width="96" height="96" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="7" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - (pct || 0) / 100)}
          style={{ transition:"stroke-dashoffset 1s cubic-bezier(.34,1,.64,1)", filter:`drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
        <span style={{ fontSize:16,fontWeight:700,color:"#fff",lineHeight:1 }}>
          {pct !== null ? `${displayed}%` : "—"}
        </span>
        <span style={{ fontSize:9,color:"rgba(255,255,255,.3)",marginTop:2 }}>attend</span>
      </div>
    </div>
  );
}

/* ─── Animated Counter ─── */
function Counter({ value, suffix = "" }) {
  const [display, setDisplay] = useState(0);
  const num = parseFloat(value) || 0;
  useEffect(() => {
    let start = null;
    const animate = (ts) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / 800, 1);
      const ease = 1 - Math.pow(1 - prog, 3);
      setDisplay(parseFloat((ease * num).toFixed(2)));
      if (prog < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [num]);
  return <>{display}{suffix}</>;
}

/* ─── Tile data ─── */
const STUDY_TOOLS = [
  { label:"Attendance", href:"/attendance",  icon:CheckSquare,  color:"#a78bfa", glow:"124,58,237"  },
  { label:"SGPA Calc",  href:"/sgpa",        icon:Calculator,   color:"#67e8f9", glow:"103,232,249" },
  { label:"Pomodoro",   href:"/pomodoro",    icon:Timer,        color:"#f0abfc", glow:"240,171,252" },
];
const LEARN = [
  { label:"Coursify",   href:"/coursify",   icon:PlayCircle,    color:"#86efac", glow:"134,239,172" },
  { label:"Doubt Chat", href:"/doubt-chat", icon:MessageCircle, color:"#fda4af", glow:"253,164,175" },
  { label:"Exam Hub",   href:"/exam-hub",   icon:Trophy,        color:"#fcd34d", glow:"252,211,77"  },
];
const RESOURCES = [
  { label:"Notes",     href:"/notes",     icon:FileText,      color:"#a78bfa", glow:"124,58,237"  },
  { label:"E-Books",   href:"/ebooks",    icon:BookOpen,      color:"#67e8f9", glow:"103,232,249" },
  { label:"Notices",   href:"/notices",   icon:Bell,          color:"#f0abfc", glow:"240,171,252" },
  { label:"Syllabus",  href:"/syllabus",  icon:Layers,        color:"#c4b5fd", glow:"167,139,250" },
  { label:"PYQ",       href:"/pyq",       icon:ClipboardList, color:"#86efac", glow:"134,239,172" },
  { label:"Holidays",  href:"/holidays",  icon:Palmtree,      color:"#fb923c", glow:"251,146,60"  },
];
const UNIVERSITY = [
  { label:"Results",      href:"/results",            icon:Award,     color:"#86efac", glow:"134,239,172" },
  { label:"Universities", href:"/bihar-universities",  icon:Building2, color:"#fcd34d", glow:"252,211,77"  },
];
/* ── NEW: Account section, houses Edit Profile tile ── */
const ACCOUNT = [
  { label:"Edit Profile", href:"/profile/edit", icon:User, color:"#c4b5fd", glow:"167,139,250" },
];
const TILE_SECTIONS = [
  { title:"STUDY TOOLS", tiles:STUDY_TOOLS, accentGlow:"124,58,237"  },
  { title:"LEARN",       tiles:LEARN,       accentGlow:"252,211,77"  },
  { title:"RESOURCES",   tiles:RESOURCES,   accentGlow:"103,232,249" },
  { title:"UNIVERSITY",  tiles:UNIVERSITY,  accentGlow:"134,239,172" },
  { title:"ACCOUNT",     tiles:ACCOUNT,     accentGlow:"167,139,250" }, /* NEW */
];

/* ─── Tile component ─── */
function Tile({ tile, index, globalDelay = 0 }) {
  const [hov, setHov] = useState(false);
  const Icon = tile.icon;
  return (
    <motion.div
      initial={{ opacity:0, scale:0.82, y:8 }}
      animate={{ opacity:1, scale:1,    y:0 }}
      transition={{ delay:globalDelay + index * 0.04, duration:0.35, ease:[0.22,1,.36,1] }}
      whileHover={{ scale:1.1, y:-4 }}
      whileTap={{ scale:0.93 }}
      onHoverStart={() => setHov(true)}
      onHoverEnd  ={() => setHov(false)}
    >
      <Link
        href={tile.href}
        className="dash-tile-link"
        style={{
          display       : "flex",
          flexDirection : "column",
          alignItems    : "center",
          gap           : 8,
          borderRadius  : 14,
          background    : hov ? `rgba(${tile.glow},.2)` : `rgba(${tile.glow},.07)`,
          border        : `1px solid rgba(${tile.glow},${hov ? ".4" : ".15"})`,
          boxShadow     : hov
            ? `0 10px 28px rgba(${tile.glow},.28), 0 0 0 1px rgba(${tile.glow},.2), inset 0 1px 0 rgba(255,255,255,.06)`
            : "0 2px 8px rgba(0,0,0,.2)",
          textDecoration: "none",
          transition    : "all .22s cubic-bezier(.34,1.2,.64,1)",
          position      : "relative",
          overflow      : "hidden",
        }}
      >
        {hov && (
          <motion.div
            initial={{ opacity:0, scale:0.5 }}
            animate={{ opacity:1, scale:1   }}
            style={{
              position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)",
              width:60, height:60, borderRadius:"50%",
              background:`radial-gradient(circle,rgba(${tile.glow},.35),transparent 70%)`,
              pointerEvents:"none",
            }}
          />
        )}
        <Icon
          className="dash-tile-icon"
          size={20}
          style={{
            color     : tile.color,
            filter    : hov ? `drop-shadow(0 0 9px ${tile.color})` : "none",
            transition: "filter .22s",
            position  : "relative",
            zIndex    : 1,
          }}
        />
        <span className="dash-tile-label" style={{
          fontWeight   : 600,
          color        : hov ? tile.color : "rgba(255,255,255,.4)",
          textAlign    : "center",
          lineHeight   : 1.25,
          letterSpacing: ".02em",
          transition   : "color .22s",
          position     : "relative",
          zIndex       : 1,
        }}>
          {tile.label}
        </span>
      </Link>
    </motion.div>
  );
}

const glass = {
  background    : "rgba(255,255,255,.04)",
  border        : "1px solid rgba(255,255,255,.08)",
  borderRadius  : 18,
  backdropFilter: "blur(12px)",
};

/* ─── NEW: Edit Profile featured card ───────────────────────
   Sits right under the greeting — a premium, glowing entry
   point into the profile editor with avatar preview & CTA. */
function EditProfileCard({ profile, router }) {
  const [hov, setHov] = useState(false);
  const fullName  = profile?.full_name || "";
  const avatarUrl = profile?.avatar_url || "";
  const college   = profile?.college || profile?.university?.toUpperCase() || "";
  const branch    = profile?.branch || "";

  return (
    <motion.div
      initial={{ opacity:0, y:18 }}
      animate={{ opacity:1, y:0  }}
      transition={{ delay:0.18, duration:0.45, ease:[0.22,1,.36,1] }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => router.push("/profile/edit")}
      style={{
        ...glass,
        position    : "relative",
        overflow    : "hidden",
        padding     : "18px 20px",
        marginBottom: 20,
        cursor      : "pointer",
        display     : "flex",
        alignItems  : "center",
        gap         : 16,
        borderColor : hov ? "rgba(167,139,250,.4)" : "rgba(255,255,255,.08)",
        boxShadow   : hov
          ? "0 16px 36px rgba(124,58,237,.22), 0 0 0 1px rgba(167,139,250,.25)"
          : "0 2px 12px rgba(0,0,0,.25)",
        transform   : hov ? "translateY(-3px)" : "translateY(0)",
        transition  : "all .25s cubic-bezier(.34,1.2,.64,1)",
      }}
    >
      {/* Ambient glow orb that drifts on hover */}
      <motion.div
        animate={{
          opacity: hov ? 1 : 0.45,
          scale  : hov ? 1.15 : 1,
        }}
        transition={{ duration:0.4 }}
        style={{
          position:"absolute", top:-40, right:-40,
          width:160, height:160, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(124,58,237,.28),transparent 70%)",
          pointerEvents:"none",
        }}
      />

      {/* Sweeping shimmer line on hover */}
      {hov && (
        <motion.div
          initial={{ x:"-100%" }}
          animate={{ x:"200%" }}
          transition={{ duration:1.1, ease:"easeInOut" }}
          style={{
            position:"absolute", top:0, bottom:0, width:"40%",
            background:"linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent)",
            pointerEvents:"none",
          }}
        />
      )}

      {/* Avatar */}
      <motion.div
        animate={{ scale: hov ? 1.06 : 1 }}
        transition={{ duration:0.25 }}
        style={{
          width:54, height:54, borderRadius:"50%", flexShrink:0, position:"relative",
          background: avatarUrl
            ? `url(${avatarUrl}) center/cover no-repeat`
            : "radial-gradient(circle at 35% 30%, #c4b5fd, #7c3aed)",
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow: hov
            ? "0 0 0 3px rgba(124,58,237,.25), 0 0 26px rgba(124,58,237,.4)"
            : "0 0 0 2px rgba(124,58,237,.15), 0 0 16px rgba(124,58,237,.2)",
          transition:"box-shadow .25s",
        }}
      >
        {!avatarUrl && (
          <span style={{ fontSize:20, fontWeight:900, color:"#fff" }}>
            {fullName ? fullName[0].toUpperCase() : <User size={22} />}
          </span>
        )}
      </motion.div>

      {/* Info */}
      <div style={{ flex:1, minWidth:0, position:"relative", zIndex:1 }}>
        <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3 }}>
          <p style={{
            fontSize:15, fontWeight:700, color:"#fff",
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
          }}>
            {fullName || "Complete your profile"}
          </p>
          {(!fullName || !branch) && (
            <motion.span
              animate={{ opacity:[1,.5,1] }}
              transition={{ duration:1.8, repeat:Infinity }}
              style={{
                display:"flex", alignItems:"center", gap:3,
                fontSize:9.5, fontWeight:700, color:"#fbbf24",
                background:"rgba(251,191,36,.12)", border:"1px solid rgba(251,191,36,.3)",
                borderRadius:20, padding:"2px 8px", flexShrink:0,
              }}
            >
              <Sparkles size={9} /> Setup
            </motion.span>
          )}
        </div>
        <p style={{
          fontSize:12, color:"rgba(255,255,255,.4)",
          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
        }}>
          {branch || college
            ? `${branch ? branch : ""}${branch && college ? " · " : ""}${college || ""}`
            : "Add your college, branch & semester"}
        </p>
      </div>

      {/* Edit pill button */}
      <motion.div
        animate={{
          background: hov ? "rgba(124,58,237,.22)" : "rgba(124,58,237,.12)",
          borderColor: hov ? "rgba(124,58,237,.5)" : "rgba(124,58,237,.25)",
        }}
        style={{
          display:"flex", alignItems:"center", gap:6, flexShrink:0,
          padding:"8px 14px", borderRadius:10,
          border:"1px solid rgba(124,58,237,.25)",
          position:"relative", zIndex:1,
          boxShadow: hov ? "0 0 16px rgba(124,58,237,.3)" : "none",
          transition:"box-shadow .25s",
        }}
      >
        <Pencil size={12} style={{ color:"#c4b5fd" }} />
        <span style={{ fontSize:12, fontWeight:600, color:"#c4b5fd", whiteSpace:"nowrap" }}>
          Edit
        </span>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export default function DashboardPage() {
  const router = useRouter();
  const [profile,     setProfile]     = useState(null);
  const [todos,       setTodos]       = useState([]);
  const [newTask,     setNewTask]     = useState("");
  const [attendance,  setAttendance]  = useState(null);
  const [latestSgpa,  setLatestSgpa]  = useState(null);
  const [studyStreak, setStudyStreak] = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [hoveredStat, setHoveredStat] = useState(null);
  const [hoveredTodo, setHoveredTodo] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const uid = session.user.id;
      const todayStart = new Date(); todayStart.setHours(0,0,0,0);
      const [profileRes, subjectsRes, todosRes, sgpaRes, pomRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", uid).single(),
        supabase.from("subjects").select("total_classes,attended_classes").eq("user_id", uid),
        supabase.from("todos").select("*").eq("user_id", uid).order("created_at", { ascending:true }),
        supabase.from("sgpa_records").select("sgpa").eq("user_id", uid).order("created_at", { ascending:false }).limit(1),
        supabase.from("pomodoro_sessions").select("id").eq("user_id", uid).gte("completed_at", todayStart.toISOString()),
      ]);
      setProfile(profileRes.data);
      const subs = subjectsRes.data || [];
      const total = subs.reduce((s,x) => s + x.total_classes, 0);
      const attended = subs.reduce((s,x) => s + x.attended_classes, 0);
      setAttendance(total === 0 ? null : parseFloat(((attended/total)*100).toFixed(1)));
      setTodos(todosRes.data || []);
      setLatestSgpa(sgpaRes.data?.[0]?.sgpa ?? null);
      setStudyStreak(pomRes.data?.length ?? 0);
      setLoading(false);
    };
    load();
  }, [router]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase.from("todos").insert({ task:newTask.trim(), user_id:session.user.id }).select().single();
    if (!error && data) { setTodos([...todos, data]); setNewTask(""); }
  };
  const toggleTask = async (id, done) => {
    setTodos(todos.map(t => t.id === id ? { ...t, is_done:!done } : t));
    await supabase.from("todos").update({ is_done:!done }).eq("id", id);
  };
  const deleteTask = async (id) => {
    setTodos(todos.filter(t => t.id !== id));
    await supabase.from("todos").delete().eq("id", id);
  };

  if (loading) {
    return (
      <AppShell>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
          <motion.div initial={{ opacity:0, scale:.85 }} animate={{ opacity:1, scale:1 }} style={{ textAlign:"center" }}>
            <div style={{
              width:48, height:48, borderRadius:"50%",
              border:"3px solid rgba(124,58,237,.25)", borderTopColor:"#7c3aed",
              animation:"spin 1s linear infinite", margin:"0 auto 16px",
              boxShadow:"0 0 20px rgba(124,58,237,.3)",
            }} />
            <p style={{ color:"rgba(255,255,255,.35)", fontSize:14 }}>Loading your dashboard…</p>
          </motion.div>
        </div>
      </AppShell>
    );
  }

  const firstName = profile?.full_name?.split(" ")[0] || "Student";
  const doneTodos = todos.filter(t => t.is_done).length;
  const pct = attendance;

  const STATS = [
    { id:"attend",   label:"Attendance",    value:pct !== null ? `${pct}` : "—", suffix:pct !== null ? "%" : "",
      sub:pct !== null ? (pct >= 75 ? "✓ Safe to bunk" : "⚠ Below 75%") : "Add subjects",
      accent:pct !== null ? (pct >= 75 ? "#86efac" : "#fda4af") : "#a78bfa",
      glow:pct !== null ? (pct >= 75 ? "134,239,172" : "253,164,175") : "124,58,237", icon:Target,    href:"/attendance" },
    { id:"sgpa",     label:"Latest SGPA",   value:latestSgpa ?? "—", suffix:"",
      sub:latestSgpa ? "Most recent semester" : "Not calculated yet",
      accent:"#67e8f9", glow:"103,232,249", icon:TrendingUp, href:"/sgpa" },
    { id:"sessions", label:"Focus Sessions", value:studyStreak, suffix:" 🍅",
      sub:studyStreak > 0 ? "Keep the streak going!" : "Start a Pomodoro",
      accent:"#f0abfc", glow:"240,171,252", icon:Zap,       href:"/pomodoro" },
    { id:"tasks",    label:"Tasks Done",    value:`${doneTodos}/${todos.length}`, suffix:"",
      sub:todos.length === 0 ? "Add tasks below" : doneTodos === todos.length && todos.length > 0 ? "All done! 🎉" : "In progress",
      accent:"#fcd34d", glow:"252,211,77",  icon:CheckSquare, href:null },
  ];

  return (
    <AppShell>

      {/* ══ RESPONSIVE STYLES ══ */}
      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }

        /* ── Layout wrappers ── */
        .dash-wrap       { padding:32px 28px; max-width:1080px; margin:0 auto; }
        .dash-stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:20px; }
        .dash-two-col    { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:20px; }
        .dash-stat-val   { font-size:26px; font-weight:800; color:#fff; line-height:1; margin-bottom:6px; }
        .dash-greeting   { font-size:30px; font-weight:800; line-height:1.15; margin-bottom:6px;
                           background:linear-gradient(135deg,#fff 0%,#c4b5fd 45%,#818cf8 100%);
                           -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

        /* ── Tiles ── */
        .dash-tile-link  { padding:14px 8px; }
        .dash-tile-icon  { width:20px; height:20px; }
        .dash-tile-label { font-size:9.5px; }
        .dash-tiles-3  { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
        .dash-tiles-5  { display:grid; grid-template-columns:repeat(5,1fr); gap:10px; }
        .dash-tiles-6  { display:grid; grid-template-columns:repeat(6,1fr); gap:10px; }
        .dash-tiles-2  { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
        .dash-tiles-1  { display:grid; grid-template-columns:repeat(1,1fr); gap:10px; max-width:220px; }

        /* ── Quick access box ── */
        .dash-qa-box { padding:24px 24px 20px; }
        .dash-qa-title { font-size:13px; font-weight:600; color:rgba(255,255,255,.82); margin-bottom:20px; }
        .dash-section-gap { gap:22px; }

        /* ── Planner + Attendance cards ── */
        .dash-att-ring-wrap { gap:20px; }
        .dash-att-pct       { font-size:32px; }

        /* ════════════════════════
           TABLET  ≤ 1024px
        ════════════════════════ */
        @media (max-width:1024px) {
          .dash-stats-grid { grid-template-columns:repeat(2,1fr); gap:12px; }
          .dash-tiles-5    { grid-template-columns:repeat(4,1fr); }
          .dash-tiles-6    { grid-template-columns:repeat(4,1fr); }
        }

        /* ════════════════════════
           MOBILE  ≤ 768px
        ════════════════════════ */
        @media (max-width:768px) {
          .dash-wrap       { padding:20px 14px; }
          .dash-greeting   { font-size:22px; }
          .dash-stats-grid { grid-template-columns:repeat(2,1fr); gap:10px; margin-bottom:14px; }
          .dash-stat-val   { font-size:20px; }
          .dash-two-col    { grid-template-columns:1fr; gap:12px; margin-bottom:14px; }
          .dash-att-ring-wrap { gap:14px; }
          .dash-att-pct    { font-size:24px; }
          .dash-tiles-3    { grid-template-columns:repeat(3,1fr); gap:8px; }
          .dash-tiles-5    { grid-template-columns:repeat(3,1fr); gap:8px; }
          .dash-tiles-6    { grid-template-columns:repeat(3,1fr); gap:8px; }
          .dash-tiles-2    { grid-template-columns:repeat(2,1fr); gap:8px; }
          .dash-tiles-1    { max-width:180px; }
          .dash-tile-link  { padding:10px 4px; gap:5px; border-radius:11px; }
          .dash-tile-label { font-size:8.5px; }
          .dash-qa-box     { padding:16px 14px 14px; }
          .dash-qa-title   { font-size:12px; margin-bottom:14px; }
          .dash-section-gap { gap:16px !important; }
        }

        /* ════════════════════════
           SMALL MOBILE  ≤ 480px
        ════════════════════════ */
        @media (max-width:480px) {
          .dash-wrap       { padding:16px 10px; }
          .dash-greeting   { font-size:19px; }
          .dash-stats-grid { gap:8px; }
          .dash-stat-val   { font-size:18px; }
          .dash-tiles-3    { grid-template-columns:repeat(3,1fr); gap:6px; }
          .dash-tiles-5    { grid-template-columns:repeat(3,1fr); gap:6px; }
          .dash-tiles-6    { grid-template-columns:repeat(3,1fr); gap:6px; }
          .dash-tiles-1    { max-width:160px; }
          .dash-tile-link  { padding:9px 3px; border-radius:10px; }
          .dash-tile-label { font-size:8px; }
        }
      `}</style>

      <div className="dash-wrap">

        {/* ══ GREETING ══ */}
        <motion.div
          initial={{ opacity:0, y:-16 }}
          animate={{ opacity:1, y:0   }}
          transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
          style={{ marginBottom:20 }}
        >
          <h1 className="dash-greeting">{getGreeting()}, {firstName} 👋</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,.32)", letterSpacing:".01em" }}>
            {formatDate()}
          </p>
        </motion.div>

        {/* ══ NEW: EDIT PROFILE FEATURED CARD ══ */}
        <EditProfileCard profile={profile} router={router} />

        {/* ══ STAT CARDS ══ */}
        <div className="dash-stats-grid">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            const hovered = hoveredStat === s.id;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity:0, y:20 }}
                animate={{ opacity:1, y:0  }}
                transition={{ delay:i*0.07, duration:0.45, ease:[0.22,1,.36,1] }}
                onClick={() => s.href && router.push(s.href)}
                onMouseEnter={() => setHoveredStat(s.id)}
                onMouseLeave={() => setHoveredStat(null)}
                style={{
                  ...glass,
                  padding   : "18px 16px",
                  cursor    : s.href ? "pointer" : "default",
                  transform : hovered ? "translateY(-5px) scale(1.01)" : "translateY(0) scale(1)",
                  boxShadow : hovered
                    ? `0 20px 40px rgba(${s.glow},.22), 0 0 0 1px rgba(${s.glow},.25)`
                    : "0 2px 12px rgba(0,0,0,.25)",
                  borderColor: hovered ? `rgba(${s.glow},.35)` : "rgba(255,255,255,.08)",
                  transition: "all .25s cubic-bezier(.34,1.2,.64,1)",
                  position  : "relative", overflow:"hidden",
                }}
              >
                {/* Glow orb */}
                <div style={{
                  position:"absolute", top:-20, right:-20,
                  width:70, height:70, borderRadius:"50%",
                  background:`radial-gradient(circle,rgba(${s.glow},.18),transparent 70%)`,
                  opacity:hovered ? 1 : 0.4, transition:"opacity .25s",
                }} />
                {/* Icon */}
                <div style={{
                  width:34, height:34, borderRadius:9,
                  background:`rgba(${s.glow},.15)`, border:`1px solid rgba(${s.glow},.25)`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  marginBottom:14,
                  boxShadow:hovered ? `0 0 14px rgba(${s.glow},.3)` : "none",
                  transition:"box-shadow .25s",
                }}>
                  <Icon size={16} style={{ color:s.accent }} />
                </div>
                <p style={{ fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:".1em", color:"rgba(255,255,255,.32)", marginBottom:6 }}>
                  {s.label}
                </p>
                <p className="dash-stat-val">
                  {typeof s.value === "number"
                    ? <Counter value={s.value} suffix={s.suffix} />
                    : <>{s.value}{s.suffix}</>}
                </p>
                <p style={{ fontSize:11, fontWeight:500, color:s.accent }}>{s.sub}</p>
                {s.href && (
                  <ArrowUpRight size={13} style={{
                    position:"absolute", top:14, right:14,
                    color:hovered ? s.accent : "rgba(255,255,255,.18)",
                    transition:"all .2s",
                    transform:hovered ? "translate(1px,-1px)" : "none",
                  }} />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* ══ TWO-COLUMN: Attendance + Planner ══ */}
        <div className="dash-two-col">

          {/* Attendance overview */}
          <motion.div
            initial={{ opacity:0, x:-20 }}
            animate={{ opacity:1, x:0   }}
            transition={{ delay:0.28, duration:0.45, ease:[0.22,1,.36,1] }}
            style={{ ...glass, padding:"20px 22px" }}
          >
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
              <p style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,.82)" }}>Attendance Overview</p>
              <Link href="/attendance" style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#a78bfa", textDecoration:"none", fontWeight:500 }}>
                View <ArrowUpRight size={11} />
              </Link>
            </div>
            <div className="dash-att-ring-wrap" style={{ display:"flex", alignItems:"center" }}>
              <AttendanceRing pct={pct} />
              <div>
                <p className="dash-att-pct" style={{ fontWeight:800, color:"#fff", lineHeight:1, marginBottom:5 }}>
                  {pct !== null ? `${pct}%` : "—"}
                </p>
                <p style={{
                  fontSize:12, fontWeight:500, marginBottom:10,
                  color:pct !== null ? (pct >= 75 ? "#86efac" : "#fda4af") : "rgba(255,255,255,.3)",
                }}>
                  {pct !== null
                    ? pct >= 75 ? `✓ You can bunk ${Math.floor(pct/0.75-(100/0.75*(pct/100))*0.75)} classes` : "⚠ Below 75% minimum"
                    : "No subjects added yet"}
                </p>
                <div style={{ height:4, width:140, background:"rgba(255,255,255,.07)", borderRadius:2, overflow:"hidden" }}>
                  <motion.div
                    initial={{ width:0 }}
                    animate={{ width:`${pct||0}%` }}
                    transition={{ duration:1, ease:[0.22,1,.36,1], delay:0.5 }}
                    style={{
                      height:"100%", borderRadius:2,
                      background:pct >= 75 ? "linear-gradient(90deg,#86efac,#34d399)" : "linear-gradient(90deg,#fda4af,#fb7185)",
                      boxShadow:pct >= 75 ? "0 0 8px rgba(134,239,172,.5)" : "0 0 8px rgba(253,164,175,.5)",
                    }}
                  />
                </div>
              </div>
            </div>
            <Link href="/sgpa"
              style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:18, padding:"11px 14px", background:"rgba(124,58,237,.1)", border:"1px solid rgba(124,58,237,.22)", borderRadius:11, textDecoration:"none", transition:"all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(124,58,237,.18)"; e.currentTarget.style.borderColor="rgba(124,58,237,.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(124,58,237,.1)";  e.currentTarget.style.borderColor="rgba(124,58,237,.22)"; }}
            >
              <span style={{ fontSize:12, color:"rgba(255,255,255,.55)" }}>Latest SGPA</span>
              <span style={{ fontSize:14, fontWeight:700, color:"#c4b5fd" }}>{latestSgpa ?? "Calculate →"}</span>
            </Link>
          </motion.div>

          {/* Study Planner */}
          <motion.div
            initial={{ opacity:0, x:20 }}
            animate={{ opacity:1, x:0  }}
            transition={{ delay:0.32, duration:0.45, ease:[0.22,1,.36,1] }}
            style={{ ...glass, padding:"20px 22px" }}
          >
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <p style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,.82)" }}>Study Planner</p>
              {todos.length > 0 && <span style={{ fontSize:11, color:"#a78bfa", fontWeight:600 }}>{doneTodos}/{todos.length} done</span>}
            </div>
            <form onSubmit={addTask} style={{ display:"flex", gap:8, marginBottom:14 }}>
              <input
                type="text" value={newTask} onChange={e => setNewTask(e.target.value)}
                placeholder="Add a task…"
                style={{ flex:1, padding:"9px 13px", background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", borderRadius:10, fontSize:13, color:"rgba(255,255,255,.88)", outline:"none", transition:"all .2s", fontFamily:"inherit" }}
                onFocus={e => { e.target.style.borderColor="rgba(124,58,237,.55)"; e.target.style.boxShadow="0 0 0 3px rgba(124,58,237,.12)"; }}
                onBlur ={e => { e.target.style.borderColor="rgba(255,255,255,.1)";  e.target.style.boxShadow="none"; }}
              />
              <motion.button
                whileTap={{ scale:0.9 }} type="submit"
                style={{ width:38, height:38, borderRadius:10, flexShrink:0, background:"linear-gradient(135deg,#7c3aed,#5b21b6)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 12px rgba(124,58,237,.35)", transition:"box-shadow .2s" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow="0 6px 18px rgba(124,58,237,.55)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow="0 4px 12px rgba(124,58,237,.35)"}
              >
                <Plus size={17} color="white" />
              </motion.button>
            </form>
            {todos.length === 0 ? (
              <p style={{ fontSize:13, color:"rgba(255,255,255,.2)", textAlign:"center", padding:"18px 0" }}>
                No tasks yet — add one above ✨
              </p>
            ) : (
              <div style={{ maxHeight:200, overflowY:"auto" }}>
                <AnimatePresence>
                  {todos.map(todo => (
                    <motion.div
                      key={todo.id}
                      initial={{ opacity:0, x:-10 }}
                      animate={{ opacity:1, x:0   }}
                      exit   ={{ opacity:0, x:10  }}
                      transition={{ duration:0.22 }}
                      onMouseEnter={() => setHoveredTodo(todo.id)}
                      onMouseLeave={() => setHoveredTodo(null)}
                      style={{
                        display:"flex", alignItems:"center", gap:10,
                        padding:"8px 8px", borderRadius:9, marginBottom:2,
                        background:hoveredTodo === todo.id ? "rgba(255,255,255,.04)" : "transparent",
                        transition:"background .15s",
                      }}
                    >
                      <input type="checkbox" checked={todo.is_done} onChange={() => toggleTask(todo.id, todo.is_done)}
                        style={{ width:15, height:15, accentColor:"#7c3aed", cursor:"pointer", flexShrink:0 }} />
                      <span style={{
                        flex:1, fontSize:13,
                        color:todo.is_done ? "rgba(255,255,255,.25)" : "rgba(255,255,255,.78)",
                        textDecoration:todo.is_done ? "line-through" : "none", transition:"all .2s",
                      }}>
                        {todo.task}
                      </span>
                      <motion.button
                        initial={{ opacity:0 }}
                        animate={{ opacity:hoveredTodo === todo.id ? 1 : 0 }}
                        onClick={() => deleteTask(todo.id)}
                        style={{ background:"none", border:"none", cursor:"pointer", padding:3, borderRadius:5, color:"#f87171", display:"flex" }}
                        whileHover={{ scale:1.15 }} whileTap={{ scale:0.9 }}
                      >
                        <Trash2 size={13} />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>

        {/* ══ QUICK ACCESS — 5 SECTIONED GROUPS (incl. new ACCOUNT) ══ */}
        <motion.div
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:1, y:0  }}
          transition={{ delay:0.42, duration:0.45, ease:[0.22,1,.36,1] }}
          className="dash-qa-box"
          style={{ ...glass }}
        >
          <p className="dash-qa-title">Quick Access</p>

          <div className="dash-section-gap" style={{ display:"flex", flexDirection:"column" }}>
            {TILE_SECTIONS.map((section, sIdx) => {
              const gridClass =
                section.tiles.length <= 1 ? "dash-tiles-1" :
                section.tiles.length <= 2 ? "dash-tiles-2" :
                section.tiles.length <= 3 ? "dash-tiles-3" :
                section.tiles.length <= 5 ? "dash-tiles-5" : "dash-tiles-6";
              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity:0, y:10 }}
                  animate={{ opacity:1, y:0  }}
                  transition={{ delay:0.48 + sIdx*0.06, duration:0.35, ease:[0.22,1,.36,1] }}
                >
                  {/* Section header */}
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                    <span style={{ fontSize:9.5, fontWeight:700, letterSpacing:".14em", textTransform:"uppercase", color:`rgba(${section.accentGlow},.7)`, whiteSpace:"nowrap" }}>
                      {section.title}
                    </span>
                    <div style={{ flex:1, height:1, background:`linear-gradient(90deg,rgba(${section.accentGlow},.25),transparent)` }} />
                  </div>
                  {/* Tiles */}
                  <div className={gridClass}>
                    {section.tiles.map((tile, tIdx) => (
                      <Tile key={tile.href} tile={tile} index={tIdx} globalDelay={0.52 + sIdx*0.06} />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </AppShell>
  );
}