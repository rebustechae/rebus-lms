"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Lock,
  Maximize,
  Minimize,
  Captions,
  Gauge,
} from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  isFirstViewing: boolean;
  captionsUrl?: string;
  muted?: boolean;
  onVideoProgress?: (progress: number) => void;
  onVideoComplete: () => void;
}

export default function VideoPlayer({
  videoUrl,
  isFirstViewing,
  captionsUrl,
  muted: initialMuted = false,
  onVideoProgress,
  onVideoComplete,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(initialMuted);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        if (window.screen.orientation && "lock" in window.screen.orientation) {
          await (window.screen.orientation as any)
            .lock("landscape")
            .catch(() => {});
        }
      } else {
        if (
          window.screen.orientation &&
          "unlock" in window.screen.orientation
        ) {
          window.screen.orientation.unlock();
        }
        await document.exitFullscreen();
      }
    } catch (err) {
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () =>
      setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;
    playing
      ? videoRef.current.play().catch(() => {})
      : videoRef.current.pause();
  }, [playing]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    onVideoProgress?.(
      videoRef.current.currentTime / (videoRef.current.duration || 1),
    );
  };

  const handleSeek = (newTime: number) => {
    if (isFirstViewing && newTime > currentTime) return;
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(newTime, duration));
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      className={`w-full bg-black overflow-hidden shadow-2xl transition-all relative group/container ${
        isFullscreen
          ? "fixed inset-0 z-[9999] rounded-0"
          : "rounded-xl md:rounded-xl aspect-video"
      }`}
      style={
        {
          "--cue-bottom": showControls ? "100px" : "30px",
          WebkitMaskImage: "-webkit-radial-gradient(white, black)",
        } as React.CSSProperties
      }
    >
      <style jsx global>{`
        @media (max-width: 850px) and (orientation: portrait) {
          .mobile-landscape-wrapper {
            width: 100vh !important;
            height: 100vw !important;
            transform: rotate(90deg);
            transform-origin: center;
            position: absolute;
            top: 50%;
            left: 50%;
            translate: -50% -50%;
          }
        }
        video::cue {
          background: rgba(0, 0, 0, 0.7);
          bottom: var(--cue-bottom);
          transition: bottom 0.3s ease;
        }
      `}</style>

      {/* This wrapper ensures video + controls rotate together */}
      <div
        className={`relative w-full h-full flex items-center justify-center ${isFullscreen ? "mobile-landscape-wrapper" : ""}`}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          muted={muted}
          crossOrigin="anonymous"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
          onEnded={() => {
            setPlaying(false);
            onVideoComplete();
          }}
          onClick={() => setPlaying(!playing)}
          className="w-full h-full cursor-pointer object-contain bg-black"
          playsInline
        >
          {captionsUrl && (
            <track
              kind="captions"
              src={captionsUrl}
              srcLang="en"
              label="English"
            />
          )}
        </video>

        {/* Center Play Button Overlay */}
        {!playing && !error && (
          <div
            className="absolute inset-0 flex items-center justify-center z-20"
            onClick={() => setPlaying(true)}
          >
            <button className="w-20 h-20 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:scale-110 transition-transform">
              <Play size={40} fill="white" className="ml-1.5" />
            </button>
          </div>
        )}

        {/* Seeking Locked Badge */}
        {isFirstViewing && (
          <div className="absolute top-6 right-6 z-30 pointer-events-none">
            <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-white/10">
              <Lock size={12} className="text-[#00ADEF]" />
              <span>Seeking Locked</span>
            </div>
          </div>
        )}

        {/* --- CONTROL BAR --- */}
        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent p-4 md:p-6 transition-opacity duration-300 z-40 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          {/* Progress Bar */}
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              handleSeek(percent * duration);
            }}
            className="relative h-1.5 w-full bg-white/20 cursor-pointer group/rail mb-4"
          >
            <div
              className="h-full bg-white absolute top-0 left-0"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
            <div
              className="absolute h-3 w-3 bg-white rounded-full top-1/2 -translate-y-1/2 shadow-lg opacity-0 group-hover/rail:opacity-100 transition-opacity"
              style={{
                left: `${(currentTime / (duration || 1)) * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 md:gap-8">
              <button
                onClick={() => setPlaying(!playing)}
                className="text-white hover:scale-110 transition-transform"
              >
                {playing ? (
                  <Pause size={24} fill="white" />
                ) : (
                  <Play size={24} fill="white" />
                )}
              </button>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleSeek(currentTime - 10)}
                  className="relative text-white hover:opacity-80"
                >
                  <RotateCcw size={22} />
                  <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold mt-0.5">
                    10
                  </span>
                </button>
                <button
                  onClick={() => handleSeek(currentTime + 10)}
                  disabled={isFirstViewing}
                  className={`relative ${isFirstViewing ? "opacity-30" : "text-white hover:opacity-80"}`}
                >
                  <RotateCw size={22} />
                  <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold mt-0.5">
                    10
                  </span>
                </button>
              </div>

              <div className="text-white text-xs md:text-sm font-medium">
                {formatTime(currentTime)}{" "}
                <span className="mx-1 opacity-50">/</span>{" "}
                {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
              {/* SPEED */}
              <div className="relative group/speed">
                <button className="text-white flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
                  <Gauge size={20} />
                  {playbackSpeed}x
                </button>
                <div className="absolute bottom-full mb-4 right-0 bg-black/90 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden opacity-0 invisible group-hover/speed:opacity-100 group-hover/speed:visible transition-all">
                  {[0.75, 1, 1.25, 1.5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setPlaybackSpeed(s)}
                      className={`block w-full px-6 py-3 text-xs font-bold hover:bg-white/10 text-white ${playbackSpeed === s ? "bg-white/20" : ""}`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {/* VOLUME */}
              <div className="relative group/vol flex items-center">
                <button
                  onClick={() => setMuted(!muted)}
                  className="text-white hover:scale-110 transition-transform"
                >
                  {muted || volume === 0 ? (
                    <VolumeX size={22} />
                  ) : (
                    <Volume2 size={22} />
                  )}
                </button>
                <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 p-4 bg-black/90 backdrop-blur-xl rounded-full border border-white/10 opacity-0 invisible group-hover/vol:opacity-100 group-hover/vol:visible transition-all">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={muted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      setMuted(false);
                    }}
                    className="h-24 w-1 accent-white appearance-none bg-white/20 rounded-full cursor-pointer"
                    style={{ WebkitAppearance: "slider-vertical" } as any}
                  />
                </div>
              </div>

              {captionsUrl && (
                <button
                  onClick={() => setCaptionsEnabled(!captionsEnabled)}
                  className={`${captionsEnabled ? "text-[#00ADEF]" : "text-white/60"} transition-colors`}
                >
                  <Captions size={22} />
                </button>
              )}

              <button
                onClick={toggleFullscreen}
                className="text-white hover:scale-110 transition-transform"
              >
                {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
