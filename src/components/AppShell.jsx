// src/components/AppShell.js
// REPLACE the existing file at: src/components/AppShell.js

"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Sidebar from "./sidebar";
import Footer from "./footer";
import { Menu, X } from "lucide-react";

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  // Top bar glow on scroll
  useEffect(() => {
    const el = document.getElementById("main-scroll");
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 10);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#08080f",
        // Cinematic subtle noise texture via gradient
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,58,237,.12), transparent)",
      }}
    >
      {/* ════════════════════════════
          DESKTOP SIDEBAR — always visible
         ════════════════════════════ */}
      <motion.div
        initial={{ x: -260, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:block flex-shrink-0"
        style={{ width: 248, zIndex: 30 }}
      >
        <Sidebar />
      </motion.div>

      {/* ════════════════════════════
          MOBILE OVERLAY + DRAWER
         ════════════════════════════ */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setSidebarOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 40,
                backgroundColor: "rgba(0,0,0,.72)",
                backdropFilter: "blur(6px)",
              }}
              className="lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: -260, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -260, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              style={{
                position: "fixed",
                left: 0,
                top: 0,
                bottom: 0,
                width: 248,
                zIndex: 50,
              }}
              className="lg:hidden"
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ════════════════════════════
          MAIN AREA
         ════════════════════════════ */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {/* ── Mobile top bar ── */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="lg:hidden flex items-center justify-between px-4 flex-shrink-0"
          style={{
            height: 52,
            background: scrolled
              ? "rgba(4,4,12,.95)"
              : "rgba(8,8,15,.8)",
            borderBottom: "1px solid rgba(124,58,237,.15)",
            backdropFilter: "blur(16px)",
            transition: "background .3s",
            // Purple glow line on top
            boxShadow: scrolled
              ? "0 1px 0 rgba(124,58,237,.25), 0 4px 20px rgba(0,0,0,.4)"
              : "none",
          }}
        >
          {/* Hamburger */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setSidebarOpen(true)}
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,.05)",
              border: "1px solid rgba(255,255,255,.08)",
              cursor: "pointer",
              color: "rgba(255,255,255,.7)",
              transition: "all .18s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(124,58,237,.18)";
              e.currentTarget.style.borderColor = "rgba(124,58,237,.4)";
              e.currentTarget.style.color = "#c4b5fd";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255,255,255,.05)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,.08)";
              e.currentTarget.style.color = "rgba(255,255,255,.7)";
            }}
          >
            <Menu size={17} />
          </motion.button>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 7,
                background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
                boxShadow: "0 0 14px rgba(124,58,237,.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              N
            </div>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: ".02em",
              }}
            >
              Notiq
            </span>
          </div>

          {/* Spacer */}
          <div style={{ width: 34 }} />
        </motion.div>

        {/* ── Page content with cinematic transition ── */}
        <div
          id="main-scroll"
          className="app-content"
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            // Subtle radial glow top-right corner
            background:
              "radial-gradient(ellipse 60% 40% at 100% 0%, rgba(124,58,237,.07), transparent)",
          }}
        >
          <div style={{ flex: 1 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(2px)" }}
                transition={{
                  duration: 0.32,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Footer (added) ── */}
          <Footer />
        </div>
      </div>

      {/* ════════════════════════════
          GLOBAL CINEMATIC GLOW ORBS
          Subtle ambient light blobs
         ════════════════════════════ */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "-20%",
          left: "10%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,.07) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
          animation: "orbFloat 8s ease-in-out infinite",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          bottom: "-15%",
          right: "5%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,.05) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
          animation: "orbFloat 10s ease-in-out infinite reverse",
        }}
      />

      <style>{`
        @keyframes orbFloat {
          0%,100% { transform: translateY(0px) scale(1);   }
          50%      { transform: translateY(30px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}