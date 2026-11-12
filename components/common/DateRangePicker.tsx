"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import { createPortal } from "react-dom";
import { DayPicker } from "react-day-picker";

export interface DateRangePickerProps {
  startDate: string; // ISO "YYYY-MM-DD" or ""
  endDate: string;   // ISO "YYYY-MM-DD" or ""
  onChange: (range: { startDate: string; endDate: string }) => void;
  layout?: "stacked" | "split"; // "stacked" (homepage hero) or "split" (2 columns)
  pickupPlaceholder?: string;
  returnPlaceholder?: string;
  pickupLabel?: string;
  returnLabel?: string;
  showLabels?: boolean;
  minDate?: string; // ISO "YYYY-MM-DD", defaults to today
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
}

/**
 * Format ISO "YYYY-MM-DD" into unambiguous format like "16 Nov 2026".
 * Never uses mm/dd/yyyy.
 */
export function formatDisplayDate(isoDateStr?: string | null): string {
  if (!isoDateStr) return "";
  const parts = isoDateStr.split("-");
  if (parts.length !== 3) return "";
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return "";
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  return `${day} ${months[month - 1]} ${year}`;
}

/**
 * Convert local Date to ISO "YYYY-MM-DD".
 */
export function toISODateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse ISO "YYYY-MM-DD" safely into a local Date without UTC offset shifts.
 */
export function parseISODateString(isoStr?: string | null): Date | undefined {
  if (!isoStr) return undefined;
  const parts = isoStr.split("-");
  if (parts.length !== 3) return undefined;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return undefined;
  return new Date(year, month - 1, day);
}

export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
  layout = "stacked",
  pickupPlaceholder = "Pick-up date",
  returnPlaceholder = "Return date",
  pickupLabel = "Pick-up date",
  returnLabel = "Return date",
  showLabels = false,
  minDate,
  className = "",
  buttonClassName = "",
  disabled = false,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<"pickup" | "return">("pickup");
  const [activeTrigger, setActiveTrigger] = useState<"pickup" | "return">("pickup");

  // Temporary local selection while popover is active
  const [tempFrom, setTempFrom] = useState<Date | undefined>(() => parseISODateString(startDate));
  const [tempTo, setTempTo] = useState<Date | undefined>(() => parseISODateString(endDate));
  const [hoveredDate, setHoveredDate] = useState<Date | undefined>(undefined);

  // Responsive: desktop (2 months anchored popover) vs mobile (1 month centered/bottom modal)
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // References for positioning and focus restoration
  const pickupBtnRef = useRef<HTMLButtonElement>(null);
  const returnBtnRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  // Position coordinates for desktop popover
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const pickupId = useId();
  const returnId = useId();

  // Baseline today Date (normalized to midnight)
  const today = React.useMemo(() => {
    const d = minDate ? parseISODateString(minDate) || new Date() : new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, [minDate]);

  useEffect(() => {
    setMounted(true);
    const updateSize = () => setIsMobile(window.innerWidth < 768);
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Synchronize when external props change
  useEffect(() => {
    setTempFrom(parseISODateString(startDate));
    setTempTo(parseISODateString(endDate));
  }, [startDate, endDate]);

  // Compute popover position anchored to whichever field was clicked
  const updatePosition = () => {
    if (isMobile) return;
    const triggerEl = activeTrigger === "pickup" ? pickupBtnRef.current : returnBtnRef.current;
    if (!triggerEl) return;

    const rect = triggerEl.getBoundingClientRect();
    const popoverWidth = 620; // approximate width of 2-month desktop calendar
    const spacing = 8;

    let top = rect.bottom + window.scrollY + spacing;
    let left = rect.left + window.scrollX;

    // Viewport edge collision prevention
    if (left + popoverWidth > window.innerWidth - 16) {
      left = Math.max(16, window.innerWidth - popoverWidth - 16);
    }

    setCoords({ top, left });
  };

  const openPicker = (trigger: "pickup" | "return") => {
    if (disabled) return;
    lastActiveElementRef.current = document.activeElement as HTMLElement;
    setActiveTrigger(trigger);

    // If pick-up already chosen and user clicked return, go to return step
    if (trigger === "return" && startDate) {
      setActiveStep("return");
    } else {
      setActiveStep("pickup");
    }

    setTempFrom(parseISODateString(startDate));
    setTempTo(parseISODateString(endDate));
    setIsOpen(true);
  };

  const closePicker = () => {
    setIsOpen(false);
    setHoveredDate(undefined);
    // Return focus to the trigger button that opened it
    setTimeout(() => {
      if (lastActiveElementRef.current) {
        lastActiveElementRef.current.focus();
      }
    }, 10);
  };

  // Reposition on scroll/resize when open on desktop
  useEffect(() => {
    if (!isOpen || isMobile) return;
    updatePosition();
    const handleScroll = () => updatePosition();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isOpen, isMobile, activeTrigger]);

  // Handle outside click to close
  useEffect(() => {
    if (!isOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        !pickupBtnRef.current?.contains(target) &&
        !returnBtnRef.current?.contains(target)
      ) {
        closePicker();
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closePicker();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Day click handler with auto step-transition and min 1-day rental enforcement
  const handleDayClick = (day: Date) => {
    day.setHours(0, 0, 0, 0);
    if (day < today) return; // Past dates disabled

    if (activeStep === "pickup") {
      // Step 1: User chose pick-up date
      setTempFrom(day);
      setTempTo(undefined);
      setActiveStep("return");
      // If there was an existing return date after day, keep it, otherwise clear it
      if (tempTo && tempTo > day) {
        setTempTo(tempTo);
        onChange({
          startDate: toISODateString(day),
          endDate: toISODateString(tempTo),
        });
      }
    } else {
      // Step 2: Choosing return date
      if (tempFrom && day <= tempFrom) {
        // User clicked same day or earlier: minimum rental is 1 day.
        // Treat as new pick-up date and keep step at "return"
        setTempFrom(day);
        setTempTo(undefined);
        setActiveStep("return");
      } else if (tempFrom && day > tempFrom) {
        // Valid return date selected!
        setTempTo(day);
        onChange({
          startDate: toISODateString(tempFrom),
          endDate: toISODateString(day),
        });

        // On desktop, selection is complete; give quick visual feedback then close
        if (!isMobile) {
          setTimeout(() => {
            closePicker();
          }, 220);
        }
      }
    }
  };

  const handleClear = () => {
    setTempFrom(undefined);
    setTempTo(undefined);
    setActiveStep("pickup");
    onChange({ startDate: "", endDate: "" });
  };

  const handleDone = () => {
    if (tempFrom && tempTo) {
      onChange({
        startDate: toISODateString(tempFrom),
        endDate: toISODateString(tempTo),
      });
    }
    closePicker();
  };

  // Calendar Icon: Exactly ONE grey SVG icon per field
  const CalendarIcon = () => (
    <svg
      className="w-4 h-4 text-[#6C757D] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );

  // Render Pick-up Trigger Button
  const renderPickupButton = () => (
    <div className="relative w-full">
      {showLabels && (
        <label
          htmlFor={pickupId}
          className="block text-[10px] sm:text-xs font-bold text-[#6C757D] uppercase tracking-wider mb-1"
        >
          {pickupLabel}
        </label>
      )}
      <button
        id={pickupId}
        ref={pickupBtnRef}
        type="button"
        disabled={disabled}
        onClick={() => openPicker("pickup")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker("pickup");
          }
        }}
        aria-label={pickupLabel}
        aria-haspopup="dialog"
        aria-expanded={isOpen && activeTrigger === "pickup"}
        className={`w-full h-11 min-h-[44px] px-4 rounded-lg bg-[#F8F8FB] border border-[#E5E7EB] text-[16px] sm:text-xs font-medium text-left transition-colors flex items-center justify-between cursor-pointer focus:outline-none focus:border-[#5937E0] disabled:opacity-50 disabled:cursor-not-allowed ${buttonClassName}`}
      >
        <span
          className={`truncate select-none ${
            startDate ? "text-black font-semibold" : "text-[#6C757D]"
          }`}
        >
          {startDate ? formatDisplayDate(startDate) : pickupPlaceholder}
        </span>
        <CalendarIcon />
      </button>
    </div>
  );

  // Render Return Trigger Button
  const renderReturnButton = () => (
    <div className="relative w-full">
      {showLabels && (
        <label
          htmlFor={returnId}
          className="block text-[10px] sm:text-xs font-bold text-[#6C757D] uppercase tracking-wider mb-1"
        >
          {returnLabel}
        </label>
      )}
      <button
        id={returnId}
        ref={returnBtnRef}
        type="button"
        disabled={disabled}
        onClick={() => openPicker("return")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker("return");
          }
        }}
        aria-label={returnLabel}
        aria-haspopup="dialog"
        aria-expanded={isOpen && activeTrigger === "return"}
        className={`w-full h-11 min-h-[44px] px-4 rounded-lg bg-[#F8F8FB] border border-[#E5E7EB] text-[16px] sm:text-xs font-medium text-left transition-colors flex items-center justify-between cursor-pointer focus:outline-none focus:border-[#5937E0] disabled:opacity-50 disabled:cursor-not-allowed ${buttonClassName}`}
      >
        <span
          className={`truncate select-none ${
            endDate ? "text-black font-semibold" : "text-[#6C757D]"
          }`}
        >
          {endDate ? formatDisplayDate(endDate) : returnPlaceholder}
        </span>
        <CalendarIcon />
      </button>
    </div>
  );

  // Popover / Modal Content
  const renderCalendarContent = () => {
    // Current display range for DayPicker
    const selectedRange = {
      from: tempFrom,
      to: tempTo || (activeStep === "return" ? hoveredDate : undefined),
    };

    return (
      <div
        ref={popoverRef}
        role="dialog"
        aria-modal="true"
        aria-label="Rental date range calendar"
        className={
          isMobile
            ? "bg-white rounded-t-[28px] sm:rounded-[24px] w-full max-w-[360px] p-4 shadow-2xl border border-[#E5E7EB] max-h-[92vh] overflow-y-auto"
            : "bg-white rounded-[24px] shadow-2xl border border-[#E5E7EB] p-5 w-auto"
        }
      >
        {/* Calendar Header with Step Instructions & Close Button */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E5E7EB]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#5937E0]" />
              <h4 className="text-xs sm:text-sm font-bold text-black font-['Work_Sans',sans-serif]">
                {activeStep === "pickup"
                  ? "Select Pick-up Date"
                  : "Select Return Date"}
              </h4>
            </div>
            <p className="text-[11px] text-[#6C757D] mt-0.5">
              {activeStep === "pickup"
                ? "Choose when you would like to collect the vehicle"
                : "Minimum rental is 1 day. Must be after pick-up date."}
            </p>
          </div>

          <button
            type="button"
            onClick={closePicker}
            aria-label="Close calendar"
            className="w-8 h-8 rounded-full bg-[#F8F8FB] hover:bg-[#EEEDF9] text-[#6C757D] hover:text-[#5937E0] flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Selected Range Summary Bar */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-2.5 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-xs">
          <div
            className={`p-2 rounded-lg transition-colors ${
              activeStep === "pickup"
                ? "bg-white shadow-sm border border-[#5937E0]/30"
                : "border border-transparent"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] block">
              Pick-up
            </span>
            <span className="font-semibold text-black block truncate">
              {tempFrom ? formatDisplayDate(toISODateString(tempFrom)) : "Not set"}
            </span>
          </div>

          <div
            className={`p-2 rounded-lg transition-colors ${
              activeStep === "return"
                ? "bg-white shadow-sm border border-[#5937E0]/30"
                : "border border-transparent"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] block">
              Return
            </span>
            <span className="font-semibold text-black block truncate">
              {tempTo ? formatDisplayDate(toISODateString(tempTo)) : "Not set"}
            </span>
          </div>
        </div>

        {/* React DayPicker: 2 months on desktop, 1 on mobile */}
        <div className="flex justify-center">
          <DayPicker
            mode="range"
            selected={selectedRange}
            onDayClick={handleDayClick}
            disabled={{ before: today }}
            weekStartsOn={1}
            numberOfMonths={isMobile ? 1 : 2}
            defaultMonth={tempFrom || today}
          />
        </div>

        {/* Bottom Actions: Clear & Done */}
        <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 text-xs font-semibold text-[#6C757D] hover:text-[#5937E0] transition-colors cursor-pointer"
          >
            Clear dates
          </button>

          <button
            type="button"
            onClick={handleDone}
            className="px-6 py-2.5 rounded-full bg-[#5937E0] hover:bg-[#4A2CC7] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all min-h-[44px] cursor-pointer flex items-center justify-center"
          >
            Done
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      {layout === "stacked" ? (
        <div className="space-y-4">
          {renderPickupButton()}
          {renderReturnButton()}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {renderPickupButton()}
          {renderReturnButton()}
        </div>
      )}

      {/* Portal Popover / Modal */}
      {mounted &&
        isOpen &&
        createPortal(
          isMobile ? (
            <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-[2px] animate-fadeIn">
              {renderCalendarContent()}
            </div>
          ) : (
            <div
              style={{
                position: "absolute",
                top: `${coords.top}px`,
                left: `${coords.left}px`,
                zIndex: 9999,
              }}
              className="animate-fadeIn"
            >
              {renderCalendarContent()}
            </div>
          ),
          document.body
        )}
    </div>
  );
}
