// src/app/pyq/page.js
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  ChevronRight,
  GraduationCap,
  BookOpen,
  FileText,
  Download,
  Eye,
  Loader2,
  ExternalLink,
  Clock,
} from "lucide-react";
import AppShell from "@/components/AppShell";

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

// ─────────────────────────────────────────────────────────────────────────────
// BEU DETECTION HELPER
// ─────────────────────────────────────────────────────────────────────────────

function isBEU(university) {
  if (!university) return false;
  const name = (university.name || "").toLowerCase();
  const code = (university.code || "").toLowerCase();
  return (
    name.includes("beu") ||
    name.includes("bihar engineering university") ||
    name.includes("bihar engineering") ||
    code.includes("beu")
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HARDCODED PYQ DATA
// ─────────────────────────────────────────────────────────────────────────────

const SEM_1_2_SUBJECTS = [
  {
    name: "Basic Electrical Engineering",
    code: "100101 / 100201",
    semesters: [1, 2],
    papers: [
      { year: "2023", url: "https://www.akubihar.com/papers/btech-1-sem-basic-electrical-engineering-100101-2023.pdf" },
      { year: "2022", url: "https://www.akubihar.com/papers/btech-1-sem-basic-electrical-engineering-100101-2022.pdf" },
      { year: "2023 (Sem 2)", url: "https://www.akubihar.com/papers/btech-2-sem-basic-electrical-engineering-100201-2023.pdf" },
      { year: "2022 (Sem 2)", url: "https://www.akubihar.com/papers/btech-2-sem-basic-electrical-engineering-100201-2022.pdf" },
    ],
  },
  {
    name: "Basic Electronics Engineering",
    code: "100114",
    semesters: [1],
    papers: [
      { year: "2024", url: "https://www.akubihar.com/papers/btech-1-sem-basic-electronics-engineering-100114-2024.pdf" },
    ],
  },
  {
    name: "Chemistry",
    code: "100103 / 100203",
    semesters: [1, 2],
    papers: [
      { year: "2023", url: "https://www.akubihar.com/papers/btech-1-sem-chemistry-100103-2023.pdf" },
      { year: "2022", url: "https://www.akubihar.com/papers/btech-1-sem-chemistry-100103-2022.pdf" },
      { year: "Dec 2024 (Sem 2)", url: "https://www.akubihar.com/papers/btech-2-sem-chemistry-100203-dec-2024.pdf" },
      { year: "2022 (Sem 2)", url: "https://www.akubihar.com/papers/btech-2-sem-chemistry-100203-2022.pdf" },
    ],
  },
  {
    name: "Communicative English",
    code: "100106 / 100206",
    semesters: [1, 2],
    papers: [
      { year: "2023", url: "https://www.akubihar.com/papers/btech-1-sem-english-100106-2023.pdf" },
      { year: "2022", url: "https://www.akubihar.com/papers/btech-1-sem-english-100106-2022.pdf" },
      { year: "2022 (Sem 2)", url: "https://www.akubihar.com/papers/btech-2-sem-english-100206-2022.pdf" },
      { year: "PYQ Set", url: "https://www.beu-notes.in/pyq/cmnhuhoju000jpkxr3xtn8l1f" },
    ],
  },
  {
    name: "Engineering Graphics & Design",
    code: "100102",
    semesters: [1],
    papers: [
      { year: "2022", url: "https://www.akubihar.com/papers/btech-1-sem-engineering-graphics-and-design-100102-2022.pdf" },
      { year: "PYQ Set (EDG)", url: "https://www.beu-notes.in/pyq/cmnhuhnuf0007pkxr8lrjif5s" },
    ],
  },
  {
    name: "Engineering Mathematics 1",
    code: "102102 / 103102 / 105102",
    semesters: [1],
    papers: [
      { year: "2023 (Calculus & Diff. Eq.)", url: "https://www.akubihar.com/papers/btech-1-sem-mathematics-1-calculus-and-differential-equations-103102-2023.pdf" },
      { year: "2023 (Calculus & Linear Algebra)", url: "https://www.akubihar.com/papers/btech-1-sem-mathematics-1-calculus-and-linear-algebra-105102-2023.pdf" },
      { year: "2022 (Calculus & Linear Algebra)", url: "https://www.akubihar.com/papers/btech-1-sem-mathematics-1-calculus-and-linear-algebra-102102-2022.pdf" },
    ],
  },
  {
    name: "Engineering Mathematics 2",
    code: "100202",
    semesters: [2],
    papers: [
      { year: "PYQ Set", url: "https://www.beu-notes.in/pyq/cmnhuhnny0003pkxr2vcl2my8" },
    ],
  },
  {
    name: "Engineering Physics",
    code: "100110 / 100201",
    semesters: [1, 2],
    papers: [
      { year: "2024 (Sem 1)", url: "https://www.akubihar.com/papers/btech-1-sem-engineering-physics-100110-2024.pdf" },
      { year: "2025 (Sem 2)", url: "https://www.akubihar.com/papers/btech-2-sem-engineering-physics-100201-2025.pdf" },
      { year: "2022 (Mechanics)", url: "https://www.akubihar.com/papers/btech-1-sem-physics-mechanics-101101-2022.pdf" },
      { year: "2023 (Mechanics & Solids)", url: "https://www.akubihar.com/papers/btech-1-sem-physics-mechanics-and-mechanics-of-solid-101101-2023.pdf" },
    ],
  },
  {
    name: "Elements of Mechanical Engineering",
    code: "EME",
    semesters: [2],
    papers: [
      { year: "PYQ Set", url: "https://www.beu-notes.in/pyq/cmnhuhnuf0007pkxr8lrjif5s" },
    ],
  },
  {
    name: "Introduction to Web Design (CS/IT)",
    code: "CS/IT",
    semesters: [2],
    papers: [
      { year: "PYQ Set", url: "https://www.beu-notes.in/pyq/cmnhuhosr000ppkxr07nc0dm3" },
    ],
  },
  {
    name: "IT Workshop",
    code: "100113",
    semesters: [1],
    papers: [
      { year: "2024", url: "https://www.akubihar.com/papers/btech-1-sem-it-workshop-100113-2024.pdf" },
    ],
  },
  {
    name: "Programming for Problem Solving",
    code: "100104 / 100111",
    semesters: [1],
    papers: [
      { year: "2024", url: "https://www.akubihar.com/papers/btech-1-sem-programming-for-problem-solving-100111-2024.pdf" },
      { year: "2023", url: "https://www.akubihar.com/papers/btech-1-sem-programming-for-problem-solving-100104-2023.pdf" },
      { year: "2022", url: "https://www.akubihar.com/papers/btech-1-sem-programming-for-problem-solving-100104-2022.pdf" },
    ],
  },
  {
    name: "Python Programming (CS/IT)",
    code: "CS/IT",
    semesters: [2],
    papers: [
      { year: "PYQ Set", url: "https://www.beu-notes.in/pyq/cmnhuhopu000npkxrxx2n8763" },
    ],
  },
  {
    name: "Workshop & Manufacturing Practices",
    code: "100105",
    semesters: [1, 2],
    papers: [
      { year: "2023", url: "https://www.akubihar.com/papers/btech-1-sem-workshop-manufacturing-practices-100105-2023.pdf" },
      { year: "2022", url: "https://www.akubihar.com/papers/btech-1-sem-workshop-manufacturing-practices-100105-2022.pdf" },
      { year: "PYQ Set (Sem 2)", url: "https://www.beu-notes.in/pyq/cmnhuhovu000rpkxrzhl2we7k" },
    ],
  },
];

const SEM_3_PAPERS = [
  { subject: "Analog Electronic Circuits", year: "2024", url: "https://www.akubihar.com/papers/btech-3-sem-analog-electronic-circuits-100302-2024.pdf" },
  { subject: "Analog Electronic Circuits", year: "2023", url: "https://www.beu-notes.in/pyq/cmnhuhwha0057pkxr5iyncho3" },
  { subject: "Analog Electronics", year: "2020", url: "https://www.beu-notes.in/pyq/cmnhuhwr7005dpkxr9xf4vsmx" },
  { subject: "Basic Electronics Engineering", year: "2020", url: "https://www.beu-notes.in/pyq/cmnhuhrjh002jpkxratx0xx9b" },
  { subject: "Basic Electronics (BE)", year: "2020", url: "https://www.beu-notes.in/pyq/cmnhuhwx4005hpkxrboblzxny" },
  { subject: "Biology for Engineers", year: "2021", url: "https://www.akubihar.com/papers/btech-3-sem-biology-for-engineers-100301-2021.pdf" },
  { subject: "Data Structures & Algorithms", year: "2024", url: "https://www.akubihar.com/papers/btech-3-sem-data-structure-and-algorithams-100304-2024.pdf" },
  { subject: "Data Structures & Algorithms", year: "2021", url: "https://www.akubihar.com/papers/btech-3-sem-data-structures-and-algorithms-100304-2021.pdf" },
  { subject: "Digital Electronics", year: "2024", url: "https://www.akubihar.com/papers/btech-3-sem-digital-electronics-100305-2024.pdf" },
  { subject: "Digital Electronics", year: "2021", url: "https://www.akubihar.com/papers/btech-3-sem-digital-electronics-100305-2021.pdf" },
  { subject: "Electrical Circuit Analysis", year: "2024", url: "https://www.akubihar.com/papers/btech-3-sem-electrical-circuit-analysis-100306-2024.pdf" },
  { subject: "Electromagnetic Fields", year: "2024", url: "https://www.akubihar.com/papers/btech-3-sem-electromagnetic-fields-100308-2024.pdf" },
  { subject: "Engineering Mechanics", year: "2024", url: "https://www.akubihar.com/papers/btech-3-sem-engineering-mechanics-100310-2024.pdf" },
  { subject: "Object Oriented Programming (C++)", year: "2024", url: "https://www.akubihar.com/papers/btech-3-sem-object-oriented-programming-using-cpp-100313-2024.pdf" },
  { subject: "Object Oriented Programming (C++)", year: "2022", url: "https://www.beu-notes.in/pyq/cmnhui0ja007fpkxrqy3ysauq" },
  { subject: "Object Oriented Programming (C++)", year: "2021", url: "https://www.akubihar.com/papers/btech-3-sem-object-oriented-programming-using-cpp-100313-2021.pdf" },
  { subject: "Object Oriented Programming (C++)", year: "2020", url: "https://www.beu-notes.in/pyq/cmnhui0nj007hpkxr2hp1q01v" },
  { subject: "Operating System", year: "2013", url: "https://www.beu-notes.in/pyq/cmnhuigmh00fvpkxrk1p0wxzp" },
  { subject: "Technical Writing", year: "2024", url: "https://www.akubihar.com/papers/btech-3-sem-technical-writing-100314-2024.pdf" },
  { subject: "Thermodynamics", year: "2021", url: "https://www.akubihar.com/papers/btech-3-sem-thermodynamics-102304-2021.pdf" },
  { subject: "Human Resource Dev. & Org. Behaviour", year: "2024", url: "https://www.akubihar.com/papers/btech-4-sem-human-resource-development-and-organizational-behavior-1007407-2024.pdf" },
  { subject: "Operating System (4th Sem)", year: "2024", url: "https://www.akubihar.com/papers/btech-4-sem-operating-system-105403-2024.pdf" },
  { subject: "Discrete Mathematical Structure & Graph Theory", year: "2019", url: "https://www.akubihar.com/papers/btech-common-4-sem-discrete-mathematical-structure-and-graph-theory-211405-2019.pdf" },
];
const SEM_3_MORE_URL = "https://www.akubihar.com/btech-cs-question-papers.html#3s";

const SEM_4_PAPERS = [
  { subject: "Biology for Engineers", year: "2025", url: "https://www.akubihar.com/papers/btech-4-sem-biology-for-engineers-100401-2025.pdf" },
  { subject: "Biology for Engineers", year: "Feb 2025", url: "https://www.akubihar.com/papers/btech-4-sem-biology-for-engineers-100401-feb-2025.pdf" },
  { subject: "Computer Organization & Architecture", year: "2023", url: "https://www.akubihar.com/papers/btech-cs-4-sem-computer-organization-and-architecture-105401-2023.pdf" },
  { subject: "Computer Organization & Architecture", year: "2022", url: "https://www.akubihar.com/papers/btech-cse-4-sem-computer-organization-cse-and-architecture-105401-2022.pdf" },
  { subject: "Design & Analysis of Algorithms", year: "2023", url: "https://www.akubihar.com/papers/btech-cs-4-sem-design-and-analysis-of-algorithms-105402-2023.pdf" },
  { subject: "Design & Analysis of Algorithms", year: "2022", url: "https://www.akubihar.com/papers/btech-cse-4-sem-design-and-analysis-of-algorithms-105402-2022.pdf" },
  { subject: "Digital Electronics", year: "2025", url: "https://www.akubihar.com/papers/btech-4-sem-digital-electronics-100403-2025.pdf" },
  { subject: "Disaster Preparedness & Planning", year: "2025", url: "https://www.akubihar.com/papers/btech-4-sem-disaster-preparedness-and-planning-119403-2025.pdf" },
  { subject: "Electromagnetic Theory", year: "2025", url: "https://www.akubihar.com/papers/btech-4-sem-electromagnetic-theory-104404-2025.pdf" },
  { subject: "Engineering Geology", year: "2025", url: "https://www.akubihar.com/papers/btech-4-sem-engineering-geology-119402-2025.pdf" },
  { subject: "Introduction to Fluid Mechanics", year: "2025", url: "https://www.akubihar.com/papers/btech-4-sem-introduction-to-fluid-mechanics-119404-2025.pdf" },
  { subject: "Material Testing & Evaluation", year: "2025", url: "https://www.akubihar.com/papers/btech-4-sem-material-testing-and-evaluation-119406-2025.pdf" },
  { subject: "Semiconductor Physics & Devices", year: "2025", url: "https://www.akubihar.com/papers/btech-4-sem-semiconductor-physics-and-devices-104405-2025.pdf" },
  { subject: "Structural Analysis", year: "2025", url: "https://www.akubihar.com/papers/btech-4-sem-structural-analysis-119405-2025.pdf" },
];
const SEM_4_MORE_URL = "https://www.akubihar.com/btech-cs-question-papers.html#4s";

const SEM_REDIRECT = {
  5: "https://www.akubihar.com/btech-cs-question-papers.html#5s",
  6: "https://www.akubihar.com/btech-cs-question-papers.html#6s",
  7: "https://www.akubihar.com/btech-cs-question-papers.html#7s",
  8: "https://www.akubihar.com/btech-cs-question-papers.html#8s",
};

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS & UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

function useBreakpoint() {
  const [bp, setBp] = useState({ isMobile: false, isTablet: false });
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setBp({ isMobile: w < 480, isTablet: w >= 480 && w < 768 });
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return bp;
}

// ─────────────────────────────────────────────────────────────────────────────
// UI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function AmbientOrbs() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <motion.div
        animate={{ x: [0, 45, 0], y: [0, -35, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", top: "6%", left: "2%",
          width: "clamp(180px,30vw,340px)", height: "clamp(180px,30vw,340px)",
          borderRadius: "50%",
          background: "radial-gradient(circle,rgba(124,58,237,.07) 0%,transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      <motion.div
        animate={{ x: [0, -35, 0], y: [0, 55, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        style={{
          position: "absolute", bottom: "12%", right: "4%",
          width: "clamp(150px,25vw,280px)", height: "clamp(150px,25vw,280px)",
          borderRadius: "50%",
          background: "radial-gradient(circle,rgba(129,140,248,.06) 0%,transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <motion.div
        animate={{ x: [0, 20, -20, 0], y: [0, 28, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 23, repeat: Infinity, ease: "easeInOut", delay: 10 }}
        style={{
          position: "absolute", top: "42%", left: "44%",
          width: "clamp(120px,20vw,220px)", height: "clamp(120px,20vw,220px)",
          borderRadius: "50%",
          background: "radial-gradient(circle,rgba(167,139,250,.05) 0%,transparent 70%)",
          filter: "blur(70px)",
        }}
      />
    </div>
  );
}

function OptionCard({ icon: Icon, title, subtitle, onClick, index = 0, badge }) {
  const { isMobile } = useBreakpoint();
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 180, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 180, damping: 22 });

  const handleMouseMove = (e) => {
    if (isMobile) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.button
      ref={cardRef}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.045, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); mouseX.set(0); mouseY.set(0); }}
      onMouseMove={handleMouseMove}
      style={{
        display: "flex", alignItems: "center",
        gap: "clamp(10px,3vw,14px)",
        padding: "clamp(14px,3.5vw,18px)",
        borderRadius: 16,
        background: hovered ? "rgba(124,58,237,.08)" : "rgba(255,255,255,.04)",
        border: `1px solid ${hovered ? "rgba(124,58,237,.5)" : "rgba(255,255,255,.08)"}`,
        boxShadow: hovered ? "0 0 32px rgba(124,58,237,.22),0 8px 24px rgba(0,0,0,.2)" : "none",
        cursor: "pointer", textAlign: "left", fontFamily: "inherit", width: "100%",
        transition: "border-color .25s,box-shadow .3s cubic-bezier(.22,1,.36,1),background .25s",
        position: "relative", overflow: "hidden", willChange: "box-shadow",
      }}
    >
      {!isMobile && (
        <motion.div style={{
          position: "absolute", width: 220, height: 220, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(124,58,237,.12) 0%,transparent 70%)",
          pointerEvents: "none", left: springX, top: springY,
          transform: "translate(-50%,-50%)",
          opacity: hovered ? 1 : 0, transition: "opacity .3s", zIndex: 0,
        }} />
      )}
      {Icon && (
        <motion.div
          animate={hovered ? { boxShadow: ["0 0 0px rgba(167,139,250,0)","0 0 20px rgba(167,139,250,.4)","0 0 0px rgba(167,139,250,0)"] } : {}}
          transition={{ duration: 1.6, repeat: hovered ? Infinity : 0, ease: "easeInOut" }}
          style={{
            width: "clamp(36px,9vw,42px)", height: "clamp(36px,9vw,42px)",
            borderRadius: 11, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg,rgba(124,58,237,.25),rgba(91,33,182,.25))",
            border: `1px solid ${hovered ? "rgba(167,139,250,.45)" : "rgba(167,139,250,.25)"}`,
            transition: "border .3s", position: "relative", zIndex: 1,
          }}
        >
          <Icon size={isMobile ? 16 : 19} style={{ color: "#c4b5fd", filter: hovered ? "drop-shadow(0 0 6px rgba(167,139,250,.7))" : "none", transition: "filter .3s" }} />
        </motion.div>
      )}
      <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>
        <p style={{
          fontSize: "clamp(13px,3.5vw,14.5px)", fontWeight: 700,
          color: hovered ? "#fff" : "rgba(255,255,255,.9)",
          marginBottom: subtitle ? 2 : 0,
          textShadow: hovered ? "0 0 20px rgba(167,139,250,.4)" : "none",
          transition: "text-shadow .3s", wordBreak: "break-word",
        }}>
          {title}
        </p>
        {subtitle && (
          <p style={{ fontSize: "clamp(11px,2.8vw,12px)", color: hovered ? "rgba(255,255,255,.55)" : "rgba(255,255,255,.4)", transition: "color .25s" }}>
            {subtitle}
          </p>
        )}
      </div>
      {badge && (
        <span style={{
          fontSize: "clamp(10px,2.5vw,11px)", fontWeight: 600, color: "#a78bfa",
          background: "rgba(124,58,237,.14)", border: "1px solid rgba(124,58,237,.3)",
          borderRadius: 20, padding: "3px 10px", flexShrink: 0,
          position: "relative", zIndex: 1,
          boxShadow: hovered ? "0 0 14px rgba(124,58,237,.3)" : "none",
          transition: "box-shadow .3s",
        }}>
          {badge}
        </span>
      )}
      <motion.div animate={{ x: hovered ? 3 : 0 }} transition={{ duration: .2 }} style={{ position: "relative", zIndex: 1, flexShrink: 0 }}>
        <ChevronRight size={isMobile ? 14 : 16} style={{ color: hovered ? "rgba(167,139,250,.7)" : "rgba(255,255,255,.25)", transition: "color .25s" }} />
      </motion.div>
    </motion.button>
  );
}

function Breadcrumb({ steps, onJump }) {
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "clamp(4px,1.5vw,6px)", marginBottom: 24, overflowX: "auto", scrollbarWidth: "none" }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "clamp(4px,1.5vw,6px)", flexShrink: 0 }}>
          <motion.button
            whileHover={s.clickable ? { scale: 1.05 } : {}}
            whileTap={s.clickable ? { scale: .95 } : {}}
            onClick={() => s.clickable && onJump(i)}
            style={{
              fontSize: "clamp(11px,2.8vw,12.5px)",
              fontWeight: i === steps.length - 1 ? 700 : 500,
              color: i === steps.length - 1 ? "#fff" : "rgba(255,255,255,.4)",
              background: "none", border: "none",
              cursor: s.clickable ? "pointer" : "default",
              padding: "4px 6px", borderRadius: 6, fontFamily: "inherit",
              transition: "color .15s,background .15s", whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => { if (s.clickable) { e.currentTarget.style.color = "#c4b5fd"; e.currentTarget.style.background = "rgba(124,58,237,.1)"; } }}
            onMouseLeave={(e) => { e.currentTarget.style.color = i === steps.length - 1 ? "#fff" : "rgba(255,255,255,.4)"; e.currentTarget.style.background = "none"; }}
          >
            {s.label}
          </motion.button>
          {i < steps.length - 1 && <ChevronRight size={13} style={{ color: "rgba(255,255,255,.2)", flexShrink: 0 }} />}
        </div>
      ))}
    </div>
  );
}

function SemButton({ s, index, onClick }) {
  const { isMobile } = useBreakpoint();
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: isMobile ? "18px 0" : "26px 0",
        borderRadius: 16, textAlign: "center",
        background: hovered ? "rgba(124,58,237,.12)" : "rgba(255,255,255,.04)",
        border: `1px solid ${hovered ? "rgba(124,58,237,.55)" : "rgba(255,255,255,.08)"}`,
        boxShadow: hovered ? "0 0 28px rgba(124,58,237,.28),0 8px 24px rgba(0,0,0,.2)" : "none",
        cursor: "pointer", fontFamily: "inherit",
        transition: "all .28s cubic-bezier(.22,1,.36,1)",
        position: "relative", overflow: "hidden",
      }}
    >
      <motion.div
        animate={hovered ? { opacity: [0, .5, 0], scale: [0.4, 1.4, 0.4] } : { opacity: 0 }}
        transition={{ duration: 1.4, repeat: hovered ? Infinity : 0, ease: "easeInOut" }}
        style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at center,rgba(124,58,237,.2) 0%,transparent 70%)", pointerEvents: "none" }}
      />
      <p style={{
        fontSize: isMobile ? "clamp(18px,5vw,24px)" : 24, fontWeight: 800,
        color: hovered ? "#fff" : "rgba(255,255,255,.9)", marginBottom: 3,
        textShadow: hovered ? "0 0 22px rgba(167,139,250,.7)" : "none",
        transition: "text-shadow .3s,color .25s", position: "relative", zIndex: 1,
      }}>
        {s}
      </p>
      <p style={{
        fontSize: "clamp(9px,2.2vw,11px)",
        color: hovered ? "rgba(167,139,250,.8)" : "rgba(255,255,255,.35)",
        textTransform: "uppercase", letterSpacing: ".06em",
        transition: "color .25s", position: "relative", zIndex: 1,
      }}>
        Semester
      </p>
    </motion.button>
  );
}

function PaperRow({ url, year, index }) {
  const { isMobile } = useBreakpoint();
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: "clamp(10px,3vw,14px)",
        background: hovered ? "rgba(124,58,237,.07)" : "rgba(255,255,255,.04)",
        border: `1px solid ${hovered ? "rgba(124,58,237,.35)" : "rgba(255,255,255,.08)"}`,
        boxShadow: hovered ? "0 0 24px rgba(124,58,237,.18),0 6px 20px rgba(0,0,0,.18)" : "none",
        borderRadius: 14, padding: "clamp(12px,3vw,14px) clamp(12px,3vw,16px)",
        transition: "all .28s cubic-bezier(.22,1,.36,1)",
        flexWrap: isMobile ? "wrap" : "nowrap",
      }}
    >
      <motion.div
        animate={hovered ? { boxShadow: ["0 0 0px rgba(167,139,250,0)","0 0 18px rgba(167,139,250,.45)","0 0 0px rgba(167,139,250,0)"] } : {}}
        transition={{ duration: 1.5, repeat: hovered ? Infinity : 0 }}
        style={{
          width: "clamp(36px,9vw,42px)", height: "clamp(36px,9vw,42px)",
          borderRadius: 11, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg,rgba(124,58,237,.25),rgba(91,33,182,.25))",
          border: `1px solid ${hovered ? "rgba(167,139,250,.45)" : "rgba(167,139,250,.25)"}`,
          transition: "border .3s",
        }}
      >
        <FileText size={isMobile ? 16 : 18} style={{ color: "#c4b5fd", filter: hovered ? "drop-shadow(0 0 6px rgba(167,139,250,.7))" : "none", transition: "filter .3s" }} />
      </motion.div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: "clamp(13px,3.5vw,14px)", fontWeight: 700,
          color: hovered ? "#fff" : "rgba(255,255,255,.9)",
          textShadow: hovered ? "0 0 18px rgba(167,139,250,.35)" : "none",
          transition: "text-shadow .3s,color .25s",
        }}>
          {year}
        </p>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0, width: isMobile ? "100%" : undefined, marginTop: isMobile ? 4 : 0 }}>
        <motion.a
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          href={url} target="_blank" rel="noopener noreferrer"
          style={{
            flex: isMobile ? 1 : undefined,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            fontSize: "clamp(11px,2.8vw,12.5px)", fontWeight: 600,
            color: "rgba(255,255,255,.7)", background: "rgba(255,255,255,.06)",
            border: "1px solid rgba(255,255,255,.12)", borderRadius: 9,
            padding: "8px 13px", textDecoration: "none", transition: "all .2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.12)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.color = "rgba(255,255,255,.7)"; }}
        >
          <Eye size={isMobile ? 13 : 14} /> View
        </motion.a>
        <motion.a
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          href={url} download target="_blank" rel="noopener noreferrer"
          style={{
            flex: isMobile ? 1 : undefined,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            fontSize: "clamp(11px,2.8vw,12.5px)", fontWeight: 700, color: "#fff",
            background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
            borderRadius: 9, padding: "8px 13px", textDecoration: "none",
            boxShadow: "0 3px 14px rgba(124,58,237,.4)", transition: "box-shadow .2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 5px 22px rgba(124,58,237,.65)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 3px 14px rgba(124,58,237,.4)"; }}
        >
          <Download size={isMobile ? 13 : 14} /> Download
        </motion.a>
      </div>
    </motion.div>
  );
}

function FlatPaperCard({ subject, year, url, index }) {
  const { isMobile } = useBreakpoint();
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: "clamp(10px,3vw,14px)",
        background: hovered ? "rgba(124,58,237,.07)" : "rgba(255,255,255,.04)",
        border: `1px solid ${hovered ? "rgba(124,58,237,.4)" : "rgba(255,255,255,.08)"}`,
        boxShadow: hovered ? "0 0 28px rgba(124,58,237,.2),0 6px 20px rgba(0,0,0,.18)" : "none",
        borderRadius: 14, padding: "clamp(12px,3vw,14px) clamp(12px,3vw,16px)",
        transition: "all .28s cubic-bezier(.22,1,.36,1)",
        flexWrap: isMobile ? "wrap" : "nowrap",
      }}
    >
      <motion.div
        animate={hovered ? { boxShadow: ["0 0 0px rgba(167,139,250,0)","0 0 18px rgba(167,139,250,.5)","0 0 0px rgba(167,139,250,0)"] } : {}}
        transition={{ duration: 1.5, repeat: hovered ? Infinity : 0 }}
        style={{
          width: "clamp(36px,9vw,42px)", height: "clamp(36px,9vw,42px)",
          borderRadius: 11, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg,rgba(124,58,237,.25),rgba(91,33,182,.25))",
          border: `1px solid ${hovered ? "rgba(167,139,250,.5)" : "rgba(167,139,250,.25)"}`,
          transition: "border .3s",
        }}
      >
        <FileText size={isMobile ? 16 : 18} style={{ color: "#c4b5fd", filter: hovered ? "drop-shadow(0 0 6px rgba(167,139,250,.8))" : "none", transition: "filter .3s" }} />
      </motion.div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: "clamp(13px,3.5vw,14px)", fontWeight: 700,
          color: hovered ? "#fff" : "rgba(255,255,255,.9)",
          textShadow: hovered ? "0 0 18px rgba(167,139,250,.4)" : "none",
          transition: "text-shadow .3s,color .25s", wordBreak: "break-word",
        }}>
          {subject}
        </p>
        <p style={{ fontSize: "clamp(10px,2.6vw,11.5px)", color: hovered ? "rgba(167,139,250,.7)" : "rgba(255,255,255,.35)", transition: "color .25s", marginTop: 2 }}>
          {year}
        </p>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0, width: isMobile ? "100%" : undefined, marginTop: isMobile ? 4 : 0 }}>
        <motion.a
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          href={url} target="_blank" rel="noopener noreferrer"
          style={{
            flex: isMobile ? 1 : undefined,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            fontSize: "clamp(11px,2.8vw,12.5px)", fontWeight: 600,
            color: "rgba(255,255,255,.7)", background: "rgba(255,255,255,.06)",
            border: "1px solid rgba(255,255,255,.12)", borderRadius: 9,
            padding: "8px 13px", textDecoration: "none", transition: "all .2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.12)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.color = "rgba(255,255,255,.7)"; }}
        >
          <Eye size={isMobile ? 13 : 14} /> View
        </motion.a>
        <motion.a
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          href={url} download target="_blank" rel="noopener noreferrer"
          style={{
            flex: isMobile ? 1 : undefined,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            fontSize: "clamp(11px,2.8vw,12.5px)", fontWeight: 700, color: "#fff",
            background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
            borderRadius: 9, padding: "8px 13px", textDecoration: "none",
            boxShadow: "0 3px 14px rgba(124,58,237,.4)", transition: "box-shadow .2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 5px 22px rgba(124,58,237,.65)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 3px 14px rgba(124,58,237,.4)"; }}
        >
          <Download size={isMobile ? 13 : 14} /> Download
        </motion.a>
      </div>
    </motion.div>
  );
}

function MorePapersButton({ url, sem }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.a
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      href={url} target="_blank" rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        marginTop: 16, padding: "13px 20px", borderRadius: 14,
        background: hovered ? "rgba(124,58,237,.15)" : "rgba(124,58,237,.07)",
        border: `1px solid ${hovered ? "rgba(124,58,237,.6)" : "rgba(124,58,237,.25)"}`,
        boxShadow: hovered ? "0 0 28px rgba(124,58,237,.3)" : "none",
        color: hovered ? "#fff" : "#a78bfa",
        fontSize: "clamp(12px,3vw,13.5px)", fontWeight: 600,
        textDecoration: "none",
        transition: "all .28s cubic-bezier(.22,1,.36,1)",
      }}
    >
      <ExternalLink size={15} style={{ flexShrink: 0 }} />
      View more Sem {sem} PYQ papers on akubihar.com
    </motion.a>
  );
}

function RedirectScreen({ sem, url }) {
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => window.open(url, "_blank"), 1200);
    return () => clearTimeout(t);
  }, [url]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: "center", padding: "clamp(32px,8vw,52px) 0" }}
    >
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 64, height: 64, borderRadius: 20, marginBottom: 20,
          background: "linear-gradient(135deg,rgba(124,58,237,.3),rgba(91,33,182,.3))",
          border: "1px solid rgba(167,139,250,.35)",
          boxShadow: "0 0 32px rgba(124,58,237,.3)",
        }}
      >
        <ExternalLink size={26} style={{ color: "#c4b5fd" }} />
      </motion.div>
      <p style={{ fontSize: "clamp(14px,4vw,17px)", fontWeight: 700, color: "#fff", marginBottom: 8 }}>
        Redirecting to Semester {sem} PYQs…
      </p>
      <p style={{ fontSize: "clamp(11px,2.8vw,13px)", color: "rgba(255,255,255,.4)", marginBottom: 24 }}>
        Opening akubihar.com in a new tab
      </p>
      <motion.a
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
        href={url} target="_blank" rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "12px 24px", borderRadius: 12,
          background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
          color: "#fff", fontSize: "clamp(12px,3vw,14px)", fontWeight: 700,
          textDecoration: "none",
          boxShadow: hovered ? "0 5px 22px rgba(124,58,237,.65)" : "0 3px 14px rgba(124,58,237,.4)",
          transition: "box-shadow .2s",
        }}
      >
        <ExternalLink size={14} /> Open Now
      </motion.a>
    </motion.div>
  );
}

// ── NEW: Cinematic Coming Soon screen for non-BEU universities ──
function ComingSoonScreen({ universityName }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ textAlign: "center", padding: "clamp(40px,10vw,64px) 0" }}
    >
      {/* Pulsing rings + icon */}
      <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", width: 96, height: 96, borderRadius: "50%", border: "1px solid rgba(124,58,237,.4)" }}
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          style={{ position: "absolute", width: 112, height: 112, borderRadius: "50%", border: "1px solid rgba(124,58,237,.2)" }}
        />
        <motion.div
          animate={{ boxShadow: ["0 0 24px rgba(124,58,237,.3)","0 0 48px rgba(124,58,237,.6)","0 0 24px rgba(124,58,237,.3)"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 72, height: 72, borderRadius: 22,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg,rgba(124,58,237,.35),rgba(91,33,182,.35))",
            border: "1px solid rgba(167,139,250,.4)", position: "relative", zIndex: 1,
          }}
        >
          <Clock size={30} style={{ color: "#c4b5fd", filter: "drop-shadow(0 0 8px rgba(167,139,250,.8))" }} />
        </motion.div>
      </div>

      {/* Headline */}
      <motion.p
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        style={{
          fontSize: "clamp(20px,5.5vw,26px)", fontWeight: 800, marginBottom: 10,
          background: "linear-gradient(135deg,#fff 0%,#c4b5fd 55%,#818cf8 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}
      >
        Coming Soon
      </motion.p>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
        style={{ fontSize: "clamp(12px,3.2vw,14px)", color: "rgba(255,255,255,.45)", maxWidth: 320, margin: "0 auto 28px", lineHeight: 1.6 }}
      >
        PYQ papers for{" "}
        <span style={{ color: "#a78bfa", fontWeight: 600 }}>{universityName}</span>{" "}
        are being added. Check back soon!
      </motion.p>

      {/* Bouncing dots */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 32 }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
            style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "linear-gradient(135deg,#7c3aed,#818cf8)",
              boxShadow: "0 0 10px rgba(124,58,237,.6)",
            }}
          />
        ))}
      </div>

      {/* Info badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }}
        style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          padding: "14px 20px", borderRadius: 14,
          background: "rgba(124,58,237,.06)", border: "1px solid rgba(124,58,237,.2)",
          boxShadow: "0 0 24px rgba(124,58,237,.1)",
        }}
      >
        <GraduationCap size={16} style={{ color: "#a78bfa", flexShrink: 0 }} />
        <p style={{ fontSize: "clamp(11px,2.8vw,12.5px)", color: "rgba(255,255,255,.4)", margin: 0 }}>
          Currently available for{" "}
          <span style={{ color: "#c4b5fd", fontWeight: 700 }}>BEU</span>{" "}
          students only
        </p>
      </motion.div>
    </motion.div>
  );
}

function EmptyState({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{
        textAlign: "center", padding: "clamp(32px,8vw,44px) 0",
        color: "rgba(255,255,255,.25)", fontSize: "clamp(12px,3.2vw,13.5px)",
        border: "1px dashed rgba(255,255,255,.1)", borderRadius: 16,
      }}
    >
      {text}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function PyqPage() {
  const router = useRouter();
  const { isMobile } = useBreakpoint();

  // Steps:
  // 0 = University select
  // 1 = Semester select (BEU) OR Coming Soon (non-BEU)
  // 2 = Subjects (sem 1 & 2) OR All papers (sem 3 & 4) OR Redirect (sem 5-8)
  // 3 = Papers for selected subject (sem 1 & 2 only)

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [universities, setUniversities] = useState([]);

  const [university, setUniversity] = useState(null);
  const [semester, setSemester] = useState(null);
  const [subject, setSubject] = useState(null);

  // Auth guard
  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push("/login");
    };
    check();
  }, [router]);

  // Load universities from Supabase
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.from("universities").select("*").order("name");
      setUniversities(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const selectUniversity = (u) => {
    setUniversity(u);
    setSemester(null);
    setSubject(null);
    setStep(1); // step 1 shows ComingSoon for non-BEU, semesters for BEU
  };

  const selectSemester = (s) => {
    setSemester(s);
    setSubject(null);
    setStep(2);
  };

  const selectSubject = (subj) => {
    setSubject(subj);
    setStep(3);
  };

  const jumpTo = (crumbIndex) => {
    if (crumbIndex === 0) { setStep(0); setUniversity(null); setSemester(null); setSubject(null); }
    else if (crumbIndex === 1) { setStep(1); setSemester(null); setSubject(null); }
    else if (crumbIndex === 2) { setStep(2); setSubject(null); }
  };

  // Derived
  const universityIsBEU = isBEU(university);
  const isCommonSem = semester === 1 || semester === 2;
  const isRedirectSem = semester >= 5;
  const visibleSubjects = SEM_1_2_SUBJECTS.filter((s) => s.semesters.includes(semester));
  const flatPapers = semester === 3 ? SEM_3_PAPERS : semester === 4 ? SEM_4_PAPERS : [];
  const moreUrl = semester === 3 ? SEM_3_MORE_URL : semester === 4 ? SEM_4_MORE_URL : null;

  // Breadcrumbs
  const crumbs = [{ label: "University", clickable: true }];
  if (university) crumbs.push({ label: university.code || university.name, clickable: true });
  if (semester) crumbs.push({ label: `Sem ${semester}`, clickable: step > 2 });
  if (subject) crumbs.push({ label: subject.name, clickable: false });

  const semCols = isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)";

  return (
    <AppShell>
      <AmbientOrbs />
      <div style={{
        padding: "clamp(20px,5vw,32px) clamp(14px,5vw,28px) clamp(40px,8vw,60px)",
        maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1,
      }}>
        <motion.h1
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: "clamp(19px,5.5vw,26px)", fontWeight: 800, marginBottom: 22,
            background: "linear-gradient(135deg,#fff 0%,#c4b5fd 50%,#818cf8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}
        >
          Previous Year Questions
        </motion.h1>

        <Breadcrumb steps={crumbs} onJump={jumpTo} />

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,.4)", fontSize: 13, padding: "30px 0" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: .8, repeat: Infinity, ease: "linear" }}>
              <Loader2 size={16} />
            </motion.div>
            Loading…
          </div>
        )}

        {!loading && (
          <AnimatePresence mode="wait">

            {/* ── STEP 0: University ── */}
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {universities.length === 0
                  ? <EmptyState text="No universities added yet." />
                  : universities.map((u, i) => (
                    <OptionCard key={u.id} icon={GraduationCap} title={u.name} subtitle={u.code} index={i} onClick={() => selectUniversity(u)} />
                  ))}
              </motion.div>
            )}

            {/* ── STEP 1: Semesters for BEU / Coming Soon for others ── */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                {universityIsBEU ? (
                  <div style={{ display: "grid", gridTemplateColumns: semCols, gap: "clamp(8px,2.5vw,12px)" }}>
                    {SEMESTERS.map((s, i) => (
                      <SemButton key={s} s={s} index={i} onClick={() => selectSemester(s)} />
                    ))}
                  </div>
                ) : (
                  <ComingSoonScreen universityName={university?.name || "this university"} />
                )}
              </motion.div>
            )}

            {/* ── STEP 2: Content varies by semester ── */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>

                {isCommonSem && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }}
                      style={{
                        fontSize: "clamp(11px,2.8vw,12px)", color: "#a78bfa",
                        background: "rgba(124,58,237,.1)", border: "1px solid rgba(124,58,237,.25)",
                        borderRadius: 10, padding: "8px 14px", marginBottom: 14,
                        display: "inline-block", width: "fit-content",
                        boxShadow: "0 0 18px rgba(124,58,237,.12)",
                      }}
                    >
                      Common subjects for all branches — Semester {semester}
                    </motion.div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {visibleSubjects.map((s, i) => (
                        <OptionCard
                          key={s.name} icon={BookOpen} title={s.name} subtitle={s.code}
                          badge={`${s.papers.length} paper${s.papers.length > 1 ? "s" : ""}`}
                          index={i} onClick={() => selectSubject(s)}
                        />
                      ))}
                    </div>
                  </>
                )}

                {(semester === 3 || semester === 4) && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }}
                      style={{
                        fontSize: "clamp(11px,2.8vw,12px)", color: "#a78bfa",
                        background: "rgba(124,58,237,.1)", border: "1px solid rgba(124,58,237,.25)",
                        borderRadius: 10, padding: "8px 14px", marginBottom: 14,
                        display: "inline-block", width: "fit-content",
                        boxShadow: "0 0 18px rgba(124,58,237,.12)",
                      }}
                    >
                      All available PYQs — Semester {semester}
                    </motion.div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {flatPapers.map((p, i) => (
                        <FlatPaperCard key={`${p.subject}-${p.year}-${i}`} subject={p.subject} year={p.year} url={p.url} index={i} />
                      ))}
                    </div>
                    {moreUrl && <MorePapersButton url={moreUrl} sem={semester} />}
                  </>
                )}

                {isRedirectSem && (
                  <RedirectScreen sem={semester} url={SEM_REDIRECT[semester]} />
                )}

              </motion.div>
            )}

            {/* ── STEP 3: Papers for selected subject ── */}
            {step === 3 && subject && (
              <motion.div
                key="s3"
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8 }}
              >
                <div style={{ marginBottom: 18 }}>
                  <h2 style={{ fontSize: "clamp(16px,4.5vw,19px)", fontWeight: 800, color: "#fff", marginBottom: 3, wordBreak: "break-word" }}>
                    {subject.name}
                  </h2>
                  <p style={{ fontSize: "clamp(11px,2.8vw,12.5px)", color: "rgba(255,255,255,.4)" }}>
                    {subject.code}
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {subject.papers.map((p, i) => (
                    <PaperRow key={i} url={p.url} year={p.year} index={i} />
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        )}

        {/* Back button */}
        {step > 0 && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            whileHover={{ x: -3 }}
            onClick={() => jumpTo(step === 3 ? 2 : step === 2 ? 1 : 0)}
            style={{
              display: "flex", alignItems: "center", gap: 6, marginTop: 26,
              fontSize: "clamp(12px,3vw,13px)", color: "rgba(255,255,255,.4)",
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "inherit", padding: "6px 4px", transition: "color .15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#c4b5fd")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,.4)")}
          >
            <ArrowLeft size={isMobile ? 13 : 14} /> Back
          </motion.button>
        )}
      </div>

      <style>{`
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        div::-webkit-scrollbar { display: none; }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: .01ms !important; transition-duration: .01ms !important; }
        }
      `}</style>
    </AppShell>
  );
}