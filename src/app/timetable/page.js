// src/app/timetable/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import {
  Plus, Trash2, Star, Bell, BookOpen, FlaskConical, X,
  Sun, Sunrise, Sunset, Moon, Dumbbell, Coffee, Brain, Clock,
  CalendarDays, ListChecks,
} from "lucide-react";

const DAYS = [
  { idx: 1, label: "Monday" },
  { idx: 2, label: "Tuesday" },
  { idx: 3, label: "Wednesday" },
  { idx: 4, label: "Thursday" },
  { idx: 5, label: "Friday" },
  { idx: 6, label: "Saturday" },
  { idx: 0, label: "Sunday" },
];

const ROUTINE_ICONS = {
  sun: Sun, sunrise: Sunrise, sunset: Sunset, moon: Moon,
  dumbbell: Dumbbell, coffee: Coffee, brain: Brain, book: BookOpen, clock: Clock,
};
const ICON_KEYS = Object.keys(ROUTINE_ICONS);

const glass = {
  background: "rgba(255,255,255,.04)",
  border: "1px solid rgba(255,255,255,.08)",
  borderRadius: 18,
  backdropFilter: "blur(12px)",
};

function todayIdx() {
  return new Date().getDay();
}

/* ── Tab switcher ── */
function TabSwitcher({ active, onChange }) {
  const tabs = [
    { key: "timetable", label: "Time Table", icon: CalendarDays },
    { key: "routine", label: "My Routine", icon: ListChecks },
  ];
  return (
    <div style={{
      display: "inline-flex", gap: 4, padding: 4, borderRadius: 14,
      background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
      marginBottom: 26,
    }}>
      {tabs.map(t => {
        const Icon = t.icon;
        const isActive = active === t.key;
        return (
          <motion.button
            key={t.key}
            onClick={() => onChange(t.key)}
            whileTap={{ scale: 0.97 }}
            style={{
              position: "relative", display: "flex", alignItems: "center", gap: 7,
              padding: "9px 18px", borderRadius: 11, border: "none",
              background: "transparent", cursor: "pointer", fontFamily: "inherit",
              fontSize: 13, fontWeight: 700, color: isActive ? "#fff" : "rgba(255,255,255,.4)",
              transition: "color .2s", zIndex: 1,
            }}
          >
            {isActive && (
              <motion.div
                layoutId="tabPill"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                style={{
                  position: "absolute", inset: 0, borderRadius: 11,
                  background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
                  boxShadow: "0 4px 18px rgba(124,58,237,.45)",
                  zIndex: -1,
                }}
              />
            )}
            <Icon size={15} />
            {t.label}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ════════════════ TIME TABLE TAB ════════════════ */

function ClassCard({ cls, onDelete }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8, height: 0 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        background: cls.is_break ? "rgba(251,191,36,.06)" : "rgba(124,58,237,.07)",
        border: `1px solid ${cls.is_break ? "rgba(251,191,36,.2)" : "rgba(124,58,237,.2)"}`,
        borderLeft: `3px solid ${cls.is_break ? "#fbbf24" : "#a78bfa"}`,
        borderRadius: 12, padding: "12px 14px", marginBottom: 8,
        transition: "box-shadow .2s",
        boxShadow: hov ? `0 0 20px ${cls.is_break ? "rgba(251,191,36,.15)" : "rgba(124,58,237,.18)"}` : "none",
      }}
    >
      <div style={{ minWidth: 64 }}>
        <p style={{ fontSize: 12.5, fontWeight: 700, color: "#fff" }}>{cls.start_time}</p>
        <p style={{ fontSize: 10.5, color: "rgba(255,255,255,.35)" }}>{cls.end_time}</p>
      </div>
      <div style={{ width: 1, height: 28, background: "rgba(255,255,255,.1)" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {cls.subject_type === "practical" ? (
            <FlaskConical size={13} style={{ color: "#67e8f9", flexShrink: 0 }} />
          ) : (
            <BookOpen size={13} style={{ color: "#a78bfa", flexShrink: 0 }} />
          )}
          <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{cls.subject_name}</p>
          {cls.is_important && <Star size={12} style={{ color: "#fbbf24", fill: "#fbbf24", flexShrink: 0 }} />}
        </div>
        {cls.room_or_teacher && (
          <p style={{ fontSize: 11.5, color: "rgba(255,255,255,.35)", marginTop: 2 }}>{cls.room_or_teacher}</p>
        )}
      </div>
      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: hov ? 1 : 0 }}
        onClick={() => onDelete(cls.id)}
        whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#f87171", padding: 4, flexShrink: 0 }}
      >
        <Trash2 size={14} />
      </motion.button>
    </motion.div>
  );
}

function AddClassModal({ day, onClose, onSave }) {
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [isBreak, setIsBreak] = useState(false);
  const [subject, setSubject] = useState("");
  const [room, setRoom] = useState("");
  const [type, setType] = useState("lecture");
  const [important, setImportant] = useState(false);
  const [saving, setSaving] = useState(false);

  const fmt = (t) => {
    const [h, m] = t.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, "0")} ${period}`;
  };

  const save = async () => {
    if (!subject.trim() && !isBreak) return;
    setSaving(true);
    await onSave({
      start_time: fmt(startTime),
      end_time: fmt(endTime),
      subject_name: isBreak ? "Break / Lunch" : subject.trim(),
      room_or_teacher: room.trim() || null,
      subject_type: type,
      is_important: important,
      is_break: isBreak,
    });
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,.6)",
        backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          ...glass, width: "100%", maxWidth: 420, padding: 26,
          boxShadow: "0 20px 60px rgba(0,0,0,.5), 0 0 40px rgba(124,58,237,.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <p style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Add Class · {day.label}</p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.4)" }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: ".05em" }}>Start Time</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: ".05em" }}>End Time</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, cursor: "pointer" }}>
          <input type="checkbox" checked={isBreak} onChange={(e) => setIsBreak(e.target.checked)}
            style={{ width: 15, height: 15, accentColor: "#fbbf24", cursor: "pointer" }} />
          <span style={{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>This is a Break / Lunch Time</span>
        </label>

        {!isBreak && (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: ".05em" }}>Subject / Lab Name</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Data Structures / DBMS Lab" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: ".05em" }}>Room / Teacher (optional)</label>
              <input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g. Room 308 / Sharma Sir" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 8 }}>Subject Type</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["lecture", "practical"].map(t => (
                  <button
                    key={t} onClick={() => setType(t)}
                    style={{
                      flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 12.5, fontWeight: 700,
                      cursor: "pointer", fontFamily: "inherit",
                      background: type === t ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "rgba(255,255,255,.05)",
                      border: type === t ? "none" : "1px solid rgba(255,255,255,.1)",
                      color: type === t ? "#fff" : "rgba(255,255,255,.5)",
                      boxShadow: type === t ? "0 4px 14px rgba(124,58,237,.4)" : "none",
                      transition: "all .2s",
                    }}
                  >
                    {t === "lecture" ? "Class Lecture" : "Practical / Lab"}
                  </button>
                ))}
              </div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, cursor: "pointer" }}>
              <input type="checkbox" checked={important} onChange={(e) => setImportant(e.target.checked)}
                style={{ width: 15, height: 15, accentColor: "#fbbf24", cursor: "pointer" }} />
              <span style={{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>Mark as Important</span>
            </label>
          </>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: isBreak ? 8 : 0 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "11px 0", borderRadius: 11, fontSize: 13, fontWeight: 700,
            background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
            color: "rgba(255,255,255,.6)", cursor: "pointer", fontFamily: "inherit",
          }}>
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={save} disabled={saving}
            style={{
              flex: 1, padding: "11px 0", borderRadius: 11, fontSize: 13, fontWeight: 700,
              background: "linear-gradient(135deg,#7c3aed,#5b21b6)", border: "none",
              color: "#fff", cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 4px 18px rgba(124,58,237,.45)", opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "Saving..." : "Save"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DayCard({ day, classes, index, onAdd, onDelete }) {
  const isToday = day.idx === todayIdx();
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{
        ...glass, padding: "16px 18px", marginBottom: 12,
        border: isToday ? "1px solid rgba(124,58,237,.5)" : "1px solid rgba(255,255,255,.08)",
        boxShadow: isToday ? "0 0 30px rgba(124,58,237,.15)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{
          fontSize: 14, fontWeight: 800, letterSpacing: ".02em",
          color: isToday ? "#c4b5fd" : "#fff",
          textTransform: "uppercase",
        }}>
          {day.label}
        </p>
        {isToday ? (
          <span style={{
            fontSize: 10.5, fontWeight: 800, color: "#fff", background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
            borderRadius: 20, padding: "3px 10px", boxShadow: "0 0 12px rgba(124,58,237,.5)",
          }}>
            TODAY
          </span>
        ) : (
          <span style={{
            fontSize: 11, color: "rgba(255,255,255,.3)", background: "rgba(255,255,255,.05)",
            borderRadius: 20, padding: "3px 10px",
          }}>
            {classes.length === 0 ? "No Classes" : `${classes.length} class${classes.length > 1 ? "es" : ""}`}
          </span>
        )}
      </div>

      <AnimatePresence>
        {classes.length === 0 ? (
          isToday && (
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,.25)", textAlign: "center", padding: "10px 0" }}>
              No classes added
            </p>
          )
        ) : (
          classes.map(c => <ClassCard key={c.id} cls={c} onDelete={onDelete} />)
        )}
      </AnimatePresence>

      {isToday && (
        <motion.button
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          onClick={onAdd}
          style={{
            width: "100%", padding: "10px 0", borderRadius: 10, marginTop: classes.length === 0 ? 4 : 6,
            background: "rgba(124,58,237,.1)", border: "1px dashed rgba(124,58,237,.4)",
            color: "#c4b5fd", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            transition: "all .2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(124,58,237,.18)"; e.currentTarget.style.boxShadow = "0 0 16px rgba(124,58,237,.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(124,58,237,.1)"; e.currentTarget.style.boxShadow = "none"; }}
        >
          + Add Class
        </motion.button>
      )}
      {!isToday && (
        <button
          onClick={onAdd}
          style={{
            width: "100%", padding: "8px 0", borderRadius: 10, marginTop: classes.length > 0 ? 6 : 0,
            background: "transparent", border: "1px dashed rgba(255,255,255,.12)",
            color: "rgba(255,255,255,.3)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            transition: "all .2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(124,58,237,.4)"; e.currentTarget.style.color = "#c4b5fd"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,.12)"; e.currentTarget.style.color = "rgba(255,255,255,.3)"; }}
        >
          + Add Class
        </button>
      )}
    </motion.div>
  );
}

function TimeTableTab({ userId }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalDay, setModalDay] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("timetable_classes")
        .select("*")
        .eq("user_id", userId)
        .order("start_time", { ascending: true });
      setClasses(data || []);
      setLoading(false);
    };
    load();
  }, [userId]);

  const classesForDay = (idx) => classes.filter(c => c.day_of_week === idx);

  const handleSave = async (fields) => {
    if (!modalDay) return;
    const { data, error } = await supabase
      .from("timetable_classes")
      .insert({ ...fields, day_of_week: modalDay.idx, user_id: userId })
      .select().single();
    if (!error && data) {
      setClasses(prev => [...prev, data]);
    }
    setModalDay(null);
  };

  const handleDelete = async (id) => {
    setClasses(prev => prev.filter(c => c.id !== id));
    await supabase.from("timetable_classes").delete().eq("id", id);
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: 18,
        padding: "10px 14px", borderRadius: 12,
        background: "rgba(251,191,36,.07)", border: "1px solid rgba(251,191,36,.2)",
      }}>
        <Bell size={14} style={{ color: "#fbbf24", flexShrink: 0 }} />
        <p style={{ fontSize: 12, color: "rgba(251,191,36,.85)" }}>
          Keep your weekly schedule updated — today's classes are highlighted automatically.
        </p>
      </div>

      {DAYS.map((day, i) => (
        <DayCard
          key={day.idx}
          day={day}
          index={i}
          classes={classesForDay(day.idx)}
          onAdd={() => setModalDay(day)}
          onDelete={handleDelete}
        />
      ))}

      <AnimatePresence>
        {modalDay && (
          <AddClassModal day={modalDay} onClose={() => setModalDay(null)} onSave={handleSave} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ════════════════ MY ROUTINE TAB ════════════════ */

function AddRoutineModal({ onClose, onSave }) {
  const [time, setTime] = useState("06:00");
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("sun");
  const [saving, setSaving] = useState(false);

  const fmt = (t) => {
    const [h, m] = t.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, "0")} ${period}`;
  };

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onSave({ time: fmt(time), title: title.trim(), icon_key: icon });
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,.6)",
        backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{ ...glass, width: "100%", maxWidth: 400, padding: 26, boxShadow: "0 20px 60px rgba(0,0,0,.5)" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <p style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Add Routine Item</p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.4)" }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: ".05em" }}>Time</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: ".05em" }}>Activity</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Morning Study Session" style={inputStyle} />
        </div>

        <div style={{ marginBottom: 22 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 8 }}>Icon</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {ICON_KEYS.map(key => {
              const Icon = ROUTINE_ICONS[key];
              const active = icon === key;
              return (
                <button
                  key={key} onClick={() => setIcon(key)}
                  style={{
                    width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", border: active ? "1px solid rgba(124,58,237,.6)" : "1px solid rgba(255,255,255,.1)",
                    background: active ? "rgba(124,58,237,.2)" : "rgba(255,255,255,.04)",
                    boxShadow: active ? "0 0 14px rgba(124,58,237,.3)" : "none",
                    transition: "all .15s",
                  }}
                >
                  <Icon size={16} style={{ color: active ? "#c4b5fd" : "rgba(255,255,255,.4)" }} />
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "11px 0", borderRadius: 11, fontSize: 13, fontWeight: 700,
            background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
            color: "rgba(255,255,255,.6)", cursor: "pointer", fontFamily: "inherit",
          }}>
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={save} disabled={saving}
            style={{
              flex: 1, padding: "11px 0", borderRadius: 11, fontSize: 13, fontWeight: 700,
              background: "linear-gradient(135deg,#7c3aed,#5b21b6)", border: "none",
              color: "#fff", cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 4px 18px rgba(124,58,237,.45)", opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "Saving..." : "Save"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function RoutineRow({ item, onToggle, onDelete }) {
  const [hov, setHov] = useState(false);
  const Icon = ROUTINE_ICONS[item.icon_key] || Sun;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8, height: 0 }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 14, padding: "12px 14px",
        borderRadius: 13, marginBottom: 8,
        background: item.is_done ? "rgba(134,239,172,.06)" : "rgba(255,255,255,.04)",
        border: `1px solid ${item.is_done ? "rgba(134,239,172,.2)" : "rgba(255,255,255,.08)"}`,
        transition: "all .2s",
        boxShadow: hov ? "0 0 18px rgba(124,58,237,.1)" : "none",
      }}
    >
      <button
        onClick={() => onToggle(item)}
        style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: item.is_done ? "rgba(134,239,172,.15)" : "rgba(124,58,237,.12)",
          border: `1px solid ${item.is_done ? "rgba(134,239,172,.35)" : "rgba(124,58,237,.3)"}`,
          transition: "all .2s",
        }}
      >
        <Icon size={16} style={{ color: item.is_done ? "#86efac" : "#c4b5fd" }} />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 13.5, fontWeight: 700,
          color: item.is_done ? "rgba(255,255,255,.4)" : "#fff",
          textDecoration: item.is_done ? "line-through" : "none",
          transition: "all .2s",
        }}>
          {item.title}
        </p>
        <p style={{ fontSize: 11.5, color: "rgba(255,255,255,.35)", marginTop: 2 }}>{item.time}</p>
      </div>
      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: hov ? 1 : 0 }}
        onClick={() => onDelete(item.id)}
        whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#f87171", padding: 4, flexShrink: 0 }}
      >
        <Trash2 size={14} />
      </motion.button>
    </motion.div>
  );
}

function RoutineTab({ userId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.from("routine_items").select("*").eq("user_id", userId);
      const sorted = (data || []).sort((a, b) => to24(a.time) - to24(b.time));
      setItems(sorted);
      setLoading(false);
    };
    load();
  }, [userId]);

  function to24(t) {
    const [time, period] = t.split(" ");
    let [h, m] = time.split(":").map(Number);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return h * 60 + m;
  }

  const handleSave = async (fields) => {
    const { data, error } = await supabase
      .from("routine_items").insert({ ...fields, user_id: userId }).select().single();
    if (!error && data) {
      setItems(prev => [...prev, data].sort((a, b) => to24(a.time) - to24(b.time)));
      setShowModal(false);
    }
  };

  const handleToggle = async (item) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_done: !i.is_done } : i));
    await supabase.from("routine_items").update({ is_done: !item.is_done }).eq("id", item.id);
  };

  const handleDelete = async (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    await supabase.from("routine_items").delete().eq("id", id);
  };

  if (loading) return <Loader />;

  const done = items.filter(i => i.is_done).length;
  const pct = items.length === 0 ? 0 : Math.round((done / items.length) * 100);

  return (
    <div>
      {items.length > 0 && (
        <div style={{ ...glass, padding: "16px 18px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.8)" }}>Today's Routine Progress</p>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#86efac" }}>{done}/{items.length} done</span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,.06)", borderRadius: 4, overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{
                height: "100%", borderRadius: 4,
                background: "linear-gradient(90deg,#86efac,#34d399)",
                boxShadow: "0 0 10px rgba(134,239,172,.5)",
              }}
            />
          </div>
        </div>
      )}

      <AnimatePresence>
        {items.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "44px 0", color: "rgba(255,255,255,.25)", fontSize: 13.5,
            border: "1px dashed rgba(255,255,255,.1)", borderRadius: 16, marginBottom: 16,
          }}>
            No routine items yet — build your daily flow below
          </div>
        ) : (
          items.map(item => (
            <RoutineRow key={item.id} item={item} onToggle={handleToggle} onDelete={handleDelete} />
          ))
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
        onClick={() => setShowModal(true)}
        style={{
          width: "100%", padding: "12px 0", borderRadius: 12, marginTop: 6,
          background: "rgba(124,58,237,.1)", border: "1px dashed rgba(124,58,237,.4)",
          color: "#c4b5fd", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          transition: "all .2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(124,58,237,.18)"; e.currentTarget.style.boxShadow = "0 0 18px rgba(124,58,237,.2)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(124,58,237,.1)"; e.currentTarget.style.boxShadow = "none"; }}
      >
        <Plus size={15} /> Add Routine Item
      </motion.button>

      <AnimatePresence>
        {showModal && <AddRoutineModal onClose={() => setShowModal(false)} onSave={handleSave} />}
      </AnimatePresence>
    </div>
  );
}

/* ════════════════ SHARED ════════════════ */

const inputStyle = {
  width: "100%", marginTop: 6, padding: "10px 13px",
  background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
  borderRadius: 10, fontSize: 13.5, color: "#fff", outline: "none", fontFamily: "inherit",
  colorScheme: "dark",
};

function Loader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        border: "2.5px solid rgba(124,58,237,.25)", borderTopColor: "#a78bfa",
        animation: "spin .8s linear infinite",
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ════════════════ PAGE ════════════════ */

export default function TimetablePage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [tab, setTab] = useState("timetable");

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setUserId(session.user.id);
    };
    check();
  }, [router]);

  return (
    <AppShell>
      <div style={{ padding: "32px 28px 60px", maxWidth: 720, margin: "0 auto" }}>
        <motion.h1
          initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: 26, fontWeight: 800, marginBottom: 18,
            background: "linear-gradient(135deg,#fff 0%,#c4b5fd 50%,#818cf8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}
        >
          Time Table & Routine
        </motion.h1>

        <TabSwitcher active={tab} onChange={setTab} />

        {!userId ? (
          <Loader />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {tab === "timetable" ? <TimeTableTab userId={userId} /> : <RoutineTab userId={userId} />}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </AppShell>
  );
}