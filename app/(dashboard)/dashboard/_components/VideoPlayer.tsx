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
  Maximize,
  Minimize,
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    setError(null);
    setCurrentTime(0);
    setDuration(0);
    setPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [videoUrl]);

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

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    const progress = videoRef.current.duration ? videoRef.current.currentTime / videoRef.current.duration : 0;
    onVideoProgress(progress);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
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

  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseMove = () => {
    if (!isFullscreen) return;
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) {
        setShowControls(false);
      }
    }, 3000);
  };

  return (
    <div 
      ref={containerRef} 
      className={`w-full bg-slate-900 overflow-hidden shadow-2xl transition-all ${
        isFullscreen ? "rounded-0" : "rounded-xl md:rounded-[2rem]"
      }`}
      onMouseMove={handleMouseMove}
    >
      {/* Video Container: Maintains aspect ratio on all devices */}
      <div className="relative bg-black aspect-video flex items-center justify-center group">
        {videoUrl ? (
          <>
            {error && (
              <div className="absolute inset-0 bg-red-900/60 border border-red-500 flex items-center justify-center z-20">
                <div className="text-center text-white px-6">
                  <p className="font-bold uppercase tracking-tight text-sm md:text-base">Video Error</p>
                  <p className="text-[10px] md:text-xs mt-1 opacity-70">{error}</p>
                </div>
              </div>
            )}
            <video
              ref={videoRef}
              src={videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleEnded}
              onClick={() => setPlaying(!playing)}
              onError={() => setError("Failed to load video source.")}
              className="w-full h-full cursor-pointer"
              playsInline
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
            <p className="text-[10px] md:text-xs font-black uppercase tracking-widest">Source Missing</p>
          </div>
        )}

        {/* LOCKED BADGE - Always pinned top-right, scales for tablet */}
        {isFirstViewing && (
          <div className="absolute top-3 right-3 md:top-5 md:right-5 lg:top-8 lg:right-8 z-30 pointer-events-none">
            <div className="bg-[#00ADEF]/90 backdrop-blur-md text-white px-3 py-1.5 md:px-5 md:py-2.5 rounded-full flex items-center gap-2 text-[9px] md:text-[11px] font-black shadow-2xl border border-white/20 uppercase tracking-widest animate-in fade-in slide-in-from-top-2 duration-300">
              <Lock size={12} strokeWidth={3} className="md:w-4 md:h-4" />
              <span>Seeking Locked</span>
            </div>
          </div>
        )}

        {/* Control Bar - Overlays video in fullscreen, positioned below in normal mode */}
        <div className={`${
          isFullscreen 
            ? "absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent transition-opacity duration-300"
            : "hidden"
        }`}
          style={{
            opacity: isFullscreen && !showControls ? 0 : 1,
            pointerEvents: isFullscreen && !showControls ? 'none' : 'auto',
          }}
        >
          <div className="p-6 lg:p-8 space-y-4 lg:space-y-6">
            
            {/* Progress Bar with Enhanced Hit-Area */}
            <div
              onClick={(e) => {
                if (!duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                handleSeek(percent * duration);
              }}
              className="relative h-6 flex items-center cursor-pointer group"
            >
              <div className="w-full h-1.5 md:h-2 bg-slate-700/50 rounded-full overflow-hidden">
                 <div
                   className="h-full bg-[#00ADEF] rounded-full transition-all"
                   style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                 />
              </div>
              {/* Thumb: Visible on tablet/desktop for precision */}
              <div 
                className="absolute h-4 w-4 md:h-5 md:w-5 bg-white rounded-full border-2 border-[#00ADEF] shadow-lg transition-transform scale-110 md:scale-100 group-hover:scale-125"
                style={{ 
                  left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                  transform: 'translateX(-50%)'
                }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
              {/* Left: Play/Skip Controls - Larger for Tablet Fingers */}
              <div className="flex items-center gap-1.5 md:gap-4">
                <button
                  onClick={() => setPlaying(!playing)}
                  className="p-2 md:p-4 hover:bg-slate-700 rounded-2xl text-white transition-all active:scale-90"
                >
                  {playing ? <Pause size={24} className="md:w-8 md:h-8" /> : <Play size={24} className="md:w-8 md:h-8" fill="white" />}
                </button>
                
                <div className="flex items-center gap-1 md:gap-2">
                  <button
                    onClick={() => handleSeek(Math.max(0, currentTime - 10))}
                    className="p-2 md:p-3 hover:bg-slate-700 rounded-xl text-white flex items-center gap-1.5 transition-colors"
                  >
                    <ChevronLeft size={20} /> 
                    <span className="text-[10px] md:text-xs font-black">10S</span>
                  </button>
                  
                  <button
                    onClick={() => handleSeek(Math.min(duration, currentTime + 10))}
                    disabled={isFirstViewing}
                    className={`p-2 md:p-3 rounded-xl flex items-center gap-1.5 transition-colors ${
                      isFirstViewing ? "text-slate-600 cursor-not-allowed" : "text-white hover:bg-slate-700"
                    }`}
                  >
                    <span className="text-[10px] md:text-xs font-black">10S</span>
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Right: Time, Volume, Fullscreen */}
              <div className="flex items-center gap-2 md:gap-6 lg:gap-8">
                {/* Time: Visible on Tablet (sm and up) */}
                <div className="hidden sm:block text-white text-[10px] md:text-xs lg:text-sm font-black bg-slate-900/50 px-3 py-2 md:px-4 md:py-3 rounded-xl uppercase tracking-tight">
                  {formatTime(currentTime)} <span className="text-slate-500 mx-1">/</span> {formatTime(duration)}
                </div>

                {/* Volume: Visible on Tablet (sm and up) */}
                <div className="flex items-center gap-2 md:gap-3 bg-slate-700/50 px-2.5 md:px-4 py-2 md:py-3 rounded-2xl">
                  <button onClick={() => setMuted(!muted)} className="text-white hover:text-[#00ADEF] transition-colors">
                    {muted ? <VolumeX size={20} className="md:w-6 md:h-6" /> : <Volume2 size={20} className="md:w-6 md:h-6" />}
                  </button>
                  <input
                    type="range" min={0} max={1} step={0.05}
                    value={muted ? 0 : volume}
                    onChange={(e) => {
                      const vol = parseFloat(e.target.value);
                      setVolume(vol);
                      if (vol > 0) setMuted(false);
                    }}
                    className="hidden sm:block w-16 md:w-24 lg:w-32 h-1.5 bg-slate-600 rounded-full accent-[#00ADEF] cursor-pointer"
                  />
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="p-2 md:p-4 hover:bg-slate-700 rounded-2xl text-white transition-all active:scale-95"
                >
                  {isFullscreen ? <Minimize size={22} className="md:w-7 md:h-7" /> : <Maximize size={22} className="md:w-7 md:h-7" />}
                </button>
              </div>
            </div>
            
            {/* Mobile-Only Time Rail (Hidden on Tablets) */}
            <div className="sm:hidden flex justify-between text-white text-[9px] font-black opacity-40 uppercase tracking-[0.2em] px-1">
               <span>{formatTime(currentTime)}</span>
               <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar (Normal Mode) - Below video when not fullscreen */}
      <div className={`${isFullscreen ? "hidden" : "block"} bg-slate-800 p-3 md:p-6 lg:p-8 space-y-4 md:space-y-6`}>
        
        {/* Progress Bar with Enhanced Hit-Area */}
        <div
          onClick={(e) => {
            if (!duration) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            handleSeek(percent * duration);
          }}
          className="relative h-6 flex items-center cursor-pointer group"
        >
          <div className="w-full h-1.5 md:h-2 bg-slate-700/50 rounded-full overflow-hidden">
             <div
               className="h-full bg-[#00ADEF] rounded-full transition-all"
               style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
             />
          </div>
          {/* Thumb: Visible on tablet/desktop for precision */}
          <div 
            className="absolute h-4 w-4 md:h-5 md:w-5 bg-white rounded-full border-2 border-[#00ADEF] shadow-lg transition-transform scale-110 md:scale-100 group-hover:scale-125"
            style={{ 
              left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
              transform: 'translateX(-50%)'
            }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
          {/* Left: Play/Skip Controls - Larger for Tablet Fingers */}
          <div className="flex items-center gap-1.5 md:gap-4">
            <button
              onClick={() => setPlaying(!playing)}
              className="p-2 md:p-4 hover:bg-slate-700 rounded-2xl text-white transition-all active:scale-90"
            >
              {playing ? <Pause size={24} className="md:w-8 md:h-8" /> : <Play size={24} className="md:w-8 md:h-8" fill="white" />}
            </button>
            
            <div className="flex items-center gap-1 md:gap-2">
              <button
                onClick={() => handleSeek(Math.max(0, currentTime - 10))}
                className="p-2 md:p-3 hover:bg-slate-700 rounded-xl text-white flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft size={20} /> 
                <span className="text-[10px] md:text-xs font-black">10S</span>
              </button>
              
              <button
                onClick={() => handleSeek(Math.min(duration, currentTime + 10))}
                disabled={isFirstViewing}
                className={`p-2 md:p-3 rounded-xl flex items-center gap-1.5 transition-colors ${
                  isFirstViewing ? "text-slate-600 cursor-not-allowed" : "text-white hover:bg-slate-700"
                }`}
              >
                <span className="text-[10px] md:text-xs font-black">10S</span>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Right: Time, Volume, Fullscreen */}
          <div className="flex items-center gap-2 md:gap-6 lg:gap-8">
            {/* Time: Visible on Tablet (sm and up) */}
            <div className="hidden sm:block text-white text-[10px] md:text-xs lg:text-sm font-black bg-slate-900/50 px-3 py-2 md:px-4 md:py-3 rounded-xl uppercase tracking-tight">
              {formatTime(currentTime)} <span className="text-slate-500 mx-1">/</span> {formatTime(duration)}
            </div>

            {/* Volume: Visible on Tablet (sm and up) */}
            <div className="flex items-center gap-2 md:gap-3 bg-slate-700/50 px-2.5 md:px-4 py-2 md:py-3 rounded-2xl">
              <button onClick={() => setMuted(!muted)} className="text-white hover:text-[#00ADEF] transition-colors">
                {muted ? <VolumeX size={20} className="md:w-6 md:h-6" /> : <Volume2 size={20} className="md:w-6 md:h-6" />}
              </button>
              <input
                type="range" min={0} max={1} step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  const vol = parseFloat(e.target.value);
                  setVolume(vol);
                  if (vol > 0) setMuted(false);
                }}
                className="hidden sm:block w-16 md:w-24 lg:w-32 h-1.5 bg-slate-600 rounded-full accent-[#00ADEF] cursor-pointer"
              />
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-2 md:p-4 hover:bg-slate-700 rounded-2xl text-white transition-all active:scale-95"
            >
              {isFullscreen ? <Minimize size={22} className="md:w-7 md:h-7" /> : <Maximize size={22} className="md:w-7 md:h-7" />}
            </button>
          </div>
        </div>
        
        {/* Mobile-Only Time Rail (Hidden on Tablets) */}
        <div className="sm:hidden flex justify-between text-white text-[9px] font-black opacity-40 uppercase tracking-[0.2em] px-1">
           <span>{formatTime(currentTime)}</span>
           <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}