import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ShieldCheck, LockKeyhole, ArrowRight, Fingerprint } from "lucide-react";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;

  async function adminSignIn(formData: FormData) {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return redirect("/admin-login?message=AUTHENTICATION_FAILURE_DENIED");
    }

    return redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle Background Decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-100/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px]" />

      <form action={adminSignIn} className="w-full max-w-[440px] z-10">
        <div className="bg-white border border-slate-200 rounded-[32px] p-10 shadow-xl shadow-slate-200/50">
          
          {/* BRANDING HEADER */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-slate-200">
              <ShieldCheck size={32} strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Admin Login</h1>
          </div>

          {/* INPUT FIELDS */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-cyan-500/5 focus:border-[#00ADEF] transition-all"
                placeholder="admin@rebus.ae"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Password</label>
              </div>
              <input
                name="password"
                type="password"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-cyan-500/5 focus:border-[#00ADEF] transition-all"
                placeholder="••••••••••••"
              />
            </div>

            <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 group mt-4">
              <LockKeyhole size={18} /> 
              Sign-in
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* ERROR HANDLING */}
          {params?.message && (
            <div className="mt-8 p-4 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3">
              <Fingerprint size={20} className="text-red-400" />
              <p className="text-[10px] font-bold text-red-600 uppercase leading-tight tracking-tight">
                {params.message.replace(/_/g, ' ')}
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
              Authorized Personnel Only
            </p>
            <div className="h-px w-12 bg-slate-200 mx-auto" />
        </div>
      </form>
    </div>
  );
}
