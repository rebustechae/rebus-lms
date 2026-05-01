"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  User,
  Mail,
  GraduationCap,
  CheckCircle2,
  Loader2,
  Save,
  Briefcase,
  Calendar,
} from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [designation, setDesignation] = useState("");
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function getProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUser(user);
          setDisplayName(user.user_metadata?.full_name || "");
          setDesignation(user.user_metadata?.designation || "");

          // Updated table name to course_completions
          const { data: progress, error: progressError } = await supabase
            .from("course_completions")
            .select(
              `
            completed_at,
            courses (
              title
            )
          `,
            )
            .eq("user_id", user.id); // Usually completions implies 'completed', so no boolean check needed

          if (progressError) {
            console.error("Fetch Error:", progressError.message);
          } else {
            setCompletedCourses(progress || []);
          }
        }
      } catch (err) {
        console.error("System Error:", err);
      } finally {
        setLoading(false);
      }
    }
    getProfile();
  }, []);

  const handleUpdateProfile = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: displayName,
        designation: designation,
      },
    });

    if (!error) alert("Profile updated successfully!");
    else alert("Error: " + error.message);
    setSaving(false);
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-[#00ADEF]" size={32} />
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Account Settings
        </h1>
        <p className="text-slate-500 mt-2">
          Manage your professional identity and learning history.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 rounded-sm p-8 shadow-sm">
            <h2 className="flex items-center gap-2 font-bold text-slate-800 mb-6">
              <User size={18} className="text-[#00ADEF]" />
              Personal Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">
                  Email
                </label>
                <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border border-slate-100 rounded-md text-slate-500 cursor-not-allowed">
                  <Mail size={16} />
                  <span className="text-sm font-medium">{user?.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-[#00ADEF] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">
                    Designation
                  </label>
                  <div className="relative">
                    <Briefcase
                      size={14}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-[#00ADEF] transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleUpdateProfile}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-md font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#00ADEF]/5 border border-[#00ADEF]/10 rounded-sm p-8">
            <h2 className="flex items-center gap-2 font-bold text-slate-800 mb-6">
              <GraduationCap size={20} className="text-[#00ADEF]" />
              Completed Courses
            </h2>

            <div className="space-y-4">
              {completedCourses.length > 0 ? (
                completedCourses.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-2 rounded-md hover:bg-white/50 transition-colors"
                  >
                    <CheckCircle2
                      size={16}
                      className="text-emerald-500 mt-1 flex-shrink-0"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-700 leading-tight">
                        {item.courses?.title || `Course ID: ${item.course_id}`}
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 font-medium">
                        <Calendar size={10} />
                        {item.completed_at
                          ? new Date(item.completed_at).toLocaleDateString()
                          : "Recently"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-400 font-medium italic">
                    No completions recorded.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
