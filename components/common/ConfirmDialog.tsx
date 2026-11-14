"use client";

import React, { useEffect, useRef } from "react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: string | React.ReactNode;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "danger" | "primary";
  isLoading?: boolean;
  loadingLabel?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement> | null;
  icon?: "warning" | "danger" | "info" | "none";
}

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "danger",
  isLoading = false,
  loadingLabel = "Processing...",
  onConfirm,
  onClose,
  triggerRef,
  icon = "danger",
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // 1. Capture previous active element and trap focus inside dialog
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current =
        triggerRef?.current || (document.activeElement as HTMLElement) || null;

      // Focus safe/secondary button on open to avoid accidental confirmation
      const timer = setTimeout(() => {
        if (cancelBtnRef.current) {
          cancelBtnRef.current.focus();
        } else if (dialogRef.current) {
          dialogRef.current.focus();
        }
      }, 50);

      // Lock body scroll
      document.body.style.overflow = "hidden";

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "";
      };
    } else {
      document.body.style.overflow = "";
      // Restore focus to trigger element
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === "function") {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }
    }
  }, [isOpen, triggerRef]);

  // 2. Escape key handling and Tab-key focus cycle
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape closes dialog unless request is in progress
      if (e.key === "Escape") {
        if (!isLoading) {
          e.preventDefault();
          onClose();
        }
        return;
      }

      // Tab key cycle trap inside dialog
      if (e.key === "Tab") {
        if (!dialogRef.current) return;
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  // 3. Click outside handler
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const isDanger = confirmVariant === "danger";

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        tabIndex={-1}
        className="bg-white w-full max-w-md rounded-[24px] border border-[#E5E7EB] shadow-2xl p-5 sm:p-7 space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-150 my-auto text-black font-['Work_Sans',sans-serif]"
      >
        {/* Top Icon Badge */}
        {icon !== "none" && (
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto shrink-0 ${
              isDanger
                ? "bg-red-100 text-red-600"
                : "bg-[#EEEDF9] text-[#5937E0]"
            }`}
          >
            {icon === "danger" || icon === "warning" ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>
        )}

        {/* Title & Description */}
        <div className="text-center">
          <h3
            id="confirm-dialog-title"
            className="text-lg sm:text-xl font-bold text-black mb-1.5 leading-snug"
          >
            {title}
          </h3>
          {description && (
            <div
              id="confirm-dialog-description"
              className="text-xs text-[#6C757D] leading-relaxed"
            >
              {description}
            </div>
          )}
        </div>

        {/* Custom Body / Summary Box */}
        {children && <div>{children}</div>}

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full pt-1">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:flex-1 py-3 px-4 rounded-full border border-[#E5E7EB] text-xs font-bold text-[#6C757D] hover:bg-[#F8F8FB] transition-colors cursor-pointer disabled:opacity-50 min-h-[44px] flex items-center justify-center text-center"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full sm:flex-1 py-3 px-4 rounded-full text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px] ${
              isDanger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#5937E0] hover:bg-[#4a2ec4]"
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0"></div>
                <span>{loadingLabel}</span>
              </>
            ) : (
              <span>{confirmLabel}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
