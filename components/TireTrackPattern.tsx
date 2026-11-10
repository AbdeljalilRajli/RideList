import React from "react";

interface TireTrackPatternProps {
  className?: string;
  variant?: "hero" | "banner" | "newsletter";
}

export default function TireTrackPattern({ className = "", variant = "hero" }: TireTrackPatternProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Curved SVG Tire Tread Tracks */}
      <svg
        className="absolute w-full h-full text-white/10"
        viewBox="0 0 1440 660"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="tread-pattern" width="60" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(25)">
            <rect x="0" y="4" width="22" height="6" rx="2" fill="currentColor" />
            <rect x="30" y="14" width="22" height="6" rx="2" fill="currentColor" />
            <line x1="26" y1="0" x2="26" y2="24" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
          </pattern>
        </defs>

        {/* Top-left to bottom-center curved track */}
        <path
          d="M-100,120 C200,60 500,280 800,200 C1100,120 1300,320 1550,280"
          stroke="url(#tread-pattern)"
          strokeWidth="70"
          strokeLinecap="round"
          fill="none"
        />

        {/* Second parallel curved track */}
        <path
          d="M-60,260 C240,200 540,420 840,340 C1140,260 1340,460 1590,420"
          stroke="url(#tread-pattern)"
          strokeWidth="60"
          strokeLinecap="round"
          fill="none"
        />

        {/* Soft radial glow */}
        <ellipse cx="720" cy="100" rx="600" ry="250" fill="white" fillOpacity="0.06" />
      </svg>
    </div>
  );
}
