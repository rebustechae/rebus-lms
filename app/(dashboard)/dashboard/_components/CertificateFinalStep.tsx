"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { UserCheck, Edit3, ChevronRight, CheckCircle2 } from "lucide-react";
import CertificateGenerator from "./CertificateGenerator";

interface CertificateFinalStepProps {
  user: any;
  courseName: string;
  courseId: string;
}

export default function CertificateFinalStep({ user, courseName, courseId }: CertificateFinalStepProps) {
  const [isConfirmed, setIsConfirmed] = useState(!!user?.user_metadata?.full_name);
  const [isEditing, setIsEditing] = useState(!user?.user_metadata?.full_name);
  const [name, setName] = useState(user?.user_metadata?.full_name || "");
  const [designation, setDesignation] = useState(user?.user_metadata?.designation || "");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleUpdateName = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name }
    });

    if (!error) {
      setIsEditing(false);
      setIsConfirmed(true);
    }
    setLoading(false);
  };

  if (isConfirmed && !isEditing) {
    return (
      <div className="space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="text-emerald-500" size={20} />
          <p className="text-xs font-semibold text-emerald-800 uppercase tracking-tight">
            Certificate verified for: <span className="underline">{name}</span>
          </p>
          <button 
            onClick={() => setIsEditing(true)} 
            className="ml-auto text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase"
          >
            Change
          </button>
        </div>

        <CertificateGenerator 
          baseImageUrl="/images/certificate-template.png" 
          userName={name}
          designation={designation}
          courseName={courseName}
          completionDate={new Date().toLocaleDateString('en-US', { 
            month: 'long', day: 'numeric', year: 'numeric' 
          })}
        />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50">
      <div className="w-16 h-16 bg-[#00ADEF]/10 rounded-2xl flex items-center justify-center mb-6">
        <UserCheck className="text-[#00ADEF]" size={32} />
      </div>

      <h2 className="text-xl font-bold text-slate-900 mb-2">Final Step: Verify your name</h2>
      <p className="text-sm text-slate-500 mb-8 leading-relaxed">
        This name will be permanently printed on your official **Rebus Holdings** certificate. Please ensure it matches your legal ID.
      </p>

      <div className="space-y-4">
        <div className="relative">
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00ADEF]/20 focus:border-[#00ADEF] transition-all"
          />
          <Edit3 size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" />
        </div>

        <button
          onClick={handleUpdateName}
          disabled={loading || name.length < 3}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-200"
        >
          {loading ? "Saving..." : "Confirm & View Certificate"}
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}