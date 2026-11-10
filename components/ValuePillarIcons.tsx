import React from "react";

/**
 * 1:1 Vector Icons extracted directly from the Figma Car Rental design (Frame 1:2257).
 * All coordinates match Figma's native vector geometry with strokeWidth="4".
 */

export function AvailabilityIcon({ className = "w-[64px] h-[64px] text-black overflow-visible shrink-0" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="218.5 60 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Outer Ground Ellipse Inner Arc */}
      <path d="M254.137 103.627C263.056 104.107 269.799 106.322 269.799 108.982C269.799 111.993 261.158 114.434 250.5 114.434C239.841 114.434 231.201 111.993 231.201 108.982C231.201 106.322 237.943 104.107 246.863 103.627" />
      {/* Outer Ground Ellipse Front Arc */}
      <path d="M224.862 106.515C222.018 108.077 220.375 109.918 220.375 111.89C220.375 117.543 233.862 122.125 250.5 122.125C267.138 122.125 280.625 117.543 280.625 111.89C280.625 109.918 278.982 108.077 276.138 106.515" />
      {/* Teardrop Location Marker & Center Hole */}
      <path d="M250.5 81.3639C247.667 81.3639 245.37 79.0668 245.37 76.2333C245.37 73.3997 247.667 71.1025 250.5 71.1025C253.334 71.1025 255.631 73.3997 255.631 76.2333C255.631 79.0668 253.334 81.3639 250.5 81.3639ZM250.5 61.875C241.91 61.875 234.945 68.8392 234.945 77.4298C234.945 83.3949 243.661 98.4045 248.044 105.576C249.167 107.414 251.834 107.414 252.957 105.576C257.34 98.4045 266.056 83.3949 266.056 77.4298C266.056 68.8392 259.091 61.875 250.5 61.875Z" />
    </svg>
  );
}

export function ComfortIcon({ className = "w-[64px] h-[64px] text-black overflow-visible shrink-0" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="688 60 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Underbody Line Between Wheels */}
      <path d="M710.962 103.046H729.037" />
      {/* Hood, Bumpers & Lower Silhouette */}
      <path d="M741.087 103.046H745.104C747.865 103.046 750.125 100.786 750.125 98.0251V97.0208C750.125 91.498 745.606 86.9793 740.083 86.9793H694.896C692.134 86.9793 689.875 89.2385 689.875 92V98.0251C689.875 100.786 692.134 103.046 694.896 103.046H698.913" />
      {/* Window Pillar Divider */}
      <path d="M717.992 74.9292V86.9792" />
      {/* Slanted Roof & Windshields */}
      <path d="M738.075 86.9792L734.295 79.4201C733.06 76.9502 729.79 74.9292 727.029 74.9292H708.954C706.193 74.9292 702.923 76.9502 701.688 79.4201L697.908 86.9792" />
      {/* Rear Wheel */}
      <path d="M741.088 103.046C741.088 106.373 738.39 109.071 735.063 109.071C731.736 109.071 729.038 106.373 729.038 103.046C729.038 99.7183 731.736 97.0208 735.063 97.0208C738.39 97.0208 741.088 99.7183 741.088 103.046Z" />
      {/* Front Wheel */}
      <path d="M710.963 103.046C710.963 106.373 708.265 109.071 704.938 109.071C701.611 109.071 698.913 106.373 698.913 103.046C698.913 99.7183 701.611 97.0208 704.938 97.0208C708.265 97.0208 710.963 99.7183 710.963 103.046Z" />
      {/* Headlight Accent */}
      <path d="M749.922 95.0125H747.112" />
      {/* Taillight Accent */}
      <path d="M721.004 95.0125H718.996" />
    </svg>
  );
}

export function SavingsIcon({ className = "w-[64px] h-[64px] text-black overflow-visible shrink-0" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="1157.5 60 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Top Fold & Opening Accent */}
      <path d="M1208.99 76.9956V71.99C1208.99 69.2317 1206.76 66.9956 1204 66.9956H1164.99C1162.23 66.9956 1159.99 69.2342 1159.99 71.9956C1159.99 74.757 1162.23 76.9956 1164.99 76.9956H1214C1216.76 76.9956 1218.99 79.2317 1218.99 81.99V89.4956" />
      {/* Wallet Body Contour */}
      <path d="M1218.99 104.496V112.001C1218.99 114.759 1216.76 116.996 1214 116.996H1164.99C1162.23 116.996 1159.99 114.757 1159.99 111.996V71.9956" />
      {/* Side Clasp */}
      <path d="M1218.99 104.496H1206.49C1202.35 104.496 1198.99 101.138 1198.99 96.9956C1198.99 92.8535 1202.35 89.4956 1206.49 89.4956H1218.99V104.496Z" />
    </svg>
  );
}
