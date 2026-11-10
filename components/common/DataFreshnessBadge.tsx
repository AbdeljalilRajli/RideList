"use client";

import { useState, useEffect } from "react";

interface DataFreshnessBadgeProps {
  isRefreshing: boolean;
  lastUpdated: Date | null;
  onRefresh: () => Promise<void> | void;
  className?: string;
}

export default function DataFreshnessBadge({
  isRefreshing,
  lastUpdated,
  onRefresh,
  className = "",
}: DataFreshnessBadgeProps) {
  const [, setTick] = useState(0);

  // Re-render every 15s to keep "Updated X ago" accurate
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const getStatusText = (date: Date | null) => {
    if (!date) {
      return { full: "Live • Syncing...", short: "Syncing" };
    }
    const diffMs = Date.now() - date.getTime();
    const seconds = Math.floor(diffMs / 1000);

    if (seconds < 10) {
      return { full: "Live • Updated just now", short: "Live • Just now" };
    }
    if (seconds < 60) {
      return {
        full: `Live • Updated ${seconds}s ago`,
        short: `Live • ${seconds}s ago`,
      };
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return {
        full: `Live • Updated ${minutes}m ago`,
        short: `Live • ${minutes}m ago`,
      };
    }
    const timeStr = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { full: `Live • Updated at ${timeStr}`, short: `Live • ${timeStr}` };
  };

  const status = getStatusText(lastUpdated);

  return (
    <div
      className={`inline-flex items-center gap-2 shrink-0 whitespace-nowrap select-none ${className}`}
    >
      <span className="inline-flex items-center gap-1.5 text-xs text-[#6C757D] shrink-0 whitespace-nowrap">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
        <span className="text-[11px] font-medium hidden sm:inline whitespace-nowrap">
          {status.full}
        </span>
        <span className="text-[11px] font-medium sm:hidden whitespace-nowrap">
          {status.short}
        </span>
      </span>

      <button
        type="button"
        onClick={() => onRefresh()}
        disabled={isRefreshing}
        className="inline-flex items-center justify-center p-1.5 rounded-full bg-[#F8F8FB] hover:bg-[#EEEDF9] text-[#6C757D] hover:text-[#5937E0] transition-colors border border-[#E5E7EB] disabled:opacity-50 cursor-pointer shrink-0"
        title="Refresh data"
        aria-label="Refresh data"
      >
        <svg
          className={`w-3.5 h-3.5 shrink-0 ${
            isRefreshing ? "animate-spin text-[#5937E0]" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>
  );
}
