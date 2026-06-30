// src/app/profile/edit/page.js
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import {
  User, Camera, Building2, GraduationCap, BookOpen, Hash,
  Save, X, Check, ChevronDown, Search, Sparkles, Crown,
  Clock, Upload, Loader2, ShieldAlert, ArrowLeft, IdCard,
  AlertCircle,
} from "lucide-react";

// ── Universities of Bihar ───────────────────────────────────────
const UNIVERSITIES = [
  { id: "beu",   name: "Bihar Engineering University (BEU)", short: "BEU", active: true },
  { id: "aku",   name: "Aryabhatta Knowledge University",     short: "AKU",  active: false },
  { id: "ptu",   name: "Patliputra University",               short: "PPU",  active: false },
  { id: "mu",    name: "Magadh University",                   short: "MU",   active: false },
  { id: "bru",   name: "B.R. Ambedkar Bihar University",      short: "BRABU",active: false },
  { id: "tmbu",  name: "Tilka Manjhi Bhagalpur University",   short: "TMBU", active: false },
  { id: "lnmu",  name: "Lalit Narayan Mithila University",    short: "LNMU", active: false },
  { id: "vksu",  name: "Veer Kunwar Singh University",        short: "VKSU", active: false },
  { id: "pu",    name: "Patna University",                    short: "PU",   active: false },
  { id: "jpu",   name: "Jai Prakash University",               short: "JPU",  active: false },
  { id: "purnea",name: "Purnea University",                    short: "PRU",  active: false },
  { id: "munger",name: "Munger University",                    short: "MGU",  active: false },
  { id: "kssu",  name: "Kameshwar Singh Darbhanga Sanskrit University", short:"KSDSU", active:false },
  { id: "nitiv", name: "Nitishwar University",                 short: "NU",   active: false },
];

// ── 38 BEU Government Engineering Colleges ──────────────────────
const BEU_COLLEGES = [
  "Muzaffarpur Institute Of Technology, Muzaffarpur",
  "Bhagalpur College of Engineering, Bhagalpur",
  "Gaya Engineering College, Gaya",
  "Darbhanga Engineering College, Darbhanga",
  "Motihari Engineering College, Motihari",
  "Nalanda College Of Engineering, Chandi",
  "Loknayak Jaiprakash Institute of Technology, Chhapra",
  "Sitamarhi Institute of Technology, Sitamarhi",
  "Bhupendra Patel Mandal College of Engineering, Madhepura",
  "Rashtrakavi Ramdhari Singh Dinkar College of Engineering, Begusarai",
  "Shershah Engineering College, Sasaram",
  "Katihar Engineering College, Katihar",
  "Bakhtiyarpur Engineering College, Bakhtiyarpur",
  "Saharsa Engineering College, Saharsa",
  "Purnea Engineering College, Purnea",
  "Supaul Engineering College, Supaul",
  "Government Engineering College, Jamui",
  "Government Engineering College, Banka",
  "Government Engineering College, Vaishali",
  "Government Engineering College, Aurangabad",
  "Government Engineering College, Nawada",
  "Government Engineering College, Jahanabad",
  "Government Engineering College, Arwal",
  "Government Engineering College, Kaimur",
  "Government Engineering College, Bhojpur",
  "Government Engineering College, Buxar",
  "Government Engineering College, Munger",
  "Government Engineering College, Lakhisarai",
  "Government Engineering College, Khagaria",
  "Government Engineering College, Shekhpura",
  "Government Engineering College, Samastipur",
  "Government Engineering College, Madhubani",
  "Government Engineering College, Gopalganj",
  "Government Engineering College, Siwan",
  "Government Engineering College, Kishanganj",
  "Government Engineering College, Sheohar",
  "Government Engineering College, West Champaran",
  "Shri Phanishwar Nath Renu Engineering College, Araria",
];

// ── Branches under BEU ───────────────────────────────────────────
const BEU_BRANCHES = [
  "Computer Science & Engineering",
  "Computer Science & Engineering (AI & ML)",
  "Computer Science & Engineering (Data Science)",
  "Information Technology",
  "Electronics & Communication Engineering",
  "Electrical Engineering",
  "Electrical & Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biotechnology",
  "Mining Engineering",
  "Production & Industrial Engineering",
];

const SEMESTERS = ["1st","2nd","3rd","4th","5th","6th","7th","8th"];

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
        { top:"6%",  left:"4%",  size:340, color:"rgba(124,58,237,.08)", dur:14, delay:0 },
        { top:"55%", right:"4%", size:300, color:"rgba(96,165,250,.06)", dur:18, delay:3 },
        { top:"82%", left:"18%", size:220, color:"rgba(52,211,153,.05)", dur:16, delay:5 },
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

// ── Glass text field ───────────────────────────────────────────
function GField({ label, icon: Icon, value, onChange, placeholder, required, optional, type="text" }) {
  const [f, setF] = useState(false);
  return (
    <div>
      <label style={{
        display:"flex", alignItems:"center", gap:6, marginBottom:7,
        fontSize:11.5, fontWeight:700, color:"rgba(255,255,255,.45)",
        textTransform:"uppercase", letterSpacing:".06em",
      }}>
        {Icon && <Icon size={12} style={{ color: f ? "#a78bfa" : "rgba(255,255,255,.3)" }} />}
        {label}
        {optional && <span style={{ fontSize:9.5, fontWeight:600, color:"rgba(255,255,255,.25)", textTransform:"none", letterSpacing:0 }}>(optional)</span>}
      </label>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{
          width:"100%", padding:"13px 16px", boxSizing:"border-box",
          background: f ? "rgba(124,58,237,.08)" : "rgba(255,255,255,.04)",
          border:`1px solid ${f ? "rgba(124,58,237,.55)" : "rgba(255,255,255,.1)"}`,
          borderRadius:14, fontSize:14, color:"rgba(255,255,255,.92)",
          outline:"none", fontFamily:"inherit",
          boxShadow: f ? "0 0 0 3px rgba(124,58,237,.12)" : "none",
          transition:"all .2s",
        }}
      />
    </div>
  );
}

// ── Searchable dropdown (for colleges with 38 items) ───────────
function SearchSelect({ label, icon: Icon, value, onSelect, options, placeholder, disabled }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()));

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <label style={{
        display:"flex", alignItems:"center", gap:6, marginBottom:7,
        fontSize:11.5, fontWeight:700, color:"rgba(255,255,255,.45)",
        textTransform:"uppercase", letterSpacing:".06em",
      }}>
        {Icon && <Icon size={12} style={{ color: open ? "#a78bfa" : "rgba(255,255,255,.3)" }} />}
        {label}
      </label>

      <motion.button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        whileTap={!disabled ? { scale: 0.99 } : {}}
        style={{
          width:"100%", padding:"13px 16px", boxSizing:"border-box",
          background: open ? "rgba(124,58,237,.08)" : "rgba(255,255,255,.04)",
          border:`1px solid ${open ? "rgba(124,58,237,.55)" : "rgba(255,255,255,.1)"}`,
          borderRadius:14, fontSize:14, textAlign:"left",
          color: value ? "rgba(255,255,255,.92)" : "rgba(255,255,255,.3)",
          cursor: disabled ? "not-allowed" : "pointer", fontFamily:"inherit",
          boxShadow: open ? "0 0 0 3px rgba(124,58,237,.12)" : "none",
          transition:"all .2s",
          display:"flex", alignItems:"center", justifyContent:"space-between", gap:10,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {value || placeholder}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration:.2 }}>
          <ChevronDown size={15} style={{ color:"rgba(255,255,255,.3)", flexShrink:0 }} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity:0, y:-8, scale:0.98 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:-8, scale:0.98 }}
            transition={{ duration:.18, ease:[0.22,1,.36,1] }}
            style={{
              position:"absolute", top:"100%", left:0, right:0, marginTop:6, zIndex:50,
              background:"rgba(15,10,30,.98)", border:"1px solid rgba(124,58,237,.3)",
              borderRadius:16, overflow:"hidden",
              boxShadow:"0 20px 60px rgba(0,0,0,.5), 0 0 40px rgba(124,58,237,.15)",
              backdropFilter:"blur(20px)",
            }}
          >
            <div style={{ padding:10, borderBottom:"1px solid rgba(255,255,255,.07)" }}>
              <div style={{ position:"relative" }}>
                <Search size={13} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,.3)" }} />
                <input
                  autoFocus value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Search…"
                  style={{
                    width:"100%", padding:"9px 12px 9px 32px", boxSizing:"border-box",
                    background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)",
                    borderRadius:10, fontSize:13, color:"#fff", outline:"none", fontFamily:"inherit",
                  }}
                />
              </div>
            </div>
            <div style={{ maxHeight:260, overflowY:"auto" }}>
              {filtered.length === 0 ? (
                <div style={{ padding:"20px", textAlign:"center", fontSize:12.5, color:"rgba(255,255,255,.25)" }}>
                  No matches found
                </div>
              ) : filtered.map((opt, i) => (
                <motion.button
                  key={opt} type="button"
                  whileHover={{ background:"rgba(124,58,237,.1)" }}
                  onClick={() => { onSelect(opt); setOpen(false); setQuery(""); }}
                  style={{
                    width:"100%", padding:"11px 16px", textAlign:"left", border:"none",
                    background: value === opt ? "rgba(124,58,237,.12)" : "transparent",
                    color: value === opt ? "#c4b5fd" : "rgba(255,255,255,.75)",
                    fontSize:13, fontWeight: value === opt ? 700 : 500,
                    cursor:"pointer", fontFamily:"inherit",
                    display:"flex", alignItems:"center", justifyContent:"space-between", gap:8,
                    transition:"background .15s",
                  }}
                >
                  <span>{opt}</span>
                  {value === opt && <Check size={13} style={{ color:"#a78bfa", flexShrink:0 }} />}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Glass select (small fixed lists e.g. semester) ──────────────
function GlassSelect({ label, icon: Icon, value, onChange, options, disabled }) {
  const [f, setF] = useState(false);
  return (
    <div>
      <label style={{
        display:"flex", alignItems:"center", gap:6, marginBottom:7,
        fontSize:11.5, fontWeight:700, color:"rgba(255,255,255,.45)",
        textTransform:"uppercase", letterSpacing:".06em",
      }}>
        {Icon && <Icon size={12} style={{ color: f ? "#a78bfa" : "rgba(255,255,255,.3)" }} />}
        {label}
      </label>
      <select
        value={value} onChange={onChange} disabled={disabled}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{
          width:"100%", padding:"13px 36px 13px 16px", boxSizing:"border-box",
          background: f ? "rgba(124,58,237,.08)" : "rgba(255,255,255,.04)",
          border:`1px solid ${f ? "rgba(124,58,237,.55)" : "rgba(255,255,255,.1)"}`,
          borderRadius:14, fontSize:14, color: value ? "rgba(255,255,255,.92)" : "rgba(255,255,255,.3)",
          outline:"none", fontFamily:"inherit", cursor: disabled ? "not-allowed" : "pointer",
          boxShadow: f ? "0 0 0 3px rgba(124,58,237,.12)" : "none",
          transition:"all .2s", appearance:"none", opacity: disabled ? 0.5 : 1,
          backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,.3)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat:"no-repeat", backgroundPosition:"right 14px center",
        }}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ── Coming soon modal for non-BEU universities ──────────────────
function ComingSoonModal({ universityName, onClose }) {
  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={onClose}
    >
      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.7)", backdropFilter:"blur(16px)" }} />
      <motion.div
        onClick={e => e.stopPropagation()}
        initial={{ opacity:0, scale:0.85, y:30 }}
        animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.85, y:30 }}
        transition={{ type:"spring", stiffness:300, damping:24 }}
        style={{
          position:"relative", width:"100%", maxWidth:380,
          background:"rgba(15,10,30,.97)", border:"1px solid rgba(255,255,255,.12)",
          borderRadius:28, padding:"36px 28px 28px", textAlign:"center",
          boxShadow:"0 0 100px rgba(124,58,237,.25), 0 24px 60px rgba(0,0,0,.5)",
          overflow:"hidden",
        }}
      >
        <motion.div
          animate={{ x:["-100%","200%"] }}
          transition={{ duration:2.5, repeat:Infinity, repeatDelay:3 }}
          style={{
            position:"absolute", top:0, left:0, right:0, height:1,
            background:"linear-gradient(90deg,transparent,rgba(167,139,250,.6),transparent)",
          }}
        />

        <motion.div
          animate={{ rotate:[0,-8,8,-8,0], scale:[1,1.05,1] }}
          transition={{ duration:2.5, repeat:Infinity, repeatDelay:1.5 }}
          style={{
            width:72, height:72, borderRadius:22, margin:"0 auto 18px",
            background:"radial-gradient(circle at 35% 30%, #c4b5fd, #7c3aed)",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 0 40px rgba(124,58,237,.45)",
          }}
        >
          <Clock size={30} style={{ color:"#fff" }} />
        </motion.div>

        <h2 style={{ fontSize:19, fontWeight:900, color:"#fff", marginBottom:8 }}>
          Coming Soon
        </h2>
        <p style={{ fontSize:13.5, color:"rgba(255,255,255,.5)", lineHeight:1.6, marginBottom:6 }}>
          Profile setup for <strong style={{ color:"#c4b5fd" }}>{universityName}</strong> isn't available yet.
        </p>
        <p style={{ fontSize:12.5, color:"rgba(255,255,255,.32)", lineHeight:1.6, marginBottom:24 }}>
          We're currently fully live for Bihar Engineering University (BEU) and expanding to more universities soon. Stay tuned!
        </p>

        <motion.button
          whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }}
          onClick={onClose}
          style={{
            width:"100%", padding:"13px", borderRadius:14, border:"none",
            background:"linear-gradient(135deg,#7c3aed,#5b21b6)", color:"#fff",
            fontSize:13.5, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
            boxShadow:"0 4px 24px rgba(124,58,237,.4)",
          }}
        >
          Got it
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function EditProfilePage() {
  const router = useRouter();
  const { isMobile } = useBreakpoint();
  const fileInputRef = useRef(null);

  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingDp, setUploadingDp] = useState(false);

  const [fullName, setFullName] = useState("");
  const [university, setUniversity] = useState("beu");
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");
  const [regNo, setRegNo] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [showComingSoon, setShowComingSoon] = useState(false);
  const [pendingUniversity, setPendingUniversity] = useState(null);

  // NEW: surfaced save error shown inline (instead of a vague alert)
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const uid = session.user.id;
      setUserId(uid);

      try {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", uid).single();
        if (profile) {
          setFullName(profile.full_name || "");
          setUniversity(profile.university || "beu");
          setCollege(profile.college || "");
          setBranch(profile.branch || "");
          setSemester(profile.semester || "");
          setRegNo(profile.registration_no || "");
          setAvatarUrl(profile.avatar_url || "");
        }
      } catch (e) { console.warn("Profile load failed:", e); }
      setLoading(false);
    };
    init();
  }, [router]);

  const handleUniversitySelect = (uniId) => {
    const uni = UNIVERSITIES.find(u => u.id === uniId);
    if (!uni.active) {
      setPendingUniversity(uni);
      setShowComingSoon(true);
      return;
    }
    setUniversity(uniId);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB");
      return;
    }

    setUploadingDp(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${userId}/avatar-${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, cacheControl: "3600" });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(urlData.publicUrl);
    } catch (err) {
      console.error("Avatar upload failed:", err);
      alert("Upload failed. Make sure the 'avatars' storage bucket exists in Supabase and is public.");
    }
    setUploadingDp(false);
  };

  // FIXED: now surfaces the actual Supabase error instead of a blind alert,
  // and explicitly tells upsert to match on the "id" column.
  const handleSave = async () => {
    if (!userId || !fullName.trim()) return;
    setSaving(true);
    setSaveError("");
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            id: userId,
            full_name: fullName.trim(),
            university,
            college,
            branch,
            semester,
            registration_no: regNo.trim() || null,
            avatar_url: avatarUrl || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      if (error) {
        console.error("Supabase save error:", error);
        setSaveError(error.message || "Couldn't save your profile. Please try again.");
        setSaving(false);
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Save failed (exception):", err);
      setSaveError("Something went wrong. Please try again.");
    }
    setSaving(false);
  };

  const isBeu = university === "beu";
  const selectedUniName = UNIVERSITIES.find(u => u.id === university)?.name || "";
  const canSave = fullName.trim().length > 0;

  if (loading) {
    return (
      <AppShell>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"70vh" }}>
          <motion.div
            animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:"linear" }}
            style={{ width:40, height:40, border:"3px solid rgba(124,58,237,.2)", borderTopColor:"#a78bfa", borderRadius:"50%" }}
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <AmbientOrbs />

      <div style={{
        padding:`clamp(18px,5vw,32px) clamp(14px,4vw,24px)`,
        maxWidth:680, margin:"0 auto", position:"relative", zIndex:1,
      }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}
          style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}
        >
          <motion.button
            whileHover={{ scale:1.08, x:-2 }} whileTap={{ scale:.92 }}
            onClick={() => router.back()}
            style={{
              width:36, height:36, borderRadius:11, flexShrink:0,
              background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)",
              display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
            }}
          >
            <ArrowLeft size={16} style={{ color:"rgba(255,255,255,.6)" }} />
          </motion.button>
          <div>
            <h1 style={{
              fontSize:"clamp(20px,5vw,26px)", fontWeight:900,
              background:"linear-gradient(135deg,#fff 0%,#c4b5fd 45%,#818cf8 100%)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
              lineHeight:1.1,
            }}>
              Edit Profile
            </h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.1 }}
          style={{ display:"flex", alignItems:"center", gap:6, marginBottom:24, marginLeft:48 }}
        >
          <Crown size={11} style={{ color:"#fbbf24" }} />
          <span style={{ fontSize:11, fontWeight:700, color:"#fbbf24", letterSpacing:".04em" }}>
            Premium Profile Setup
          </span>
        </motion.div>

        {/* ── Success toast ─────────────────────────────────────── */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity:0, y:-10, scale:.96 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-10 }}
              style={{
                display:"flex", alignItems:"center", gap:10, marginBottom:18, padding:"12px 18px", borderRadius:14,
                background:"rgba(52,211,153,.1)", border:"1px solid rgba(52,211,153,.3)", color:"#6ee7b7",
                fontSize:13, fontWeight:600, boxShadow:"0 0 28px rgba(52,211,153,.18)",
              }}
            >
              <Check size={15} /> Profile updated successfully!
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── NEW: Error toast (shows the real reason a save failed) ─── */}
        <AnimatePresence>
          {saveError && (
            <motion.div
              initial={{ opacity:0, y:-10, scale:.96 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-10 }}
              style={{
                display:"flex", alignItems:"flex-start", gap:10, marginBottom:18, padding:"12px 18px", borderRadius:14,
                background:"rgba(248,113,113,.1)", border:"1px solid rgba(248,113,113,.3)", color:"#fca5a5",
                fontSize:13, fontWeight:600, boxShadow:"0 0 28px rgba(248,113,113,.15)",
              }}
            >
              <AlertCircle size={15} style={{ flexShrink:0, marginTop:1 }} />
              <span>{saveError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Avatar upload ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.12 }}
          style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:32 }}
        >
          <div style={{ position:"relative" }}>
            <motion.div
              whileHover={{ scale:1.04 }}
              style={{
                width:108, height:108, borderRadius:"50%", overflow:"hidden",
                /* FIXED: only ever set backgroundImage (never the "background" shorthand)
                   so React never sees a conflicting shorthand/non-shorthand pair across renders */
                backgroundImage: avatarUrl
                  ? `url(${avatarUrl})`
                  : "radial-gradient(circle at 35% 30%, #c4b5fd, #7c3aed)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 0 0 4px rgba(124,58,237,.15), 0 0 40px rgba(124,58,237,.3)",
                position:"relative",
              }}
            >
              {!avatarUrl && (
                <span style={{ fontSize:36, fontWeight:900, color:"#fff" }}>
                  {fullName ? fullName[0].toUpperCase() : <User size={36} />}
                </span>
              )}
              {uploadingDp && (
                <div style={{
                  position:"absolute", inset:0, background:"rgba(0,0,0,.55)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:"linear" }}>
                    <Loader2 size={26} style={{ color:"#fff" }} />
                  </motion.div>
                </div>
              )}
            </motion.div>

            <motion.button
              whileHover={{ scale:1.12 }} whileTap={{ scale:.92 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingDp}
              style={{
                position:"absolute", bottom:0, right:0,
                width:34, height:34, borderRadius:"50%",
                background:"linear-gradient(135deg,#7c3aed,#5b21b6)",
                border:"3px solid rgba(15,10,30,1)",
                display:"flex", alignItems:"center", justifyContent:"center",
                cursor: uploadingDp ? "not-allowed" : "pointer",
                boxShadow:"0 4px 16px rgba(124,58,237,.5)",
              }}
            >
              <Camera size={14} style={{ color:"#fff" }} />
            </motion.button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display:"none" }} />
          </div>
          <p style={{ fontSize:11.5, color:"rgba(255,255,255,.3)", marginTop:10, fontWeight:600 }}>
            Tap the camera to {avatarUrl ? "change" : "add"} your photo
          </p>
        </motion.div>

        {/* ── Form card ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.15 }}
          style={{
            background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.08)",
            borderRadius:24, padding:"clamp(18px,4vw,26px)", backdropFilter:"blur(12px)",
            boxShadow:"0 0 60px rgba(0,0,0,.25)",
            display:"flex", flexDirection:"column", gap:18,
          }}
        >
          <GField
            label="Full Name" icon={User} value={fullName}
            onChange={e => setFullName(e.target.value)} placeholder="Enter your full name" required
          />

          {/* University selector */}
          <div>
            <label style={{
              display:"flex", alignItems:"center", gap:6, marginBottom:7,
              fontSize:11.5, fontWeight:700, color:"rgba(255,255,255,.45)",
              textTransform:"uppercase", letterSpacing:".06em",
            }}>
              <Building2 size={12} style={{ color:"rgba(255,255,255,.3)" }} />
              University
            </label>
            <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:8 }}>
              {UNIVERSITIES.map(uni => {
                const selected = university === uni.id;
                return (
                  <motion.button
                    key={uni.id} type="button"
                    whileHover={{ scale:1.015 }} whileTap={{ scale:.98 }}
                    onClick={() => handleUniversitySelect(uni.id)}
                    style={{
                      display:"flex", alignItems:"center", justifyContent:"space-between", gap:8,
                      padding:"11px 14px", borderRadius:13, textAlign:"left",
                      background: selected ? "rgba(124,58,237,.14)" : "rgba(255,255,255,.025)",
                      border:`1px solid ${selected ? "rgba(124,58,237,.5)" : "rgba(255,255,255,.08)"}`,
                      boxShadow: selected ? "0 0 18px rgba(124,58,237,.2)" : "none",
                      cursor:"pointer", fontFamily:"inherit", transition:"all .2s",
                    }}
                  >
                    <span style={{
                      fontSize:12.5, fontWeight: selected ? 700 : 500,
                      color: selected ? "#c4b5fd" : "rgba(255,255,255,.55)",
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                    }}>
                      {uni.short}
                      {!uni.active && <span style={{ fontSize:9, color:"rgba(255,255,255,.25)", marginLeft:6 }}>· soon</span>}
                    </span>
                    {selected && <Check size={13} style={{ color:"#a78bfa", flexShrink:0 }} />}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isBeu ? (
              <motion.div
                key="beu-fields"
                initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }}
                transition={{ duration:.3, ease:[0.22,1,.36,1] }}
                style={{ display:"flex", flexDirection:"column", gap:18, overflow:"hidden" }}
              >
                <SearchSelect
                  label="College" icon={GraduationCap} value={college}
                  onSelect={setCollege} options={BEU_COLLEGES}
                  placeholder="Select your engineering college"
                />
                <SearchSelect
                  label="Branch" icon={BookOpen} value={branch}
                  onSelect={setBranch} options={BEU_BRANCHES}
                  placeholder="Select your branch"
                />
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  <GlassSelect label="Semester" icon={Sparkles} value={semester} onChange={e => setSemester(e.target.value)} options={SEMESTERS} />
                  <GField
                    label="Registration No" icon={IdCard} value={regNo}
                    onChange={e => setRegNo(e.target.value)} placeholder="e.g. 22105xxxxx" optional
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="not-beu"
                initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                style={{
                  display:"flex", alignItems:"center", gap:10, padding:"14px 16px",
                  borderRadius:14, background:"rgba(148,163,184,.06)", border:"1px solid rgba(148,163,184,.15)",
                }}
              >
                <ShieldAlert size={16} style={{ color:"rgba(148,163,184,.6)", flexShrink:0 }} />
                <p style={{ fontSize:12.5, color:"rgba(255,255,255,.4)", lineHeight:1.5 }}>
                  College, branch, and semester selection for <strong style={{ color:"rgba(255,255,255,.6)" }}>{selectedUniName}</strong> is coming soon.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save button */}
          <motion.button
            onClick={handleSave} disabled={!canSave || saving}
            whileHover={canSave && !saving ? { scale:1.015 } : {}}
            whileTap={canSave && !saving ? { scale:.98 } : {}}
            style={{
              marginTop:6, padding:"14px", borderRadius:15, border:"none",
              background: !canSave || saving ? "rgba(255,255,255,.05)" : "linear-gradient(135deg,#7c3aed,#5b21b6)",
              color: !canSave || saving ? "rgba(255,255,255,.3)" : "#fff",
              fontSize:14, fontWeight:700, cursor: !canSave || saving ? "not-allowed" : "pointer",
              fontFamily:"inherit",
              boxShadow: !canSave || saving ? "none" : "0 4px 28px rgba(124,58,237,.45)",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              transition:"all .3s",
            }}
          >
            {saving
              ? <><motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:"linear" }}
                  style={{ width:15, height:15, border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%" }} />Saving…</>
              : <><Save size={15} /> Save Profile</>}
          </motion.button>
        </motion.div>
      </div>

      {/* ── Coming soon modal ────────────────────────────────────── */}
      <AnimatePresence>
        {showComingSoon && (
          <ComingSoonModal
            universityName={pendingUniversity?.name || ""}
            onClose={() => setShowComingSoon(false)}
          />
        )}
      </AnimatePresence>

      <style>{`
        * { -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); border-radius: 4px; }
        select option { background: #1a1033; color: rgba(255,255,255,.85); }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: .01ms !important; transition-duration: .01ms !important; }
        }
      `}</style>
    </AppShell>
  );
}