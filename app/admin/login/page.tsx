"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in as admin, redirect to /admin
  useEffect(() => {
    async function checkExistingSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: adminRow } = await supabase
          .from("admins")
          .select("user_id")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (adminRow) {
          router.replace("/admin");
        }
      }
    }
    checkExistingSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError || !authData.user) {
        throw new Error(authError?.message || "Invalid email or password.");
      }

      // 2. Verify admin access via the 'admins' table
      const { data: adminRow, error: adminError } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (adminError || !adminRow) {
        // Not an admin: sign them out immediately
        await supabase.auth.signOut();
        throw new Error("Access denied: Your account is not authorized as a RideList administrator.");
      }

      // 3. Authorized admin
      router.replace("/admin");
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F8FB] flex flex-col justify-center items-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Brand Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="RideList Logo"
              width={260}
              height={90}
              priority
              unoptimized
              className="h-12 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-8 sm:p-10 shadow-xl">
          <div className="text-center mb-8">
            <span className="inline-block px-3 py-1 rounded-full bg-[#EEEDF9] text-[#5937E0] text-xs font-bold uppercase tracking-wider mb-2">
              Admin Portal
            </span>
            <h1 className="text-2xl font-bold text-black font-['Work_Sans',sans-serif]">
              Sign in to Dashboard
            </h1>
            <p className="text-xs text-[#6C757D] mt-1">
              Authorized administrator access only
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium leading-relaxed">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-black mb-1.5 font-['Work_Sans',sans-serif]">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@ridelist.com"
                className="w-full h-11 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#5937E0] focus:ring-1 focus:ring-[#5937E0] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-black mb-1.5 font-['Work_Sans',sans-serif]">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-11 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#5937E0] focus:ring-1 focus:ring-[#5937E0] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-4 rounded-full bg-[#5937E0] hover:bg-[#4A2CC7] text-white text-sm font-bold shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E5E7EB] text-center">
            <Link
              href="/"
              className="text-xs font-bold text-[#6C757D] hover:text-[#5937E0] transition-colors"
            >
              ← Return to public website
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
