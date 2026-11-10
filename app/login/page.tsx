"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user, isAdmin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in
  if (user) {
    if (isAdmin) {
      router.replace("/admin");
    } else {
      router.replace("/dashboard");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const { isAdmin: isUserAdmin } = await signIn(email, password);
      if (isUserAdmin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F8FB] text-black pt-28 pb-16 px-4 sm:px-6 flex items-center justify-center font-['Work_Sans',sans-serif]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt="RideList Logo"
              width={220}
              height={80}
              priority
              unoptimized
              className="h-11 w-auto mx-auto object-contain"
            />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-8 sm:p-10 shadow-lg">
          <div className="text-center mb-6">
            <span className="inline-block px-3 py-1 rounded-full bg-[#EEEDF9] text-[#5937E0] text-xs font-bold uppercase tracking-wider mb-2">
              Customer Account
            </span>
            <h1 className="text-2xl font-extrabold text-black tracking-tight">
              Sign in to RideList
            </h1>
            <p className="text-xs text-[#6C757D] mt-1">
              Access your reservations and manage your bookings
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold leading-relaxed">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black focus:outline-none focus:border-[#5937E0]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black focus:outline-none focus:border-[#5937E0]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full bg-[#5937E0] hover:bg-[#4A2CC7] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#6C757D]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#5937E0] font-bold hover:underline">
              Sign up for free
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-[#E5E7EB] text-center">
            <Link
              href="/admin/login"
              className="text-xs font-semibold text-[#6C757D] hover:text-[#5937E0] transition-colors"
            >
              Sign in as Administrator →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
