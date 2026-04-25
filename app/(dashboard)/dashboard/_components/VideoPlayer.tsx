"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Lock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  isFirstViewing: boolean;
  onVideoProgress: (progress: number) => void;
  onVideoComplete: () => void;
}

export default function VideoPlayer({
  videoUrl,
  isFirstViewing,
  onVideoProgress,
  onVideoComplete,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Reset player state when URL changes
  useEffect(() => {
    setError(null);
    setCurrentTime(0);
    setDuration(0);
    setPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    console.log("VideoPlayer: URL changed to:", videoUrl);
  }, [videoUrl]);

  // Handle play/pause
  useEffect(() => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.play().catch((e) => {
        console.error("Play error:", e);
        setError("Could not play video");
      });
    } else {
      videoRef.current.pause();
    }
  }, [playing]);

  // Handle volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    const progress = videoRef.current.duration
      ? videoRef.current.currentTime / videoRef.current.duration
      : 0;
    onVideoProgress(progress);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      console.log("Video loaded. Duration:", videoRef.current.duration);
    }
  };

  const handleEnded = () => {
    setPlaying(false);
    onVideoComplete();
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
    <div className="w-full bg-slate-900 rounded-2xl overflow-hidden shadow-lg">
      <div className="relative bg-black aspect-video flex items-center justify-center">
        {videoUrl ? (
          <>
            {error && (
              <div className="absolute inset-0 bg-red-900/40 border border-red-500 rounded-lg flex items-center justify-center z-20">
                <div className="text-center text-white px-4">
                  <p className="font-semibold">❌ Video Error</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            )}
            <video
              ref={videoRef}
              src={videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleEnded}
              onError={(e) => {
                console.error("Video error:", e);
                setError("Failed to load video. Check the file format.");
              }}
              className="w-full h-full"
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
            <p className="text-sm font-bold uppercase">No video available</p>
          </div>
        )}

        {isFirstViewing && (
          <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-lg flex items-center gap-2 text-xs font-bold z-10 shadow-md">
            <Lock size={14} /> Seeking Locked
          </div>
        )}
      </div>

      <div className="bg-slate-800 p-4 space-y-3">
        {/* Progress Bar */}
        <div
          onClick={(e) => {
            if (!duration) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            handleSeek(percent * duration);
          }}
          className="h-1.5 bg-slate-700 rounded-full cursor-pointer group hover:h-2 transition-all"
        >
          <div
            className="h-full bg-[#00ADEF] rounded-full transition-all relative"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPlaying(!playing)}
              className="p-2 hover:bg-slate-700 rounded-lg text-white"
            >
              {playing ? <Pause size={20} /> : <Play size={20} fill="white" />}
            </button>
            <button
              onClick={() => handleSeek(Math.max(0, currentTime - 10))}
              className="p-2 hover:bg-slate-700 rounded-lg text-white flex items-center gap-1"
            >
              <ChevronLeft size={18} /> <span className="text-xs font-bold">10s</span>
            </button>
            <button
              onClick={() => handleSeek(Math.min(duration, currentTime + 10))}
              disabled={isFirstViewing}
              className={`p-2 rounded-lg flex items-center gap-1 ${
                isFirstViewing ? "text-slate-500" : "text-white hover:bg-slate-700"
              }`}
            >
              <ChevronRight size={18} /> <span className="text-xs font-bold">10s</span>
            </button>
          </div>

          <div className="text-white text-xs font-mono bg-slate-900/50 px-2 py-1 rounded">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-lg">
            <button
              onClick={() => setMuted(!muted)}
              className="text-white hover:text-[#00ADEF]"
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => {
                const vol = parseFloat(e.target.value);
                setVolume(vol);
                if (vol > 0) setMuted(false);
              }}
              className="w-16 h-1 bg-slate-600 rounded-full accent-[#00ADEF] cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
