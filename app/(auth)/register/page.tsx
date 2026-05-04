"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
// 1. Separate the Link component from the Lucide icons
import { User, Briefcase, Mail, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    designation: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Domain Validation
    if (!formData.email.toLowerCase().endsWith("@rebus.ae")) {
      alert("Access restricted to company employees (@rebus.ae) only.");
      setLoading(false);
      return;
    }

    // 2. CHECK IF USER EXISTS
    // We check your 'profiles' table for the email
    const { data: existingUser, error: checkError } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", formData.email.toLowerCase())
      .single();

    if (existingUser) {
      alert(
        "An account with this email already exists. Please log in instead.",
      );
      setLoading(false);
      router.push("/login"); // Redirect them to login
      return;
    }

    // 3. Proceed with Registration if they don't exist
    const { error } = await supabase.auth.signInWithOtp({
      email: formData.email,
      options: {
        shouldCreateUser: true,
        data: {
          full_name: formData.fullName,
          designation: formData.designation,
        },
      },
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      router.push(`/login/verify?email=${encodeURIComponent(formData.email)}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 space-y-8">
        <div className="flex justify-center w-full">
          <Image
            src="/logo.png"
            alt="Rebus Holdings Logo"
            width={125}
            height={100}
            className="mb-2" // Reduced bottom margin slightly for better balance
          />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Create Account
          </h1>
          <p className="text-slate-500 text-sm">
            Join the platform to start your certification.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
              <User size={12} /> Full Name
            </label>
            <input
              required
              type="text"
              className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-[#00ADEF] outline-none transition-all"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
              <Briefcase size={12} /> Designation
            </label>
            <input
              required
              type="text"
              className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-[#00ADEF] outline-none transition-all"
              placeholder="e.g. Project Manager"
              value={formData.designation}
              onChange={(e) =>
                setFormData({ ...formData, designation: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
              <Mail size={12} /> Email Address
            </label>
            <input
              required
              type="email"
              className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-[#00ADEF] outline-none transition-all"
              placeholder="name@rebus.ae"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-[#662D91] text-white py-5 rounded-2xl font-bold hover:bg-[#522475] transition-all shadow-lg shadow-purple-100 flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                Sign Up{" "}
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </>
            )}
          </button>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#00ADEF] font-semibold hover:underline"
            >
              Log in here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
