// src/app/coursify/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, CheckCircle2, ChevronRight } from "lucide-react";

export default function CoursePlayerPage() {
  const router = useRouter();
  const { id } = useParams();
  const [userId, setUserId] = useState(null);
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [completed, setCompleted] = useState(new Set());
  const [activeVideo, setActiveVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setUserId(session.user.id);

      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      const { data: videosData } = await supabase
        .from("course_videos")
        .select("*")
        .eq("course_id", id)
        .order("position");

      const { data: progressData } = await supabase
        .from("user_progress")
        .select("video_id")
        .eq("user_id", session.user.id)
        .eq("course_id", id)
        .eq("completed", true);

      setCourse(courseData);
      setVideos(videosData || []);
      setCompleted(new Set((progressData || []).map((p) => p.video_id)));
      setActiveVideo(videosData?.[0] || null);
      setLoading(false);
    };
    init();
  }, [id, router]);

  const switchVideo = (video) => {
    setActiveVideo(video);
  };

  const markComplete = async (video) => {
    if (completed.has(video.video_id)) return;
    setCompleted((prev) => new Set([...prev, video.video_id]));
    await supabase.from("user_progress").upsert({
      user_id: userId,
      course_id: id,
      video_id: video.video_id,
      completed: true,
    });
  };

  const goNext = () => {
    const idx = videos.findIndex((v) => v.video_id === activeVideo?.video_id);
    if (idx < videos.length - 1) switchVideo(videos[idx + 1]);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#08080f",
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,58,237,.12), transparent)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "2.5px solid rgba(124,58,237,.25)",
              borderTopColor: "#a78bfa",
              animation: "spin .8s linear infinite",
              boxShadow: "0 0 18px rgba(124,58,237,.4)",
            }}
          />
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)", letterSpacing: ".02em" }}>
            Loading course...
          </p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const completedCount = completed.size;
  const totalCount = videos.length;
  const pct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const activeIsDone = activeVideo ? completed.has(activeVideo.video_id) : false;
  const activeIdx = videos.findIndex((v) => v.video_id === activeVideo?.video_id);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#08080f",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        backgroundImage:
          "radial-gradient(ellipse 70% 40% at 50% -10%, rgba(124,58,237,.10), transparent)",
      }}
    >
      {/* Ambient glow orbs */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed", top: "-15%", left: "8%", width: 460, height: 460,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,.07) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0, animation: "orbFloat 9s ease-in-out infinite",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "fixed", bottom: "-12%", right: "4%", width: 380, height: 380,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,.06) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0, animation: "orbFloat 11s ease-in-out infinite reverse",
        }}
      />

      {/* Header */}
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 22px",
          background: "rgba(10,10,18,.85)",
          borderBottom: "1px solid rgba(255,255,255,.07)",
          backdropFilter: "blur(14px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
          <button
            onClick={() => router.push("/coursify")}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 13, color: "rgba(255,255,255,.45)",
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "inherit", padding: "6px 10px", borderRadius: 8,
              transition: "all .18s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#c4b5fd";
              e.currentTarget.style.background = "rgba(124,58,237,.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,.45)";
              e.currentTarget.style.background = "none";
            }}
          >
            <ArrowLeft size={14} /> Coursify
          </button>
          <span
            style={{
              fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,.85)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 320,
            }}
          >
            {course?.title}
          </span>
        </div>
        <span
          style={{
            fontSize: 12, fontWeight: 600, color: "#a78bfa",
            background: "rgba(124,58,237,.12)", border: "1px solid rgba(124,58,237,.3)",
            borderRadius: 20, padding: "5px 12px", flexShrink: 0,
          }}
        >
          {completedCount}/{totalCount} · {pct}%
        </span>
      </motion.div>

      <div style={{ position: "relative", zIndex: 1, display: "flex", height: "calc(100vh - 53px)" }}>

        {/* Video Player */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <AnimatePresence mode="wait">
            {activeVideo && (
              <motion.div
                key={activeVideo.video_id}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  style={{
                    position: "relative", width: "100%", paddingTop: "56.25%",
                    background: "#000",
                    boxShadow: "0 0 60px rgba(124,58,237,.12)",
                  }}
                >
                  <iframe
                    src={`https://www.youtube.com/embed/${activeVideo.video_id}?autoplay=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&list=${course?.playlist_id}`}
                    title={activeVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                  />
                </div>

                {/* Controls */}
                <div style={{ padding: "20px 24px 28px" }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 4, lineHeight: 1.3 }}>
                    {activeVideo.title}
                  </h2>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginBottom: 18 }}>
                    Video {activeIdx + 1} of {totalCount}
                  </p>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <motion.button
                      whileHover={{ scale: activeIsDone ? 1 : 1.03 }}
                      whileTap={{ scale: activeIsDone ? 1 : 0.96 }}
                      onClick={() => markComplete(activeVideo)}
                      disabled={activeIsDone}
                      style={{
                        display: "flex", alignItems: "center", gap: 7,
                        fontSize: 13, fontWeight: 700, padding: "10px 18px",
                        borderRadius: 11, border: "none", fontFamily: "inherit",
                        cursor: activeIsDone ? "default" : "pointer",
                        color: activeIsDone ? "#86efac" : "#fff",
                        background: activeIsDone
                          ? "rgba(134,239,172,.12)"
                          : "linear-gradient(135deg,#7c3aed,#5b21b6)",
                        boxShadow: activeIsDone ? "none" : "0 4px 18px rgba(124,58,237,.45)",
                        transition: "box-shadow .2s",
                      }}
                      onMouseEnter={(e) => {
                        if (!activeIsDone) e.currentTarget.style.boxShadow = "0 6px 24px rgba(124,58,237,.65)";
                      }}
                      onMouseLeave={(e) => {
                        if (!activeIsDone) e.currentTarget.style.boxShadow = "0 4px 18px rgba(124,58,237,.45)";
                      }}
                    >
                      {activeIsDone ? <CheckCircle2 size={15} /> : null}
                      {activeIsDone ? "Completed" : "Mark as complete"}
                    </motion.button>

                    {activeIdx < videos.length - 1 && (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => { markComplete(activeVideo); goNext(); }}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          fontSize: 13, fontWeight: 700, padding: "10px 18px",
                          borderRadius: 11, fontFamily: "inherit", cursor: "pointer",
                          color: "rgba(255,255,255,.85)",
                          background: "rgba(255,255,255,.06)",
                          border: "1px solid rgba(255,255,255,.1)",
                          transition: "all .2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,.1)";
                          e.currentTarget.style.borderColor = "rgba(255,255,255,.2)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,.06)";
                          e.currentTarget.style.borderColor = "rgba(255,255,255,.1)";
                        }}
                      >
                        Next <ChevronRight size={14} />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <motion.div
          initial={{ x: 24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: 320, flexShrink: 0, overflowY: "auto",
            background: "rgba(255,255,255,.025)",
            borderLeft: "1px solid rgba(255,255,255,.07)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div style={{ padding: "18px 18px 16px", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
            <p style={{ fontSize: 11.5, color: "rgba(255,255,255,.4)", marginBottom: 9, textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 600 }}>
              Course progress
            </p>
            <div style={{ height: 6, background: "rgba(255,255,255,.06)", borderRadius: 4, overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  height: "100%", borderRadius: 4,
                  background: "linear-gradient(90deg,#a78bfa,#818cf8)",
                  boxShadow: "0 0 10px rgba(167,139,250,.6)",
                }}
              />
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginTop: 8 }}>{pct}% complete</p>
          </div>

          <div style={{ padding: 8 }}>
            {videos.map((video, i) => {
              const isActive = activeVideo?.video_id === video.video_id;
              const isDone = completed.has(video.video_id);
              return (
                <motion.button
                  key={video.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.25 }}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => switchVideo(video)}
                  style={{
                    width: "100%", display: "flex", alignItems: "flex-start", gap: 12,
                    padding: "10px 11px", borderRadius: 12, textAlign: "left",
                    marginBottom: 4, border: "1px solid transparent",
                    cursor: "pointer", fontFamily: "inherit",
                    background: isActive ? "rgba(124,58,237,.14)" : "transparent",
                    borderColor: isActive ? "rgba(124,58,237,.4)" : "transparent",
                    boxShadow: isActive ? "0 0 18px rgba(124,58,237,.18)" : "none",
                    transition: "background .2s, border-color .2s, box-shadow .2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,.05)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div style={{ position: "relative", flexShrink: 0, width: 80, height: 48, borderRadius: 7, overflow: "hidden" }}>
                    <img
                      src={video.thumbnail || `https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    {isDone && (
                      <div
                        style={{
                          position: "absolute", inset: 0,
                          background: "rgba(16,40,24,.72)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <CheckCircle2 size={18} style={{ color: "#86efac" }} />
                      </div>
                    )}
                    {isActive && (
                      <div
                        style={{
                          position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
                          background: "linear-gradient(180deg,#a78bfa,#818cf8)",
                        }}
                      />
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: 12.5, lineHeight: 1.4, margin: 0,
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                      color: isActive ? "#fff" : "rgba(255,255,255,.55)",
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {i + 1}. {video.title}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes orbFloat {
          0%,100% { transform: translateY(0px) scale(1);   }
          50%      { transform: translateY(26px) scale(1.04); }
        }
      `}</style>
    </div>
  );
}