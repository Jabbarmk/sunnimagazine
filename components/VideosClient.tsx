"use client";

import { useState, useEffect } from "react";
import type { Video, VideoCategory } from "@/lib/store";
import { Play, X } from "@/components/Icons";

function extractYouTubeId(link: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&\s?]+)/,
    /youtu\.be\/([^&\s?]+)/,
    /youtube\.com\/shorts\/([^&\s?/]+)/,
    /youtube\.com\/embed\/([^&\s?/]+)/,
  ];
  for (const p of patterns) {
    const m = link.match(p);
    if (m) return m[1];
  }
  return null;
}

function getYouTubeThumb(link: string): string | null {
  const id = extractYouTubeId(link);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

function getEmbedUrl(link: string): string {
  const id = extractYouTubeId(link);
  if (id) return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
  return link;
}

function VideoThumb({ src, caption }: { src: string; caption: string }) {
  const [frame, setFrame] = useState<string | null>(null);

  useEffect(() => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.src = src;

    const onMetadata = () => { video.currentTime = 0.1; };
    const onSeeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 568;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          setFrame(canvas.toDataURL("image/jpeg", 0.85));
        }
      } catch {
        // CORS blocked — fall back to caption placeholder
      }
      video.removeEventListener("loadedmetadata", onMetadata);
      video.removeEventListener("seeked", onSeeked);
    };

    video.addEventListener("loadedmetadata", onMetadata);
    video.addEventListener("seeked", onSeeked);
    video.load();

    return () => {
      video.removeEventListener("loadedmetadata", onMetadata);
      video.removeEventListener("seeked", onSeeked);
      video.src = "";
    };
  }, [src]);

  if (frame) {
    return (
      <div className="relative w-full aspect-[9/16]">
        <img src={frame} alt={caption} className="w-full h-full object-cover block" />
      </div>
    );
  }

  return (
    <div className="w-full aspect-[9/16] bg-ink/80 flex flex-col items-center justify-center gap-3 px-3">
      <span className="text-white opacity-70"><Play size={32} /></span>
      {caption && (
        <p className="text-white text-[12px] font-medium text-center leading-snug line-clamp-4">{caption}</p>
      )}
    </div>
  );
}

export default function VideosClient({ videos, categories }: { videos: Video[]; categories: VideoCategory[] }) {
  const [activeTab, setActiveTab] = useState("All");
  const [playing, setPlaying] = useState<Video | null>(null);

  const tabs = ["All", ...categories.map((c) => c.name)];
  const filtered = activeTab === "All" ? videos : videos.filter((v) => v.categoryName === activeTab);

  return (
    <>
      {categories.length > 0 && (
        <div className="flex gap-5 overflow-x-auto no-scrollbar px-5 pb-2 border-b border-line mb-5">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`pb-3 text-[13px] whitespace-nowrap border-b-2 -mb-px transition-colors ${
                activeTab === t ? "border-gold text-ink font-medium" : "border-transparent text-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <p className="text-[13px] text-muted">No videos yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 pb-6">
          {filtered.map((v) => {
            const ytThumb = getYouTubeThumb(v.link);
            const isYouTube = !!ytThumb;
            return (
              <button key={v.id} onClick={() => setPlaying(v)} className="text-left group">
                <div className="relative rounded-xl overflow-hidden bg-gray-100">
                  {isYouTube ? (
                    <img src={ytThumb} alt={v.caption} className="w-full aspect-[9/16] object-cover block" />
                  ) : (
                    <VideoThumb src={v.link} caption={v.caption} />
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-float">
                      <Play size={16} />
                    </div>
                  </div>
                </div>
                <div className="mt-2 px-0.5">
                  {v.categoryName && (
                    <div className="text-[9px] tracking-[0.2em] text-gold uppercase mb-0.5">{v.categoryName}</div>
                  )}
                  {v.caption && (
                    <div className="font-serif text-[13px] text-ink leading-snug line-clamp-2">{v.caption}</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {playing && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex flex-col items-center justify-center"
          onClick={() => setPlaying(null)}
        >
          <button
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white"
            onClick={() => setPlaying(null)}
          >
            <X size={20} />
          </button>
          {playing.caption && (
            <p className="text-white text-[14px] font-medium mb-3 px-6 text-center line-clamp-2">{playing.caption}</p>
          )}
          <div
            className="px-6"
            style={{ width: "min(360px, 85vw)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: "9/16" }}>
              {extractYouTubeId(playing.link) ? (
                <iframe
                  src={getEmbedUrl(playing.link)}
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : (
                <video
                  src={playing.link}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
