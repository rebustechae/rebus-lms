"use client";

import { useRef, useState, useEffect } from "react";
import { Download, Loader2 } from "lucide-react";

interface CertificateGeneratorProps {
  baseImageUrl: string; 
  userName: string;
  designation: string;
  courseName: string; 
  completionDate: string; 
}

export default function CertificateGenerator({
  baseImageUrl,
  userName,
  designation,
  courseName,
  completionDate,
}: CertificateGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous"; 
    img.src = baseImageUrl;

    img.onload = () => {
      if (!isMounted) return;

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const drawText = (text: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "center") => {
        ctx.font = font;
        ctx.textAlign = align;
        ctx.textBaseline = "middle";
        ctx.shadowBlur = 0;
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
      };

      // 1. User Name
      drawText(
        userName, 
        canvas.width / 2, 
        canvas.height * 0.49, // Slighly moved up from 0.48 to make room
        "bold 76px 'Times New Roman', serif", 
        "#1e3a8a"
      );

      // --- NEW: Designation ---
      // Positioned right under the name, but above the blue line
      if (designation) {
        drawText(
          designation.toUpperCase(), 
          canvas.width / 2, 
          canvas.height * 0.54, 
          "bold 26px sans-serif", 
          "#64748b" // Subtle slate gray
        );
      }
      
      // 2. Course Name (Coordinates preserved)
      drawText(
        courseName, 
        canvas.width * 0.66, 
        canvas.height * 0.643, 
        "bold 36px sans-serif", 
        "#111827",
        "center"
      );
      
      // 3. Completion Date (Coordinates preserved)
      drawText(
        completionDate, 
        canvas.width * 0.48, 
        canvas.height * 0.785, 
        "bold 28px sans-serif", 
        "#1e3a8a",
        "left"
      );

      setFinalImageUrl(canvas.toDataURL("image/png"));
      setLoading(false);
    };

    img.onerror = () => {
      if (!isMounted) return;
      setError("Could not load certificate template.");
      setLoading(false);
    };

    return () => { isMounted = false; };
  }, [userName, courseName, completionDate, baseImageUrl]);

  const handleDownload = () => {
    if (!finalImageUrl) return;
    const link = document.createElement("a");
    link.href = finalImageUrl;
    link.download = `Certificate_${userName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) return <div className="text-center p-4 bg-rose-50 text-rose-600 text-xs font-bold uppercase">{error}</div>;

  return (
    <div className="w-full space-y-6">
      <div className="relative w-full max-w-[600px] mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-20">
            <Loader2 className="animate-spin text-[#00ADEF]" size={32} />
            <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase">Generating...</p>
          </div>
        )}

        {finalImageUrl && (
          <img src={finalImageUrl} alt="Certificate Preview" className="w-full h-auto" />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <button 
        onClick={handleDownload}
        disabled={loading || !finalImageUrl}
        className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 text-white
          ${loading || !finalImageUrl ? "bg-slate-200" : "bg-[#00ADEF] hover:brightness-110 active:scale-95"}`}
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
        Download Certificate
      </button>
    </div>
  );
}