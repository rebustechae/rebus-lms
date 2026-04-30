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
  muted?: boolean; // NEW
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

  // Sync state with props
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

  // Toggle Fullscreen logic
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error enabling fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () =>
      setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
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

  // Volume logic
  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  // Speed logic
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  // Captions Logic
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
    const progress = videoRef.current.duration
      ? videoRef.current.currentTime / videoRef.current.duration
      : 0;
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
        isFullscreen ? "rounded-0" : "rounded-xl md:rounded-[2rem] aspect-video"
      }`}
      style={
        {
          "--webkit-text-size-adjust": "100%",
          "--cue-bottom": showControls ? "85px" : "25px",
        } as React.CSSProperties
      }
    >
      <style>{`
        video::cue {
          background: rgba(0, 0, 0, 0.7);
          color: white;
          font-family: sans-serif;
          font-size: 14px;
          bottom: var(--cue-bottom); 
          transition: bottom 0.3s ease-in-out;
        }
      `}</style>

      <video
        ref={videoRef}
        src={videoUrl}
        muted={muted}
        crossOrigin="anonymous"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onEnded={() => {
          setPlaying(false);
          onVideoComplete(); // Parent page handles exitFullscreen and scroll
        }}
        onClick={() => setPlaying(!playing)}
        onError={(e) => {
          console.error("Video error:", e);
          setError("Failed to load video file");
        }}
        className="w-full h-full cursor-pointer"
        playsInline
      >
        {captionsUrl && (
          <track
            kind="captions"
            src={captionsUrl}
            srcLang="en"
            label="English"
            default={captionsEnabled}
          />
        )}
      </video>

      {/* Large Center Play Button Overlay */}
      {!playing && !error && (
        <div
          className="absolute inset-0 flex items-center justify-center z-20 group/play"
          onClick={() => setPlaying(true)}
        >
          <button
            className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white transition-all duration-300 group-hover/play:scale-110 group-hover/play:bg-white/20 shadow-2xl"
            aria-label="Play Video"
          >
            <Play size={40} fill="white" className="ml-1.5" />
          </button>
        </div>
      )}

      {/* Locked Badge */}
      {isFirstViewing && (
        <div className="absolute top-4 right-4 z-30 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-white/10 shadow-xl">
            <Lock size={12} className="text-[#00ADEF]" />
            <span>Seeking Locked</span>
          </div>
        </div>
      )}

      {/* --- CONTROL BAR --- */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Progress Bar */}
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            handleSeek(percent * duration);
          }}
          className="relative h-1.5 w-full bg-white/20 cursor-pointer group/rail"
        >
          <div className="h-full bg-white/40 absolute top-0 left-0 w-full" />
          <div
            className="h-full bg-white absolute top-0 left-0 transition-all"
            style={{
              width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
            }}
          />
          <div
            className="absolute h-3 w-3 bg-white rounded-full top-1/2 -translate-y-1/2 opacity-0 group-hover/rail:opacity-100 transition-opacity shadow-lg"
            style={{
              left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={() => setPlaying(!playing)} className="text-white">
              {playing ? (
                <Pause size={24} fill="white" />
              ) : (
                <Play size={24} fill="white" />
              )}
            </button>

            <div className="flex items-center gap-3 md:gap-5">
              <button
                onClick={() => handleSeek(currentTime - 10)}
                className="relative text-white"
              >
                <RotateCcw size={22} />
                <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold mt-0.5">
                  10
                </span>
              </button>

              <button
                onClick={() => handleSeek(currentTime + 10)}
                disabled={isFirstViewing}
                className={`relative ${isFirstViewing ? "opacity-30" : "text-white"}`}
              >
                <RotateCw size={22} />
                <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold mt-0.5">
                  10
                </span>
              </button>
            </div>

            <div className="text-white text-xs md:text-sm font-medium">
              {formatTime(currentTime)}{" "}
              <span className="mx-0.5 opacity-60">/</span>{" "}
              {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {/* SPEED CONTROL */}
            <div className="relative group/speed flex items-center justify-center">
              <button className="text-white flex items-center gap-1.5 text-sm font-semibold">
                <Gauge size={20} />
                {playbackSpeed}x
              </button>
              <div className="absolute bottom-full mb-3 right-0 bg-black/90 backdrop-blur-md rounded-lg border border-white/10 overflow-hidden opacity-0 invisible group-hover/speed:opacity-100 group-hover/speed:visible transition-all duration-200 z-50">
                {[0.75, 1, 1.25].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`w-full px-4 py-2 text-sm text-left font-medium transition-colors whitespace-nowrap ${
                      playbackSpeed === speed
                        ? "bg-white/20 text-white"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* CAPTIONS TOGGLE */}
            {captionsUrl && (
              <button
                onClick={() => setCaptionsEnabled(!captionsEnabled)}
                className={`transition-colors ${captionsEnabled ? "text-white" : "text-white/60 hover:text-white"}`}
                title="Toggle captions"
              >
                <Captions size={22} fill={captionsEnabled ? "white" : "none"} />
              </button>
            )}

            {/* VOLUME CONTROL */}
            <div className="relative group/vol flex items-center justify-center">
              <div className="absolute bottom-full mb-4 px-2 py-4 bg-black/80 backdrop-blur-md rounded-full border border-white/10 opacity-0 invisible group-hover/vol:opacity-100 group-hover/vol:visible transition-all duration-200">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    setMuted(false);
                  }}
                  className="h-24 w-1 accent-white appearance-none bg-white/20 rounded-full cursor-pointer vertical-slider"
                />
              </div>
              <button onClick={() => setMuted(!muted)} className="text-white">
                {muted || volume === 0 ? (
                  <VolumeX size={22} />
                ) : (
                  <Volume2 size={22} />
                )}
              </button>
            </div>

            <button onClick={toggleFullscreen} className="text-white">
              {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
            </button>
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
