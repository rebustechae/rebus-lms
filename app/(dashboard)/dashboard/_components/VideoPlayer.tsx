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

  // Toggle Fullscreen logic with Orientation Lock
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        
        // Attempt to lock orientation to landscape on mobile devices
        if (window.screen.orientation && "lock" in window.screen.orientation) {
          await (window.screen.orientation as any).lock("landscape").catch(() => {
            // Some browsers/devices might block this; we fall back to CSS rotation
            console.log("Orientation lock blocked by device.");
          });
        }
      } else {
        if (window.screen.orientation && "unlock" in window.screen.orientation) {
          window.screen.orientation.unlock();
        }
        await document.exitFullscreen();
      }
    } catch (err: any) {
      console.error(`Error handling fullscreen: ${err.message}`);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Play/Pause logic
  useEffect(() => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.play().catch((e) => {
        if (e.name !== "AbortError") setError("Could not play video");
      });
    } else {
      videoRef.current.pause();
    }
  }, [playing]);

  // Volume & Speed & Captions Logic (remains unchanged)
  useEffect(() => { if (videoRef.current) videoRef.current.volume = muted ? 0 : volume; }, [volume, muted]);
  useEffect(() => { if (videoRef.current) videoRef.current.playbackRate = playbackSpeed; }, [playbackSpeed]);
  useEffect(() => {
    if (videoRef.current) {
      const tracks = videoRef.current.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        if (tracks[i].kind === "captions") {
          tracks[i].mode = captionsEnabled ? "showing" : "hidden";
        }
      }
    }
  }, [captionsEnabled]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    const progress = videoRef.current.duration ? videoRef.current.currentTime / videoRef.current.duration : 0;
    onVideoProgress?.(progress);
  };

  const handleSeek = (newTime: number) => {
    if (isFirstViewing && newTime > currentTime) return;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
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
        isFullscreen ? "fixed inset-0 z-[9999] rounded-0" : "rounded-xl md:rounded-[2rem] aspect-video"
      }`}
      style={{
        "--webkit-text-size-adjust": "100%",
        "--cue-bottom": showControls ? "85px" : "25px",
        "maskImage": "radial-gradient(white, black)", 
        "WebkitMaskImage": "-webkit-radial-gradient(white, black)"
      } as React.CSSProperties}
    >
      {/* CSS Forcing Landscape in Fullscreen Portrait */}
      <style jsx global>{`
        @media (max-width: 768px) and (orientation: portrait) {
          .fullscreen-forced-landscape {
            width: 100vh !important;
            height: 100vw !important;
            transform: rotate(90deg);
            transform-origin: center;
            position: fixed;
            top: 50%;
            left: 50%;
            translate: -50% -50%;
          }
        }
        video::cue {
          background: rgba(0, 0, 0, 0.7);
          color: white;
          font-family: sans-serif;
          font-size: 14px;
          bottom: var(--cue-bottom); 
          transition: bottom 0.3s ease-in-out;
        }
      `}</style>

      <div className={`w-full h-full ${isFullscreen ? 'fullscreen-forced-landscape' : ''}`}>
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
          onError={(e) => {
            console.error("Video error:", e);
            setError("Failed to load video file");
          }}
          className="w-full h-full cursor-pointer object-cover"
          playsInline
        >
          {captionsUrl && (
            <track kind="captions" src={captionsUrl} srcLang="en" label="English" default={captionsEnabled} />
          )}
        </video>

        {/* Overlays and Controls (unchanged) */}
        {!playing && !error && (
          <div className="absolute inset-0 flex items-center justify-center z-20 group/play" onClick={() => setPlaying(true)}>
            <button className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white transition-all duration-300 group-hover/play:scale-110 group-hover/play:bg-white/20 shadow-2xl">
              <Play size={40} fill="white" className="ml-1.5" />
            </button>
          </div>
        )}

        {isFirstViewing && (
          <div className="absolute top-4 right-4 z-30 pointer-events-none">
            <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-white/10 shadow-xl">
              <Lock size={12} className="text-[#00ADEF]" />
              <span>Seeking Locked</span>
            </div>
          </div>
        )}

        <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              handleSeek(percent * duration);
            }}
            className="relative h-1.5 w-full bg-white/20 cursor-pointer group/rail"
          >
            <div className="h-full bg-white/40 absolute top-0 left-0 w-full" />
            <div className="h-full bg-white absolute top-0 left-0 transition-all" style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }} />
          </div>

          <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
            <div className="flex items-center gap-4 md:gap-6">
              <button onClick={() => setPlaying(!playing)} className="text-white">
                {playing ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
              </button>
              <div className="text-white text-xs md:text-sm font-medium">
                {formatTime(currentTime)} <span className="mx-0.5 opacity-60">/</span> {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
              <button onClick={toggleFullscreen} className="text-white">
                {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .vertical-slider {
          -webkit-appearance: slider-vertical;
          width: 4px;
          height: 100px;
        }
      `}</style>
    </div>
  );
}