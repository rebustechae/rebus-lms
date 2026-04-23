import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ShieldCheck, LockKeyhole } from "lucide-react";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { message: string };
}) {
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
      return redirect("/admin/login?message=UNAUTHORIZED_ACCESS_DENIED");
    }

    // After login, we send them to the admin dashboard
    return redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center p-6">
      <form action={adminSignIn} className="w-full max-w-md space-y-4">
        <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col items-center text-center mb-8 space-y-2">
            <div className="bg-black text-white p-3 mb-2">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">Admin Gateway</h1>
            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Secure encrypted channel // Level 4 Clearances</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase">Operative Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full border-2 border-black p-3 font-mono text-sm focus:bg-zinc-50 outline-none"
                placeholder="admin@rebus.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase">Security Key</label>
              <input
                name="password"
                type="password"
                required
                className="w-full border-2 border-black p-3 font-mono text-sm focus:bg-zinc-50 outline-none"
                placeholder="••••••••"
              />
            </div>

            <button className="w-full bg-black text-white py-4 font-black uppercase text-sm flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
              <LockKeyhole size={16} /> Authenticate
            </button>
          </div>

          {searchParams?.message && (
            <div className="mt-6 p-3 bg-red-50 border-2 border-red-600 text-red-600 text-[10px] font-black uppercase text-center">
              {searchParams.message}
            </div>
          )}
        </div>
        
        <p className="text-center text-[10px] font-mono text-zinc-400 uppercase">
          Attempting unauthorized access is a violation of protocol.
        </p>
      </form>
    </div>
  );
}