"use client";

import { useState, useEffect } from "react";
import { getVideos, getVideoCategories } from "@/lib/api";
import type { Video, VideoCategory } from "@/lib/store";
import { LogoBar } from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
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

function getThumb(link: string): string | null {
  const id = extractYouTubeId(link);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

function getEmbedUrl(link: string): string {
  const id = extractYouTubeId(link);
  if (id) return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
  return link;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [cats, setCats] = useState<VideoCategory[]>([]);
  const [activeTab, setActiveTab] = useState("All");
  const [playing, setPlaying] = useState<Video | null>(null);

  useEffect(() => {
    getVideos().then(setVideos);
    getVideoCategories().then(setCats);
  }, []);

  const tabs = ["All", ...cats.map((c) => c.name)];
  const filtered = activeTab === "All" ? videos : videos.filter((v) => v.categoryName === activeTab);

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar bg-bg pb-16 md:pb-0">
        <LogoBar />

        <div className="px-5 mt-4 mb-4">
          <h1 className="font-serif text-[26px] text-ink leading-none">Videos</h1>
          <p className="text-[12px] text-muted mt-1.5">Films, conversations, and short cuts</p>
        </div>

        {/* Category tabs */}
        {cats.length > 0 && (
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

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <p className="text-[13px] text-muted">No videos yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 px-4 pb-6">
            {filtered.map((v) => {
              const thumb = getThumb(v.link);
              return (
                <button
                  key={v.id}
                  onClick={() => setPlaying(v)}
                  className="text-left group"
                >
                  <div className="relative rounded-xl overflow-hidden bg-gray-100">
                    {thumb ? (
                      <img src={thumb} alt={v.caption} className="w-full aspect-[9/16] object-cover block" />
                    ) : (
                      <div className="w-full aspect-[9/16] bg-ink/10 flex items-center justify-center">
                        <Play size={28} />
                      </div>
                    )}
                    {/* overlay on hover */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {/* play button */}
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
      </div>

      {/* Player popup */}
      {playing && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex flex-col items-center justify-center"
          onClick={() => setPlaying(null)}
        >
          {/* Close button */}
          <button
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white"
            onClick={() => setPlaying(null)}
          >
            <X size={20} />
          </button>

          {/* Caption */}
          {playing.caption && (
            <p className="text-white text-[14px] font-medium mb-3 px-6 text-center line-clamp-2">{playing.caption}</p>
          )}

          {/* Iframe */}
          <div
            className="px-6"
            style={{ width: "min(360px, 85vw)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: "9/16" }}>
              <iframe
                src={getEmbedUrl(playing.link)}
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </>
  );
}
