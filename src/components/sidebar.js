// src/components/Sidebar.js
// CREATE this file at: src/components/Sidebar.js
// (create the components folder inside src/ if it doesn't exist)

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard, CheckSquare, Calculator, Timer,
  PlayCircle, MessageCircle, Trophy, FileText,
  BookOpen, Bell, ClipboardList, Award, Building2, LogOut,
  GraduationCap, X, User, Pencil,
  CalendarDays,
  CalendarClock,
} from "lucide-react";

const NAV = [
  {
    section: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    section: "Study Tools",
    items: [
      { label: "Attendance", href: "/attendance", icon: CheckSquare },
      { label: "SGPA Calc",  href: "/sgpa",       icon: Calculator  },
      { label: "Pomodoro",   href: "/pomodoro",    icon: Timer       },
      { label: "Timetable",   href: "/timetable",    icon: CalendarClock       },
    ],
  },
  {
    section: "Learn",
    items: [
      { label: "Coursify",   href: "/coursify",    icon: PlayCircle    },
      { label: "Doubt Chat", href: "/doubt-chat",  icon: MessageCircle },
      { label: "Exam Hub",   href: "/exam-hub",    icon: Trophy        },
    ],
  },
  {
    section: "Resources",
    items: [
      { label: "Notes",   href: "/notes",   icon: FileText },
      { label: "E-Books", href: "/ebooks",  icon: BookOpen },
      { label: "Notices", href: "/notices", icon: Bell     },
      { label: "Syllabus", href: "/syllabus", icon: FileText },
      { label: "Pyq", href: "/pyq", icon: ClipboardList },
      { label: "Holidays", href: "/holidays", icon: CalendarDays },

    ],
  },
  {
    section: "University",
    items: [
      { label: "Results",      href: "/results",             icon: Award    },
      { label: "Universities", href: "/bihar-universities",  icon: Building2 },
    ],
  },
  /* ── NEW: Account section, houses Edit Profile ── */
  {
    section: "Account",
    items: [
      { label: "Edit Profile", href: "/profile/edit", icon: User },
    ],
  },
];

export default function Sidebar({ onClose }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [profile, setProfile]   = useState(null);
  const [hovered, setHovered]   = useState(null);
  const [cardHov, setCardHov]   = useState(false); // NEW: hover state for the profile card

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      // FIXED: select avatar_url (matches the profiles table schema) instead of photo_url,
      // and pull email from the auth session instead of a non-existent profiles.email column
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", session.user.id)
        .single();
      setProfile({
        full_name: data?.full_name || "",
        avatar_url: data?.avatar_url || "",
        email: session.user.email || "",
      });
    };
    loadProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isActive = (href) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const navItemStyle = (href) => {
    const active  = isActive(href);
    const hov     = hovered === href;
    return {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 10px",
      borderRadius: 10,
      fontSize: 13.5,
      fontWeight: 500,
      color: active ? "#c4b5fd" : hov ? "rgba(255,255,255,.88)" : "rgba(255,255,255,.38)",
      background: active
        ? "rgba(124,58,237,.18)"
        : hov
        ? "rgba(255,255,255,.055)"
        : "transparent",
      borderLeft: active ? "2px solid #7c3aed" : "2px solid transparent",
      boxShadow: active ? "inset 0 0 24px rgba(124,58,237,.06)" : "none",
      textDecoration: "none",
      cursor: "pointer",
      transition: "all 0.18s cubic-bezier(.34,1.2,.64,1)",
      transform: hov && !active ? "translateX(2px)" : "none",
      marginBottom: 1,
    };
  };

  const onEditProfilePage = isActive("/profile/edit");

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg,#04040b 0%,#060610 100%)",
        borderRight: "1px solid rgba(124,58,237,.15)",
      }}
    >
      {/* ── Logo ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "15px 14px",
          borderBottom: "1px solid rgba(255,255,255,.05)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32, height: 32,
              borderRadius: 10,
              background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
              boxShadow: "0 0 22px rgba(124,58,237,.55)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <GraduationCap size={16} color="white" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: ".02em" }}>
              Notiq
            </p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,.22)", letterSpacing: ".04em" }}>
              One App. All Updates.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,.3)", padding: 4, borderRadius: 6,
              transition: "color .15s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,.8)"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.3)"}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px 10px",
          scrollbarWidth: "none",
        }}
      >
        {NAV.map((group) => (
          <div key={group.section} style={{ marginBottom: 14 }}>
            <p
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.18)",
                padding: "0 8px",
                marginBottom: 4,
              }}
            >
              {group.section}
            </p>

            {group.items.map((item) => {
              const active = isActive(item.href);
              const Icon   = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  style={navItemStyle(item.href)}
                  onMouseEnter={() => setHovered(item.href)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <Icon size={15} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {active && (
                    <div
                      style={{
                        width: 5, height: 5,
                        borderRadius: "50%",
                        background: "#a78bfa",
                        boxShadow: "0 0 7px rgba(167,139,250,.9)",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── User Profile + Logout ── */}
      <div
        style={{
          padding: "10px 10px",
          borderTop: "1px solid rgba(255,255,255,.05)",
          flexShrink: 0,
        }}
      >
        {profile && (
          /* NEW: card is now a clickable Link to /profile/edit, with hover glow + Edit pencil */
          <Link
            href="/profile/edit"
            onClick={onClose}
            onMouseEnter={() => setCardHov(true)}
            onMouseLeave={() => setCardHov(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 10px",
              borderRadius: 11,
              background: onEditProfilePage
                ? "rgba(124,58,237,.22)"
                : cardHov
                ? "rgba(124,58,237,.18)"
                : "rgba(124,58,237,.1)",
              border: `1px solid ${
                onEditProfilePage
                  ? "rgba(124,58,237,.5)"
                  : cardHov
                  ? "rgba(124,58,237,.4)"
                  : "rgba(124,58,237,.2)"
              }`,
              boxShadow: cardHov || onEditProfilePage
                ? "0 0 18px rgba(124,58,237,.25)"
                : "none",
              marginBottom: 6,
              transition: "all .22s cubic-bezier(.34,1.2,.64,1)",
              cursor: "pointer",
              textDecoration: "none",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 34, height: 34,
                borderRadius: 10,
                /* FIXED: only ever set backgroundImage, never the "background" shorthand,
                   so this never collides with the gradient fallback across renders */
                backgroundImage: profile.avatar_url
                  ? `url(${profile.avatar_url})`
                  : "linear-gradient(135deg,#7c3aed,#5b21b6)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                boxShadow: cardHov
                  ? "0 0 18px rgba(124,58,237,.6)"
                  : "0 0 12px rgba(124,58,237,.45)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                transition: "box-shadow .22s",
              }}
            >
              {!profile.avatar_url && (
                <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>
                  {profile.full_name?.charAt(0)?.toUpperCase() || "S"}
                </span>
              )}
            </div>

            {/* Info */}
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.9)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {profile.full_name || "Student"}
              </p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,.3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>
                {profile.email}
              </p>
            </div>

            {/* NEW: Edit pencil icon, fades in on hover */}
            <motion.div
              animate={{ opacity: cardHov || onEditProfilePage ? 1 : 0, x: cardHov || onEditProfilePage ? 0 : 4 }}
              transition={{ duration: 0.18 }}
              style={{
                flexShrink: 0,
                width: 22, height: 22, borderRadius: 7,
                background: "rgba(124,58,237,.25)",
                border: "1px solid rgba(124,58,237,.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Pencil size={10} style={{ color: "#c4b5fd" }} />
            </motion.div>
          </Link>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: "flex", alignItems: "center", gap: 9,
            padding: "8px 10px", borderRadius: 9,
            fontSize: 13, fontWeight: 500,
            color: "rgba(255,255,255,.3)",
            background: "none", border: "none",
            cursor: "pointer", width: "100%",
            transition: "all .18s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(239,68,68,.1)";
            e.currentTarget.style.color = "#f87171";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "none";
            e.currentTarget.style.color = "rgba(255,255,255,.3)";
          }}
        >
          <LogOut size={14} />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
}