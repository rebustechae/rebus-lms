"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ChevronLeft, Save, Loader2, Video, Upload, X, CaptionsIcon, FileText, FileDown } from "lucide-react";
import { uploadFile } from "@/utils/supabase/storage";

export default function NewLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [format, setFormat] = useState<"video" | "reading">("video");
  const [videoUrl, setVideoUrl] = useState("");
  const [captionsUrl, setCaptionsUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState(""); // NEW STATE
  const [modules, setModules] = useState<any[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState("");

  useEffect(() => {
    async function fetchModules() {
      const { data } = await supabase
        .from("modules")
        .select("id, title, order_index")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });
      if (data) {
        setModules(data);
        if (data.length > 0) setSelectedModuleId(data[0].id);
      }
    }
    fetchModules();
  }, [courseId, supabase]);

  async function handleFileUpload(file: File, type: "video" | "captions" | "pdf") {
    setUploading(true);
    // ✅ PDFs and Captions go to course-assets, Videos go to videos
    const targetBucket = type === "video" ? "videos" : "course-assets";
    const fileName = `${type}-${Date.now()}`;
    const publicUrl = await uploadFile(file, courseId, fileName, targetBucket);

    if (publicUrl) {
      if (type === "video") setVideoUrl(publicUrl);
      if (type === "captions") setCaptionsUrl(publicUrl);
      if (type === "pdf") setPdfUrl(publicUrl);
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const { error } = await supabase.from("lessons").insert({
      module_id: selectedModuleId,
      course_id: courseId,
      title: formData.get("title"),
      content: formData.get("content"),
      format: format,
      order_index: parseInt(formData.get("order") as string) || 0,
      video_url: format === "video" ? videoUrl : null,
      captions_url: format === "video" ? captionsUrl : null,
      pdf_url: format === "reading" ? pdfUrl : null, // Ensure this column exists in DB
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      router.push(`/admin/courses/${courseId}`);
      router.refresh();
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold">
        <ChevronLeft size={16} /> Back
      </button>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl">
          <button type="button" onClick={() => setFormat("video")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${format === 'video' ? 'bg-white shadow-sm text-[#00ADEF]' : 'text-slate-500'}`}>
            <Video size={18} /> Video Lesson
          </button>
          <button type="button" onClick={() => setFormat("reading")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${format === 'reading' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500'}`}>
            <FileText size={18} /> Reading Material
          </button>
        </div>

        <select value={selectedModuleId} onChange={(e) => setSelectedModuleId(e.target.value)} className="w-full p-4 rounded-xl bg-slate-50 border">
          {modules.map(m => <option key={m.id} value={m.id}>Module {m.order_index}: {m.title}</option>)}
        </select>

        <div className="flex gap-4">
          <input name="title" placeholder="Lesson Title" required className="flex-1 p-4 rounded-xl bg-slate-50 border" />
          <input name="order" type="number" placeholder="Order" className="w-24 p-4 rounded-xl bg-slate-50 border" />
        </div>

        <textarea name="content" rows={8} className="w-full p-4 rounded-xl bg-slate-50 border font-mono text-sm" placeholder="Text Content (Markdown)..." />

        {/* Dynamic Upload Area */}
        <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          {format === "video" ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                {videoUrl ? <p className="text-[10px] text-green-600 font-bold truncate">{videoUrl}</p> : (
                  <label className="cursor-pointer">
                    <input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'video')} />
                    <Video className="mx-auto mb-2 text-slate-400" />
                    <span className="text-xs font-bold text-slate-500">Upload Video</span>
                  </label>
                )}
              </div>
              <div className="text-center">
                {captionsUrl ? <p className="text-[10px] text-green-600 font-bold truncate">{captionsUrl}</p> : (
                  <label className="cursor-pointer">
                    <input type="file" accept=".vtt" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'captions')} />
                    <CaptionsIcon className="mx-auto mb-2 text-slate-400" />
                    <span className="text-xs font-bold text-slate-500">Upload VTT</span>
                  </label>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              {pdfUrl ? (
                <div className="flex items-center justify-center gap-2">
                  <FileDown className="text-green-500" />
                  <p className="text-xs font-bold text-green-600">PDF Uploaded Successfully</p>
                  <X size={14} className="text-red-500 cursor-pointer" onClick={() => setPdfUrl("")} />
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'pdf')} />
                  <FileDown className="mx-auto mb-2 text-slate-400" />
                  <span className="text-xs font-bold text-slate-500">Upload Reading PDF (Optional)</span>
                </label>
              )}
            </div>
          )}
        </div>

        <button disabled={loading || uploading} className="w-full bg-black text-white p-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center">
          {loading ? <Loader2 className="animate-spin" /> : "Save Lesson"}
        </button>
      </form>
    </div>
  );
}