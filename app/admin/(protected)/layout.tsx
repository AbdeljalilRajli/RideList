"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const [isDevPreview, setIsDevPreview] = useState(false);

  useEffect(() => {
    if (
      process.env.NODE_ENV === "development" &&
      window.location.search.includes("dev_preview=1")
    ) {
      setIsDevPreview(true);
    }
  }, []);

  useEffect(() => {
    if (!loading && (!user || !isAdmin) && !isDevPreview) {
      router.replace("/admin/login");
    }
  }, [user, isAdmin, loading, router, isDevPreview]);

  // While checking auth state for a potentially logged in admin
  if (loading && !isDevPreview) {
    return (
      <div className="min-h-screen bg-[#F8F8FB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#5937E0] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6C757D] text-sm font-medium font-['Work_Sans',sans-serif]">
            Verifying administrator session...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated or not an admin: return null while redirecting (NEVER render dashboard UI/skeleton)
  if (!user || !isAdmin) {
    if (!isDevPreview) {
      return null;
    }
  }

  return <>{children}</>;
}
