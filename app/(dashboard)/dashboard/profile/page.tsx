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
  Award,
  X,
  ChevronRight,
} from "lucide-react";
import CertificateGenerator from "../_components/CertificateGenerator";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [designation, setDesignation] = useState("");
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  const [selectedCert, setSelectedCert] = useState<any>(null);

  const supabase = createClient();

  // REPLACE THIS with your actual certificate background URL from Supabase Storage
  const TEMPLATE_URL = "/certificate-template.jpg";

  useEffect(() => {
    async function getProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setUser(user);
          setDisplayName(user.user_metadata?.full_name || "");
          setDesignation(user.user_metadata?.designation || "");

          const { data: progress, error: progressError } = await supabase
            .from("course_completions")
            .select(`
              id,
              completed_at,
              courses (
                title
              )
            `)
            .eq("user_id", user.id);

          if (!progressError) {
            setCompletedCourses(progress || []);
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
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
        <p className="text-slate-500 mt-2 text-sm font-medium">
          Manage your professional identity and learning history.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
            <h2 className="flex items-center gap-2 font-bold text-slate-800 mb-6 text-sm uppercase tracking-wider">
              <User size={18} className="text-[#00ADEF]" />
              Personal Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">
                  Email
                </label>
                <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border border-slate-100 rounded-lg text-slate-500 cursor-not-allowed">
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
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-[#00ADEF] transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">
                    Designation
                  </label>
                  <div className="relative">
                    <Briefcase size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-[#00ADEF] transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleUpdateProfile}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Save Changes
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#00ADEF]/5 border border-[#00ADEF]/10 rounded-xl p-8">
            <h2 className="flex items-center gap-2 font-bold text-slate-800 mb-6 text-sm uppercase tracking-wider">
              <GraduationCap size={20} className="text-[#00ADEF]" />
              Completed Courses
            </h2>

            <div className="space-y-4">
              {completedCourses.length > 0 ? (
                completedCourses.map((item, i) => {
                  const title = item.courses?.title || "Professional Training";
                  const date = item.completed_at ? new Date(item.completed_at).toLocaleDateString() : "Recently";
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedCert({ title, date })}
                      className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-white transition-all text-left group border border-transparent hover:border-slate-100"
                    >
                      <CheckCircle2 size={16} className="text-emerald-500 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 leading-tight flex items-center gap-2">
                          {title}
                          <ChevronRight size={12} className="text-[#00ADEF] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 font-semibold uppercase">
                          <Calendar size={10} />
                          {date}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-6">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
                    No completions recorded
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CERTIFICATE MODAL */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)] relative">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="bg-[#00ADEF]/10 p-2 rounded-lg">
                  <Award size={18} className="text-[#00ADEF]" />
                </div>
                <div>
                  <h3 className="text-[11px] font-semibold text-slate-900 uppercase">Certificate Preview</h3>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCert(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-900"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <CertificateGenerator
                baseImageUrl={TEMPLATE_URL}
                userName={displayName}
                designation={designation}
                courseName={selectedCert.title}
                completionDate={selectedCert.date}
              />
            </div>

            <div className="px-8 pb-8 text-center">
              <p className="text-[9px] font-base text-slate-300 uppercase tracking-wide">
                Rebus LMS • Official Personnel Certification
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}