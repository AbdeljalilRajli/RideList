"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { signUp, user, loading: authLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isRedirecting = !authLoading && Boolean(user);

  useEffect(() => {
    if (isRedirecting) {
      router.replace("/dashboard");
    }
  }, [isRedirecting, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { needsConfirmation } = await signUp(email, password, name);
      if (needsConfirmation) {
        setSuccessMessage(
          "Account created successfully! We sent a confirmation link to your email. Please verify your email before logging in."
        );
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create account. Please try again.");
    } finally {
      setSubmitting(false);
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
              Free Customer Account
            </span>
            <h1 className="text-2xl font-extrabold text-black tracking-tight">
              Create an Account
            </h1>
            <p className="text-xs text-[#6C757D] mt-1">
              Optional customer account for faster bookings and reservation tracking
            </p>
          </div>

          {isRedirecting && (
            <div className="mb-4 p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-[#5937E0] text-xs font-semibold flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-[#5937E0] border-t-transparent rounded-full animate-spin shrink-0" />
              <span>Active session detected. Redirecting to your dashboard...</span>
            </div>
          )}

          {successMessage ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                ✓
              </div>
              <h3 className="text-base font-bold text-black">Check Your Email</h3>
              <p className="text-xs text-[#6C757D] leading-relaxed">
                {successMessage}
              </p>
              <Link
                href="/login"
                className="inline-block w-full py-3 rounded-full bg-[#5937E0] hover:bg-[#4A2CC7] text-white text-xs font-bold transition-all shadow-md mt-2"
              >
                Go to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold leading-relaxed">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-black mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  disabled={submitting || isRedirecting}
                  placeholder="e.g. Youssef El Amrani"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black focus:outline-none focus:border-[#5937E0] disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  disabled={submitting || isRedirecting}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black focus:outline-none focus:border-[#5937E0] disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  disabled={submitting || isRedirecting}
                  minLength={6}
                  placeholder="•••••••••••• (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black focus:outline-none focus:border-[#5937E0] disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || isRedirecting}
                className="w-full h-12 rounded-full bg-[#5937E0] hover:bg-[#4A2CC7] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : isRedirecting ? (
                  "Redirecting..."
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          )}

          {!successMessage && (
            <div className="mt-6 text-center text-xs text-[#6C757D]">
              Already have an account?{" "}
              <Link href="/login" className="text-[#5937E0] font-bold hover:underline">
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
