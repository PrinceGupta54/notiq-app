// src/components/Footer.js
// CREATE this file at: src/components/Footer.js

"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const COLUMNS = [
  {
    title: "Academics",
    links: ["Results", "Notes", "Notices", "CGPA Calculator"],
  },
  {
    title: "Resources",
    links: ["University Links", "eBooks", "Previous Papers", "Syllabus"],
  },
  {
    title: "Tools",
    links: ["Attendance Tracker", "GPA Predictor", "Study Planner", "Timetable"],
  },
  {
    title: "Support",
    links: ["Doubt & Chat Support", "Help Center", "Feedback", "Contact Us"],
  },
];

const slug = (s) => "/" + s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "relative",
        marginTop: "auto",
        flexShrink: 0,
        overflow: "hidden",
        background:
          "linear-gradient(180deg, transparent 0%, rgba(124,58,237,.05) 100%)",
      }}
    >
      {/* ── Aurora top line ── */}
      <div
        aria-hidden="true"
        style={{
          height: 1,
          width: "100%",
          background:
            "linear-gradient(90deg, transparent, rgba(167,139,250,.5), rgba(129,140,248,.5), transparent)",
          backgroundSize: "200% 100%",
          animation: "auroraMove 6s linear infinite",
        }}
      />

      {/* ── Ambient glow orb ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: -120,
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 240,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(124,58,237,.10) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1180,
          margin: "0 auto",
          padding: "56px 28px 0",
        }}
      >
        {/* ── Brand + columns ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr",
            gap: 32,
          }}
          className="footer-grid"
        >
          {/* Brand block */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
                  boxShadow: "0 0 16px rgba(124,58,237,.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                N
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: ".02em" }}>
                Notiq
              </span>
            </div>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.6,
                color: "rgba(255,255,255,.38)",
                maxWidth: 220,
              }}
            >
              Everything an engineering student needs, in one calm place — results, notes, attendance and more.
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,.85)",
                }}
              >
                {col.title}
              </span>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 11, margin: 0, padding: 0 }}>
                {col.links.map((label) => (
                  <li key={label}>
                    <Link
                      href={slug(label)}
                      style={{
                        fontSize: 13,
                        color: "rgba(255,255,255,.45)",
                        textDecoration: "none",
                        transition: "color .18s, padding-left .18s",
                        display: "inline-block",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#c4b5fd";
                        e.currentTarget.style.paddingLeft = "4px";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "rgba(255,255,255,.45)";
                        e.currentTarget.style.paddingLeft = "0px";
                      }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Divider ── */}
        <div
          style={{
            marginTop: 44,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent)",
          }}
        />

        {/* ── Bottom strip / cinematic credit ── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "20px 0 24px",
          }}
        >
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.28)", letterSpacing: ".02em" }}>
            © 2026 Notiq. All rights reserved.
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12.5, color: "rgba(255,255,255,.3)" }}>Designed &amp; engineered with</span>
            <span
              style={{
                fontSize: 13,
                animation: "heartbeat 1.4s ease-in-out infinite",
                display: "inline-block",
              }}
            >
              ❤️
            </span>
            <span style={{ fontSize: 12.5, color: "rgba(255,255,255,.3)" }}>by</span>
            <span
              style={{
                fontSize: 13.5,
                fontWeight: 800,
                letterSpacing: ".03em",
                background: "linear-gradient(135deg,#a78bfa,#818cf8,#c4b5fd)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "shineText 4s ease-in-out infinite",
              }}
            >
              Somya Naveen
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes heartbeat {
          0%, 100% { transform: scale(1);    }
          14%      { transform: scale(1.3);  }
          28%      { transform: scale(1);    }
          42%      { transform: scale(1.3);  }
          70%      { transform: scale(1);    }
        }
        @keyframes auroraMove {
          0%   { background-position: 0% 0%;   }
          100% { background-position: 200% 0%; }
        }
        @keyframes shineText {
          0%, 100% { background-position: 0% 50%;   }
          50%      { background-position: 100% 50%; }
        }
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            row-gap: 36px !important;
          }
        }
        @media (max-width: 520px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </motion.footer>
  );
}