// src/app/holidays/page.js
"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import {
  CalendarDays, X, Plus, Send, ShieldCheck, Sparkles,
  Palmtree, Star, Sun, Flower2, Flag, GraduationCap, Trash2,
  Search, ListFilter, LayoutGrid, ChevronDown, MapPin, Clock,
} from "lucide-react";

// ── BEU 2026 Pre-loaded holidays ──────────────────────────────
const BEU_HOLIDAYS = [
  { title: "नववर्ष आरम्भ",                          en: "New Year",            date: "2026-01-01", type: "National" },
  { title: "मकर संक्रांति",                          en: "Makar Sankranti",     date: "2026-01-14", type: "Festival" },
  { title: "बसंत पंचमी / सरस्वती पूजा",               en: "Basant Panchami",     date: "2026-01-23", type: "Festival" },
  { title: "गणतंत्र दिवस",                           en: "Republic Day",        date: "2026-01-26", type: "National" },
  { title: "संत रविदास जयंती",                       en: "Sant Ravidas Jayanti",date: "2026-02-01", type: "Festival" },
  { title: "शब-ए-बरात",                              en: "Shab-e-Barat",        date: "2026-02-04", type: "Festival" },
  { title: "महाशिवरात्रि",                           en: "Mahashivratri",       date: "2026-02-15", type: "Festival" },
  { title: "होलिकादहन / होली",                       en: "Holi",                date: "2026-03-02", type: "Festival" },
  { title: "होली",                                  en: "Holi",                date: "2026-03-03", type: "Festival" },
  { title: "होली",                                  en: "Holi",                date: "2026-03-04", type: "Festival" },
  { title: "इद-उल-फितर (ईद)",                        en: "Eid-ul-Fitr",         date: "2026-03-21", type: "Festival" },
  { title: "बिहार दिवस",                             en: "Bihar Day",           date: "2026-03-22", type: "State" },
  { title: "सम्राट अशोक जयंती",                       en: "Samrat Ashok Jayanti",date: "2026-03-26", type: "State" },
  { title: "रामनवमी",                                en: "Ram Navami",          date: "2026-03-27", type: "Festival" },
  { title: "महावीर जयंती",                           en: "Mahavir Jayanti",     date: "2026-03-31", type: "Festival" },
  { title: "गुड फ्राइडे",                             en: "Good Friday",         date: "2026-04-03", type: "Festival" },
  { title: "डॉ॰ भीम राव अंबेडकर जयंती",               en: "Ambedkar Jayanti",    date: "2026-04-14", type: "National" },
  { title: "वीर कुँवर सिंह जयंती",                    en: "Veer Kunwar Singh",   date: "2026-04-23", type: "State" },
  { title: "जानकी नवमी",                             en: "Janaki Navami",       date: "2026-04-25", type: "Festival" },
  { title: "मई दिवस / श्रम दिवस / बुद्ध पूर्णिमा",       en: "Labour Day / Buddha Purnima", date: "2026-05-01", type: "National" },
  { title: "इद-उल-जोहा (बकरीद)",                      en: "Eid-ul-Zoha",         date: "2026-05-28", type: "Festival" },
  { title: "ग्रीष्मावकाश आरम्भ",                       en: "Summer Vacation Begins", date: "2026-06-01", type: "Vacation" },
  { title: "चेहल्लुम",                                en: "Chehallum",           date: "2026-08-04", type: "Festival" },
  { title: "स्वतंत्रता दिवस",                          en: "Independence Day",    date: "2026-08-15", type: "National" },
  { title: "हजरत मोहम्मद साहब का जन्म दिवस",            en: "Eid-e-Milad",         date: "2026-08-26", type: "Festival" },
  { title: "रक्षाबंधन",                               en: "Raksha Bandhan",      date: "2026-08-28", type: "Festival" },
  { title: "श्री कृष्ण जन्माष्टमी",                     en: "Janmashtami",         date: "2026-09-04", type: "Festival" },
  { title: "महात्मा गाँधी जयंती",                       en: "Gandhi Jayanti",      date: "2026-10-02", type: "National" },
  { title: "दुर्गा पूजा (सप्तमी)",                      en: "Durga Puja",          date: "2026-10-17", type: "Festival" },
  { title: "दुर्गा पूजा (अष्टमी)",                      en: "Durga Puja",          date: "2026-10-18", type: "Festival" },
  { title: "दुर्गा पूजा (नवमी)",                       en: "Durga Puja",          date: "2026-10-19", type: "Festival" },
  { title: "दुर्गा पूजा (दशमी)",                       en: "Vijayadashami",       date: "2026-10-20", type: "Festival" },
  { title: "दीपावली / भाई दूज",                        en: "Diwali",              date: "2026-11-08", type: "Festival" },
  { title: "छठ पूजा",                                 en: "Chhath Puja",         date: "2026-11-15", type: "Festival" },
  { title: "छठ पूजा",                                 en: "Chhath Puja",         date: "2026-11-16", type: "Festival" },
  { title: "गुरुनानक जयंती / कार्तिक पूर्णिमा",          en: "Guru Nanak Jayanti",  date: "2026-11-24", type: "Festival" },
  { title: "क्रिसमस / शीतकालीन अवकाश आरम्भ",            en: "Christmas",           date: "2026-12-25", type: "Vacation" },
];

// ── Holiday type config ───────────────────────────────────────
const TYPE_CONFIG = {
  National: { color: "#f87171", glow: "rgba(248,113,113,.45)",  bg: "rgba(248,113,113,.13)", icon: Flag,     ring: "#fca5a5" },
  Festival: { color: "#fb923c", glow: "rgba(251,146,60,.45)",   bg: "rgba(251,146,60,.13)",  icon: Flower2,  ring: "#fdba74" },
  State:    { color: "#34d399", glow: "rgba(52,211,153,.45)",   bg: "rgba(52,211,153,.13)",  icon: Star,     ring: "#6ee7b7" },
  Vacation: { color: "#60a5fa", glow: "rgba(96,165,250,.45)",   bg: "rgba(96,165,250,.13)",  icon: Palmtree, ring: "#93c5fd" },
  Other:    { color: "#a78bfa", glow: "rgba(167,139,250,.45)",  bg: "rgba(167,139,250,.13)", icon: Sun,      ring: "#c4b5fd" },
};
const typeOf = (t) => TYPE_CONFIG[t] || TYPE_CONFIG.Other;

const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];
const MONTH_GRADIENTS = [
  "linear-gradient(135deg,#fff,#fecaca,#f87171)",
  "linear-gradient(135deg,#fff,#fed7aa,#fb923c)",
  "linear-gradient(135deg,#fff,#fde68a,#fbbf24)",
  "linear-gradient(135deg,#fff,#bbf7d0,#34d399)",
  "linear-gradient(135deg,#fff,#a7f3d0,#10b981)",
  "linear-gradient(135deg,#fff,#bae6fd,#38bdf8)",
  "linear-gradient(135deg,#fff,#bfdbfe,#60a5fa)",
  "linear-gradient(135deg,#fff,#c7d2fe,#818cf8)",
  "linear-gradient(135deg,#fff,#ddd6fe,#a78bfa)",
  "linear-gradient(135deg,#fff,#f5d0fe,#d946ef)",
  "linear-gradient(135deg,#fff,#fbcfe8,#ec4899)",
  "linear-gradient(135deg,#fff,#fecdd3,#fb7185)",
];
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

// ── Responsive hook ───────────────────────────────────────────
function useBreakpoint() {
  const [bp, setBp] = useState({ isMobile: false });
  useEffect(() => {
    const check = () => setBp({ isMobile: window.innerWidth < 640 });
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return bp;
}

// ── Ambient orbs ──────────────────────────────────────────────
function AmbientOrbs() {
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
      {[
        { top:"6%",  left:"3%",  size:340, color:"rgba(124,58,237,.08)",  dur:14, delay:0  },
        { top:"55%", right:"4%", size:300, color:"rgba(251,146,60,.06)",  dur:18, delay:3  },
        { top:"30%", left:"60%", size:240, color:"rgba(248,113,113,.05)", dur:22, delay:7  },
        { top:"80%", left:"15%", size:220, color:"rgba(52,211,153,.05)",  dur:16, delay:5  },
      ].map((orb, i) => (
        <motion.div key={i}
          animate={{ scale:[1,1.12,1], x:[0,20,-10,0], y:[0,-20,10,0] }}
          transition={{ duration:orb.dur, repeat:Infinity, ease:"easeInOut", delay:orb.delay }}
          style={{
            position:"absolute", top:orb.top, left:orb.left, right:orb.right,
            width:orb.size, height:orb.size, borderRadius:"50%",
            background:`radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter:"blur(54px)",
          }}
        />
      ))}
    </div>
  );
}

// ── Floating particles ────────────────────────────────────────
// NOTE: random values are generated only after client mount to avoid
// Next.js hydration mismatches (server render must match first client render).
function FloatingParticles() {
  const [particles, setParticles] = useState(null);

  useEffect(() => {
    setParticles(
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        yStart: Math.random()*-100,
        yEnd: Math.random()*-500,
        xEnd: (Math.random()-0.5)*140,
        duration: 7 + Math.random()*7,
        delay: Math.random()*8,
        bottom: Math.random()*25,
        left: Math.random()*100,
        color: ["#f87171","#fb923c","#34d399","#60a5fa","#a78bfa"][i % 5],
      }))
    );
  }, []);

  if (!particles) return null;

  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
      {particles.map(p => (
        <motion.div key={p.id}
          animate={{
            y: [p.yStart, p.yEnd],
            x: [0, p.xEnd],
            opacity: [0, 0.55, 0],
            scale: [0, 1, 0],
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease:"easeOut" }}
          style={{
            position:"absolute", bottom:`${p.bottom}%`, left:`${p.left}%`,
            width:3, height:3, borderRadius:"50%",
            background:p.color,
            boxShadow:"0 0 6px currentColor",
          }}
        />
      ))}
    </div>
  );
}

// ── Glass field helpers ────────────────────────────────────────
function GField({ as: Tag="input", value, onChange, placeholder, required, rows, type="text" }) {
  const [f, setF] = useState(false);
  return (
    <Tag
      type={type} value={value} onChange={onChange}
      placeholder={placeholder} required={required} rows={rows}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
      style={{
        width:"100%", padding:"11px 14px", boxSizing:"border-box",
        background: f ? "rgba(124,58,237,.08)" : "rgba(255,255,255,.04)",
        border:`1px solid ${f ? "rgba(124,58,237,.55)" : "rgba(255,255,255,.1)"}`,
        borderRadius:12, fontSize:13, color:"rgba(255,255,255,.9)",
        outline:"none", fontFamily:"inherit",
        boxShadow: f ? "0 0 0 3px rgba(124,58,237,.12)" : "none",
        transition:"all .2s",
        resize: Tag==="textarea" ? "none" : undefined,
      }}
    />
  );
}
function GlassSelect({ value, onChange, children }) {
  const [f, setF] = useState(false);
  return (
    <select value={value} onChange={onChange}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
      style={{
        width:"100%", padding:"11px 34px 11px 14px",
        background: f ? "rgba(124,58,237,.08)" : "rgba(255,255,255,.04)",
        border:`1px solid ${f ? "rgba(124,58,237,.55)" : "rgba(255,255,255,.1)"}`,
        borderRadius:12, fontSize:13, color:"rgba(255,255,255,.8)",
        outline:"none", fontFamily:"inherit", cursor:"pointer",
        boxShadow: f ? "0 0 0 3px rgba(124,58,237,.12)" : "none",
        transition:"all .2s", appearance:"none",
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,.3)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center",
      }}>
      {children}
    </select>
  );
}

// ── Circular holiday day badge (the star of the show) ──────────
function HolidayDayCircle({ day, holiday, isToday, onClick, size = 38 }) {
  const [hovered, setHovered] = useState(false);
  const cfg = holiday ? typeOf(holiday.type) : null;

  return (
    <motion.button
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={holiday ? { scale: 1.18 } : { scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      onClick={() => holiday && onClick(holiday)}
      style={{
        width: size, height: size, borderRadius: "50%",
        border: "none", cursor: holiday ? "pointer" : "default",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
        background: holiday
          ? hovered
            ? `radial-gradient(circle at 35% 30%, ${cfg.ring}, ${cfg.color})`
            : `radial-gradient(circle at 35% 30%, ${cfg.color}dd, ${cfg.color})`
          : isToday
          ? "rgba(124,58,237,.18)"
          : "transparent",
        boxShadow: holiday
          ? hovered
            ? `0 0 24px ${cfg.glow}, 0 0 48px ${cfg.glow}, 0 4px 14px rgba(0,0,0,.35)`
            : `0 0 12px ${cfg.glow}, 0 2px 8px rgba(0,0,0,.25)`
          : isToday
          ? "0 0 14px rgba(124,58,237,.35)"
          : "none",
        outline: isToday && !holiday ? "1.5px solid rgba(124,58,237,.6)" : "none",
        outlineOffset: -1.5,
        transition: "all .25s cubic-bezier(.22,1,.36,1)",
        fontFamily: "inherit",
        flexShrink: 0,
      }}
    >
      <span style={{
        fontSize: size > 34 ? 13 : 11.5, fontWeight: holiday ? 800 : isToday ? 800 : 500,
        color: holiday ? "#fff" : isToday ? "#c4b5fd" : "rgba(255,255,255,.55)",
        textShadow: holiday ? "0 1px 3px rgba(0,0,0,.4)" : "none",
        position: "relative", zIndex: 1,
      }}>
        {day}
      </span>

      {/* Pulse ring for today */}
      {isToday && (
        <motion.div
          animate={{ scale:[1,1.5,1], opacity:[0.5,0,0.5] }}
          transition={{ duration:2, repeat:Infinity, ease:"easeInOut" }}
          style={{
            position:"absolute", inset:-3, borderRadius:"50%",
            border:"1.5px solid rgba(124,58,237,.5)", pointerEvents:"none",
          }}
        />
      )}
    </motion.button>
  );
}

// ── Single month card ─────────────────────────────────────────
function MonthCard({ monthIdx, year, holidaysInMonth, onDayClick, todayKey, index }) {
  const firstDay = new Date(year, monthIdx, 1).getDay(); // 0=Sun
  const mondayOffset = (firstDay + 6) % 7; // convert to Mon-start
  const daysInMonth = new Date(year, monthIdx+1, 0).getDate();
  const cells = Array.from({ length: mondayOffset + daysInMonth }, (_, i) =>
    i < mondayOffset ? null : i - mondayOffset + 1
  );

  const holidayByDay = useMemo(() => {
    const map = {};
    holidaysInMonth.forEach(h => {
      const d = new Date(h.date).getDate();
      if (!map[d]) map[d] = h;
    });
    return map;
  }, [holidaysInMonth]);

  return (
    <motion.div
      initial={{ opacity:0, y:24 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true, margin:"-60px" }}
      transition={{ duration:.45, ease:[0.22,1,.36,1], delay: (index % 3) * 0.05 }}
      style={{
        background:"rgba(255,255,255,.03)",
        border:"1px solid rgba(255,255,255,.08)",
        borderRadius:22, padding:"18px 16px 16px",
        backdropFilter:"blur(10px)",
        position:"relative", overflow:"hidden",
      }}
    >
      {/* Top shimmer */}
      <motion.div
        animate={{ x:["-100%","220%"] }}
        transition={{ duration:3, repeat:Infinity, repeatDelay:5+index*0.3, ease:"easeInOut" }}
        style={{
          position:"absolute", top:0, left:0, right:0, height:1,
          background:"linear-gradient(90deg,transparent,rgba(255,255,255,.4),transparent)",
          pointerEvents:"none",
        }}
      />

      {/* Month header */}
      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:14 }}>
        <h3 style={{
          fontSize:18, fontWeight:800,
          background: MONTH_GRADIENTS[monthIdx],
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
        }}>
          {MONTHS[monthIdx]}
        </h3>
        {holidaysInMonth.length > 0 && (
          <span style={{ fontSize:10.5, color:"rgba(255,255,255,.3)", fontWeight:700 }}>
            {holidaysInMonth.length} holiday{holidaysInMonth.length!==1?"s":""}
          </span>
        )}
      </div>

      {/* Day labels */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:8 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign:"center", fontSize:9.5, fontWeight:800, color:"rgba(255,255,255,.22)", letterSpacing:".06em" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"4px 0", rowGap:6 }}>
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const dKey = `${year}-${monthIdx}-${day}`;
          const holiday = holidayByDay[day];
          return (
            <div key={i} style={{ display:"flex", justifyContent:"center" }}>
              <HolidayDayCircle
                day={day} holiday={holiday}
                isToday={dKey === todayKey}
                onClick={onDayClick}
              />
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── Holiday detail modal ────────────────────────────────────────
function HolidayModal({ holiday, onClose, isAdmin, onDelete }) {
  const cfg = typeOf(holiday.type);
  const HIcon = cfg.icon;
  const date = new Date(holiday.date);

  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"fixed", inset:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={onClose}
    >
      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.65)", backdropFilter:"blur(14px)" }} />

      <motion.div
        onClick={e => e.stopPropagation()}
        initial={{ opacity:0, scale:0.85, y:30 }}
        animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.85, y:30 }}
        transition={{ type:"spring", stiffness:300, damping:24 }}
        style={{
          position:"relative", width:"100%", maxWidth:380,
          background:"rgba(15,10,30,.97)",
          border:"1px solid rgba(255,255,255,.12)",
          borderRadius:26, overflow:"hidden",
          boxShadow:`0 0 100px ${cfg.glow}, 0 24px 60px rgba(0,0,0,.5)`,
        }}
      >
        {/* Glow header */}
        <div style={{
          padding:"28px 24px 22px",
          background:`linear-gradient(160deg, ${cfg.color}33, transparent)`,
          position:"relative", textAlign:"center",
        }}>
          <motion.div
            animate={{ x:["-100%","200%"] }}
            transition={{ duration:2.5, repeat:Infinity, repeatDelay:3 }}
            style={{
              position:"absolute", top:0, left:0, right:0, height:1,
              background:`linear-gradient(90deg,transparent,${cfg.color},transparent)`,
            }}
          />
          <motion.button
            whileHover={{ scale:1.1, rotate:90 }} whileTap={{ scale:.9 }}
            onClick={onClose}
            style={{
              position:"absolute", top:16, right:16,
              background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.12)",
              borderRadius:9, padding:"5px 7px", cursor:"pointer", color:"rgba(255,255,255,.6)",
            }}
          >
            <X size={14} />
          </motion.button>

          <motion.div
            initial={{ scale:0, rotate:-30 }} animate={{ scale:1, rotate:0 }}
            transition={{ type:"spring", stiffness:260, damping:18, delay:.1 }}
            style={{
              width:64, height:64, borderRadius:20, margin:"0 auto 14px",
              background:`radial-gradient(circle at 35% 30%, ${cfg.ring}, ${cfg.color})`,
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:`0 0 36px ${cfg.glow}`,
            }}
          >
            <HIcon size={26} style={{ color:"#fff" }} />
          </motion.div>

          <h2 style={{ fontSize:17, fontWeight:800, color:"rgba(255,255,255,.95)", marginBottom:4, lineHeight:1.3 }}>
            {holiday.title}
          </h2>
          {holiday.en && (
            <p style={{ fontSize:12.5, color:"rgba(255,255,255,.4)", fontWeight:500 }}>{holiday.en}</p>
          )}
        </div>

        {/* Details */}
        <div style={{ padding:"18px 22px 22px", display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:13, background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)" }}>
            <Clock size={14} style={{ color:cfg.color, flexShrink:0 }} />
            <span style={{ fontSize:12.5, color:"rgba(255,255,255,.7)", fontWeight:600 }}>
              {date.toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
            </span>
          </div>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:6, alignSelf:"flex-start",
            padding:"6px 14px", borderRadius:20,
            background:cfg.bg, border:`1px solid ${cfg.color}44`,
            boxShadow:`0 0 18px ${cfg.glow}`,
          }}>
            <HIcon size={11} style={{ color:cfg.color }} />
            <span style={{ fontSize:11, fontWeight:800, color:cfg.color, textTransform:"uppercase", letterSpacing:".08em" }}>
              {holiday.type} Holiday
            </span>
          </div>

          {isAdmin && (
            <motion.button
              whileHover={{ scale:1.02 }} whileTap={{ scale:.97 }}
              onClick={() => onDelete(holiday.id)}
              style={{
                marginTop:6, display:"flex", alignItems:"center", justifyContent:"center", gap:7,
                padding:"11px", borderRadius:12,
                background:"rgba(248,113,113,.1)", border:"1px solid rgba(248,113,113,.3)",
                color:"#f87171", fontSize:12.5, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
              }}
            >
              <Trash2 size={13} /> Remove Holiday
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Stat pill ─────────────────────────────────────────────────
function StatPill({ icon: Icon, value, label, color, glow, delay }) {
  return (
    <motion.div
      initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }}
      transition={{ delay, type:"spring", stiffness:220, damping:18 }}
      whileHover={{ scale:1.04, y:-2 }}
      style={{
        flex:1, minWidth:0, padding:"14px 12px", borderRadius:16, textAlign:"center",
        background:"rgba(255,255,255,.03)",
        border:`1px solid ${color}33`,
        boxShadow:`0 0 20px ${glow}`,
        cursor:"default",
      }}
    >
      <Icon size={15} style={{ color, marginBottom:6 }} />
      <div style={{ fontSize:22, fontWeight:900, color, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:9.5, color:"rgba(255,255,255,.32)", fontWeight:700, marginTop:4, textTransform:"uppercase", letterSpacing:".06em" }}>
        {label}
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function HolidaysPage() {
  const router = useRouter();
  const { isMobile } = useBreakpoint();
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const YEAR = 2026;

  const [userId, setUserId]         = useState(null);
  const [isAdmin, setIsAdmin]       = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);
  const [holidays, setHolidays]     = useState([]);
  const [loading, setLoading]       = useState(true);

  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [formTitle, setFormTitle]   = useState("");
  const [formDate, setFormDate]     = useState("");
  const [formType, setFormType]     = useState("Festival");
  const [posting, setPosting]       = useState(false);
  const [posted, setPosted]         = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const seedBEUHolidays = async (uid) => {
    try {
      const { data: existing, error: checkErr } = await supabase.from("holidays").select("date").limit(1);
      if (checkErr) return false;
      if (existing && existing.length > 0) return true;
      const { error: insertErr } = await supabase.from("holidays").insert(
        BEU_HOLIDAYS.map(h => ({ title:h.title, date:h.date, type:h.type, created_by: uid }))
      );
      return !insertErr;
    } catch { return false; }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const uid = session.user.id;
      setUserId(uid);

      let admin = false;
      try {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", uid).single();
        admin = profile?.role === "admin";
      } catch {}
      setIsAdmin(admin);
      setRoleLoading(false);

      if (admin) await seedBEUHolidays(uid);
      await fetchHolidays();
    };
    init();
  }, [router]);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("holidays").select("*").order("date", { ascending:true });
      if (error || !data || data.length === 0) {
        setHolidays(BEU_HOLIDAYS.map((h, i) => ({ ...h, id:`local-${i}` })));
      } else {
        const enrich = data.map(d => {
          const match = BEU_HOLIDAYS.find(b => b.date === d.date && b.title === d.title);
          return match ? { ...d, en: match.en } : d;
        });
        setHolidays(enrich);
      }
    } catch {
      setHolidays(BEU_HOLIDAYS.map((h, i) => ({ ...h, id:`local-${i}` })));
    }
    setLoading(false);
  };

  const handlePost = async () => {
    if (!isAdmin || !formTitle.trim() || !formDate) return;
    setPosting(true);
    const { data, error } = await supabase
      .from("holidays").insert({ title: formTitle, date: formDate, type: formType, created_by: userId })
      .select().single();
    if (!error && data) {
      setHolidays(prev => [...prev, data].sort((a,b) => new Date(a.date)-new Date(b.date)));
      setFormTitle(""); setFormDate(""); setFormType("Festival");
      setPosted(true); setShowForm(false);
      setTimeout(() => setPosted(false), 3500);
    }
    setPosting(false);
  };

  const handleDelete = async (id) => {
    if (typeof id === "string" && id.startsWith("local-")) {
      setHolidays(prev => prev.filter(h => h.id !== id));
      setSelectedHoliday(null);
      return;
    }
    await supabase.from("holidays").delete().eq("id", id);
    setHolidays(prev => prev.filter(h => h.id !== id));
    setSelectedHoliday(null);
  };

  const filteredHolidays = useMemo(() => {
    let list = holidays;
    if (activeFilter !== "All") list = list.filter(h => h.type === activeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(h => h.title.toLowerCase().includes(q) || (h.en||"").toLowerCase().includes(q));
    }
    return list;
  }, [holidays, activeFilter, searchQuery]);

  const upcomingHolidays = useMemo(() => {
    const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const upcoming = holidays.filter(h => new Date(h.date) >= todayMid).slice(0, 5);
    return upcoming.length > 0 ? upcoming : holidays.slice(0, 5);
  }, [holidays]);

  const stats = useMemo(() => ({
    total: holidays.length,
    national: holidays.filter(h => h.type === "National").length,
    festival: holidays.filter(h => h.type === "Festival").length,
  }), [holidays]);

  return (
    <AppShell>
      <AmbientOrbs />
      <FloatingParticles />

      <div style={{
        padding:`clamp(18px,5vw,32px) clamp(12px,4vw,24px)`,
        maxWidth:1200, margin:"0 auto", position:"relative", zIndex:1,
      }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}
          style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, gap:12, flexWrap:"wrap" }}
        >
          <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
            <motion.div
              whileHover={{ rotate:[0,-14,14,0], scale:1.12 }}
              transition={{ duration:.5 }}
              style={{
                width:"clamp(38px,8vw,46px)", height:"clamp(38px,8vw,46px)", borderRadius:15, flexShrink:0,
                background:"radial-gradient(circle at 35% 30%, #fdba74, #fb923c)",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 0 32px rgba(251,146,60,.4)",
              }}
            >
              <Palmtree size={isMobile ? 17 : 21} style={{ color:"#fff" }} />
            </motion.div>
            <div>
              <h1 style={{
                fontSize:"clamp(20px,5.5vw,28px)", fontWeight:900,
                background:"linear-gradient(135deg,#fff 0%,#fed7aa 40%,#fb923c 100%)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
                lineHeight:1.1,
              }}>
                Holiday Calendar
              </h1>
              <p style={{ fontSize:"clamp(10px,2.5vw,11.5px)", color:"rgba(255,255,255,.32)", fontWeight:600 }}>
                Bihar Engineering University · {YEAR}
              </p>
            </div>
            {!roleLoading && isAdmin && (
              <motion.div
                initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
                transition={{ delay:0.3, type:"spring" }}
                style={{
                  display:"flex", alignItems:"center", gap:5, padding:"4px 12px", borderRadius:20,
                  background:"rgba(251,191,36,.1)", border:"1px solid rgba(251,191,36,.35)",
                  boxShadow:"0 0 16px rgba(251,191,36,.2)",
                }}
              >
                <ShieldCheck size={11} style={{ color:"#fbbf24" }} />
                <span style={{ fontSize:10, fontWeight:800, color:"#fbbf24", letterSpacing:".1em", textTransform:"uppercase" }}>Admin</span>
              </motion.div>
            )}
          </div>

          {!roleLoading && isAdmin && (
            <motion.button
              initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }}
              whileHover={{ scale:1.05 }} whileTap={{ scale:.94 }}
              onClick={() => setShowForm(s => !s)}
              style={{
                display:"flex", alignItems:"center", gap:7,
                padding:isMobile ? "8px 14px" : "10px 20px", borderRadius:30,
                background: showForm ? "rgba(248,113,113,.12)" : "rgba(251,146,60,.15)",
                border:`1px solid ${showForm ? "rgba(248,113,113,.4)" : "rgba(251,146,60,.4)"}`,
                color: showForm ? "#f87171" : "#fb923c",
                fontSize:isMobile ? 11 : 12, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                boxShadow: showForm ? "0 0 20px rgba(248,113,113,.25)" : "0 0 24px rgba(251,146,60,.25)",
                transition:"all .25s", whiteSpace:"nowrap", flexShrink:0,
              }}
            >
              {showForm ? <><X size={11} /> Close</> : <><Plus size={11} /> Add Holiday</>}
            </motion.button>
          )}
        </motion.div>

        {/* ── Stat pills ───────────────────────────────────────── */}
        <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap: isMobile ? "wrap" : "nowrap" }}>
          <StatPill icon={CalendarDays} value={stats.total} label="Total" color="#a78bfa" glow="rgba(167,139,250,.25)" delay={0.05} />
          <StatPill icon={Flag} value={stats.national} label="National" color="#f87171" glow="rgba(248,113,113,.25)" delay={0.1} />
          <StatPill icon={Flower2} value={stats.festival} label="Festival" color="#fb923c" glow="rgba(251,146,60,.25)" delay={0.15} />
        </div>

        {/* ── Success toast ────────────────────────────────────── */}
        <AnimatePresence>
          {posted && (
            <motion.div
              initial={{ opacity:0, y:-10, scale:.96 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-10 }}
              style={{
                display:"flex", alignItems:"center", gap:10, marginBottom:16, padding:"11px 18px", borderRadius:14,
                background:"rgba(52,211,153,.1)", border:"1px solid rgba(52,211,153,.3)", color:"#6ee7b7",
                fontSize:13, fontWeight:600, boxShadow:"0 0 28px rgba(52,211,153,.18)",
              }}
            >
              <Sparkles size={14} /> Holiday added successfully!
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Add Holiday form ─────────────────────────────────── */}
        <AnimatePresence>
          {showForm && isAdmin && (
            <motion.div
              initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }}
              transition={{ duration:.35, ease:[0.22,1,.36,1] }}
              style={{ overflow:"hidden", marginBottom:20 }}
            >
              <div style={{
                background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.09)", borderRadius:22,
                padding:"clamp(16px,4vw,24px)", backdropFilter:"blur(14px)", boxShadow:"0 0 60px rgba(251,146,60,.1)",
                position:"relative", overflow:"hidden",
              }}>
                <motion.div
                  animate={{ x:["-100%","200%"] }} transition={{ duration:2.8, repeat:Infinity, repeatDelay:3 }}
                  style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(251,146,60,.6),transparent)", pointerEvents:"none" }}
                />
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18 }}>
                  <Plus size={14} style={{ color:"#fb923c" }} />
                  <span style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,.7)" }}>Add a new holiday</span>
                  <span style={{ marginLeft:"auto", fontSize:10, fontWeight:700, color:"rgba(251,191,36,.6)", textTransform:"uppercase", letterSpacing:".1em" }}>Admin only</span>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <GField value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Holiday name" required />
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    <GField type="date" value={formDate} onChange={e => setFormDate(e.target.value)} required />
                    <GlassSelect value={formType} onChange={e => setFormType(e.target.value)}>
                      {Object.keys(TYPE_CONFIG).map(t => <option key={t}>{t}</option>)}
                    </GlassSelect>
                  </div>
                  <motion.button
                    onClick={handlePost} disabled={posting}
                    whileHover={!posting ? { scale:1.02 } : {}} whileTap={!posting ? { scale:.97 } : {}}
                    style={{
                      padding:"12px", borderRadius:12, border:"none",
                      background: posting ? "rgba(255,255,255,.05)" : "linear-gradient(135deg,#f97316,#ea580c)",
                      color: posting ? "rgba(255,255,255,.3)" : "#fff",
                      fontSize:13, fontWeight:700, cursor: posting ? "not-allowed" : "pointer", fontFamily:"inherit",
                      boxShadow: posting ? "none" : "0 4px 24px rgba(249,115,22,.4)",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:7, transition:"all .3s",
                    }}
                  >
                    {posting
                      ? <><motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:"linear" }}
                          style={{ width:13, height:13, border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%" }} />Saving…</>
                      : <><Send size={13} /> Add Holiday</>}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Search + filters ────────────────────────────────── */}
        <motion.div
          initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}
          style={{ marginBottom:18 }}
        >
          <div style={{ position:"relative", marginBottom:12 }}>
            <Search size={14} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,.3)" }} />
            <input
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search holidays…"
              style={{
                width:"100%", padding:"11px 14px 11px 38px", boxSizing:"border-box",
                background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)",
                borderRadius:14, fontSize:13, color:"rgba(255,255,255,.9)", outline:"none", fontFamily:"inherit",
                transition:"all .2s",
              }}
              onFocus={e => { e.target.style.borderColor="rgba(251,146,60,.5)"; e.target.style.boxShadow="0 0 0 3px rgba(251,146,60,.12)"; }}
              onBlur={e => { e.target.style.borderColor="rgba(255,255,255,.1)"; e.target.style.boxShadow="none"; }}
            />
          </div>

          <div style={{ display:"flex", gap:6, overflowX:"auto", scrollbarWidth:"none", paddingBottom:2 }}>
            {["All", ...Object.keys(TYPE_CONFIG)].map(type => {
              const active = activeFilter === type;
              const cfg = type === "All" ? { color:"#a78bfa", glow:"rgba(167,139,250,.3)" } : typeOf(type);
              const TIcon = type === "All" ? Sparkles : typeOf(type).icon;
              return (
                <motion.button key={type}
                  whileHover={{ scale:1.06 }} whileTap={{ scale:.94 }}
                  onClick={() => setActiveFilter(type)}
                  style={{
                    display:"flex", alignItems:"center", gap:5, flexShrink:0,
                    padding:"6px 14px", borderRadius:20,
                    background: active ? `${cfg.color}18` : "rgba(255,255,255,.03)",
                    border:`1px solid ${active ? cfg.color+"55" : "rgba(255,255,255,.08)"}`,
                    color: active ? cfg.color : "rgba(255,255,255,.3)",
                    fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                    boxShadow: active ? `0 0 20px ${cfg.glow}` : "none",
                    transition:"all .22s", whiteSpace:"nowrap",
                  }}
                >
                  <TIcon size={10} /> {type}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Upcoming strip ───────────────────────────────────── */}
        {!loading && upcomingHolidays.length > 0 && (
          <motion.div
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.15 }}
            style={{ marginBottom:22 }}
          >
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
              <Star size={12} style={{ color:"#fb923c" }} />
              <span style={{ fontSize:11.5, fontWeight:800, color:"rgba(255,255,255,.5)", textTransform:"uppercase", letterSpacing:".06em" }}>
                Upcoming
              </span>
            </div>
            <div style={{ display:"flex", gap:10, overflowX:"auto", scrollbarWidth:"none", paddingBottom:4 }}>
              {upcomingHolidays.map((h, i) => {
                const cfg = typeOf(h.type);
                const HIcon = cfg.icon;
                const d = new Date(h.date);
                return (
                  <motion.button key={h.id || i}
                    initial={{ opacity:0, x:14 }} animate={{ opacity:1, x:0 }} transition={{ delay:.18+i*0.05 }}
                    whileHover={{ scale:1.05, y:-3 }} whileTap={{ scale:.97 }}
                    onClick={() => setSelectedHoliday(h)}
                    style={{
                      flexShrink:0, minWidth:140, padding:"12px 14px", borderRadius:16, textAlign:"left",
                      background:cfg.bg, border:`1px solid ${cfg.color}33`, cursor:"pointer", fontFamily:"inherit",
                      transition:"box-shadow .25s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 24px ${cfg.glow}`}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                  >
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                      <div style={{
                        width:22, height:22, borderRadius:7, flexShrink:0,
                        background:`${cfg.color}33`, display:"flex", alignItems:"center", justifyContent:"center",
                      }}>
                        <HIcon size={11} style={{ color:cfg.color }} />
                      </div>
                      <span style={{ fontSize:11, fontWeight:800, color:cfg.color }}>
                        {d.getDate()} {MONTHS[d.getMonth()].slice(0,3)}
                      </span>
                    </div>
                    <p style={{ fontSize:11.5, fontWeight:700, color:"rgba(255,255,255,.8)", lineHeight:1.3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {h.en || h.title}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── Full year vertical calendar ─────────────────────── */}
        <div style={{
          display:"grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(310px, 1fr))",
          gap:16,
        }}>
          {loading
            ? Array.from({ length:6 }).map((_, i) => (
                <motion.div key={i}
                  animate={{ opacity:[.2,.5,.2] }} transition={{ duration:1.5, repeat:Infinity, delay:i*.1 }}
                  style={{ height:280, borderRadius:22, background:"rgba(255,255,255,.04)" }}
                />
              ))
            : MONTHS.map((m, idx) => {
                const monthHolidays = filteredHolidays.filter(h => {
                  const d = new Date(h.date);
                  return d.getFullYear() === YEAR && d.getMonth() === idx;
                });
                if (activeFilter !== "All" && monthHolidays.length === 0 && searchQuery) return null;
                return (
                  <MonthCard
                    key={idx} monthIdx={idx} year={YEAR}
                    holidaysInMonth={monthHolidays}
                    onDayClick={setSelectedHoliday}
                    todayKey={todayKey}
                    index={idx}
                  />
                );
              })
          }
        </div>

        {/* ── Legend ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.4 }}
          style={{
            display:"flex", flexWrap:"wrap", gap:"10px 18px", justifyContent:"center",
            marginTop:28, padding:"16px", borderRadius:18,
            background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.06)",
          }}
        >
          {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
            <div key={type} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{
                width:14, height:14, borderRadius:"50%",
                background:`radial-gradient(circle at 35% 30%, ${cfg.ring}, ${cfg.color})`,
                boxShadow:`0 0 8px ${cfg.glow}`,
              }} />
              <span style={{ fontSize:11, color:"rgba(255,255,255,.4)", fontWeight:600 }}>{type}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Holiday modal ────────────────────────────────────── */}
      <AnimatePresence>
        {selectedHoliday && (
          <HolidayModal
            holiday={selectedHoliday}
            onClose={() => setSelectedHoliday(null)}
            isAdmin={isAdmin}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>

      <style>{`
        * { -webkit-tap-highlight-color: transparent; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }
        select option { background: #1a1033; color: rgba(255,255,255,.85); }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 4px; }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: .01ms !important; transition-duration: .01ms !important; }
        }
      `}</style>
    </AppShell>
  );
}