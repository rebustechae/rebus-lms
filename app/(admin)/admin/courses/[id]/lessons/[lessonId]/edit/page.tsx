"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  ChevronLeft,
  Save,
  Loader2,
  Video,
  Upload,
  X,
  CaptionsIcon,
  FileText,
} from "lucide-react";
import { uploadFile } from "@/utils/supabase/storage";

export default function EditLessonPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [originalIndex, setOriginalIndex] = useState<number>(0);
  const [lesson, setLesson] = useState({
    title: "",
    content: "",
    format: "video", // NEW
    order_index: 0,
    video_url: "",
    captions_url: "",
  });

  const supabase = createClient();

  useEffect(() => {
    async function fetchLesson() {
      const { data } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", params.lessonId)
        .single();
      if (data) {
        setLesson(data);
        setOriginalIndex(data.order_index);
      }
      setLoading(false);
    }
    fetchLesson();
  }, [params.lessonId, supabase]);

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    let finalIndex = lesson.order_index;

    try {
      const { error } = await supabase
        .from("lessons")
        .update({
          title: lesson.title,
          content: lesson.content,
          format: lesson.format,
          order_index: finalIndex,
          video_url: lesson.format === "video" ? lesson.video_url : null,
          captions_url: lesson.format === "video" ? lesson.captions_url : null,
        })
        .eq("id", params.lessonId);

      if (error) throw error;
      router.push(`/admin/courses/${params.id}`);
      router.refresh();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
      setSaving(false);
    }
  }

  async function handleFileUpload(file: File, type: "video" | "captions") {
    setUploading(true);
    const targetBucket = type === "video" ? "videos" : "course-assets";
    const publicUrl = await uploadFile(
      file,
      params.id,
      `${params.lessonId}-${type}`,
      targetBucket,
    );

    if (publicUrl) {
      setLesson((prev) => ({
        ...prev,
        [type === "video" ? "video_url" : "captions_url"]: publicUrl,
      }));
    }
    setUploading(false);
  }

  if (loading)
    return (
      <div className="p-20 text-center animate-pulse font-black text-slate-400">
        LOADING...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 px-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#00ADEF] group"
      >
        <ChevronLeft
          size={16}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Cancel Changes
      </button>

      <form
        onSubmit={handleUpdate}
        className="space-y-8 bg-white border border-slate-200 rounded-3xl p-8"
      >
        <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setLesson({ ...lesson, format: "video" })}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${lesson.format === "video" ? "bg-white shadow-sm text-[#00ADEF]" : "text-slate-500"}`}
          >
            <Video size={18} /> Video
          </button>
          <button
            type="button"
            onClick={() => setLesson({ ...lesson, format: "reading" })}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${lesson.format === "reading" ? "bg-white shadow-sm text-amber-600" : "text-slate-500"}`}
          >
            <FileText size={18} /> Reading
          </button>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <input
            className="col-span-3 p-4 bg-slate-50 border rounded-2xl font-bold"
            value={lesson.title}
            onChange={(e) => setLesson({ ...lesson, title: e.target.value })}
          />
          <input
            type="number"
            className="p-4 bg-slate-50 border rounded-2xl font-bold"
            value={lesson.order_index}
            onChange={(e) =>
              setLesson({ ...lesson, order_index: parseInt(e.target.value) })
            }
          />
        </div>

        <textarea
          value={lesson.content}
          onChange={(e) => setLesson({ ...lesson, content: e.target.value })}
          rows={12}
          className="w-full bg-slate-50 border rounded-2xl p-6 font-mono text-sm"
        />

        {lesson.format === "video" && (
          <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-3xl">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">
                Video
              </label>
              {lesson.video_url ? (
                <div className="flex items-center gap-2 bg-white p-3 rounded-xl border">
                  <span className="text-[10px] truncate flex-1">
                    {lesson.video_url}
                  </span>
                  <X
                    size={14}
                    className="text-red-500 cursor-pointer"
                    onClick={() => setLesson({ ...lesson, video_url: "" })}
                  />
                </div>
              ) : (
                <div
                  onClick={() => document.getElementById("v-up")?.click()}
                  className="bg-white border rounded-xl p-4 text-center cursor-pointer"
                >
                  <input
                    id="v-up"
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleFileUpload(e.target.files[0], "video")
                    }
                  />
                  <Upload size={16} className="mx-auto mb-1 text-slate-400" />
                  <span className="text-[10px] font-bold">Upload</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                <CaptionsIcon size={12} /> Captions (VTT)
              </label>

              {lesson.captions_url ? (
                <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-mono truncate flex-1">
                    {lesson.captions_url}
                  </span>

                  <X
                    size={14}
                    className="text-red-500 cursor-pointer"
                    onClick={() => setLesson({ ...lesson, captions_url: "" })}
                  />
                </div>
              ) : (
                <div
                  onClick={() => document.getElementById("c-up")?.click()}
                  className="bg-white border border-slate-200 rounded-xl p-4 text-center hover:border-[#00ADEF] cursor-pointer"
                >
                  <input
                    id="c-up"
                    type="file"
                    accept=".vtt"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleFileUpload(e.target.files[0], "captions")
                    }
                  />

                  <Upload size={16} className="mx-auto mb-1 text-slate-400" />

                  <span className="text-[10px] font-bold text-slate-500">
                    Upload VTT File
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <button
          disabled={saving}
          className="w-full bg-slate-900 text-white p-5 rounded-2xl font-bold uppercase flex justify-center items-center gap-3"
        >
          {saving ? <Loader2 className="animate-spin" /> : <Save />}
          Update Lesson
        </button>
      </form>
    </div>
  );
}
