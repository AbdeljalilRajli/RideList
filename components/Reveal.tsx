"use client";

import React, { useEffect, useRef, useState } from "react";

export interface RevealProps {
  children: React.ReactNode;
  className?: string;
  variant?: "fade-up" | "fade-scale" | "fade";
  delay?: number; // Delay in milliseconds
  duration?: number; // Optional custom duration in milliseconds
  threshold?: number; // IntersectionObserver threshold (0 to 1)
  rootMargin?: string; // IntersectionObserver rootMargin
  triggerOnLoad?: boolean; // If true, triggers on page load (Hero elements)
  as?: React.ElementType; // HTML tag to render (div, article, h2, etc.)
  style?: React.CSSProperties;
}

/**
 * Modern, lightweight scroll-triggered entrance animation component.
 * Uses native IntersectionObserver and GPU-composited CSS transitions (opacity + transform).
 * Animates each element only once. Respects prefers-reduced-motion and no-JS environments.
 */
export default function Reveal({
  children,
  className = "",
  variant = "fade-up",
  delay = 0,
  duration,
  threshold = 0.12,
  rootMargin = "0px 0px -40px 0px",
  triggerOnLoad = false,
  as: Component = "div",
  style = {},
}: RevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Respect user's reduced-motion preference immediately
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setIsVisible(true);
      return;
    }

    // Hero section: trigger immediately on mount/load
    if (triggerOnLoad) {
      const raf = requestAnimationFrame(() => {
        setIsVisible(true);
      });
      return () => cancelAnimationFrame(raf);
    }

    const element = elementRef.current;
    if (!element) return;

    // Fallback if IntersectionObserver isn't supported
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Animate each element only once
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    // Safety fallback: ensure content is revealed even if observer is blocked
    const fallbackTimer = setTimeout(() => {
      setIsVisible(true);
    }, 3500);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, [threshold, rootMargin, triggerOnLoad]);

  // Variant class selection
  const variantClass =
    variant === "fade-scale"
      ? "reveal-fade-scale"
      : variant === "fade"
      ? "reveal-fade"
      : "reveal-fade-up";

  const visibleClass = isVisible ? "reveal-visible" : "";

  // Transition inline styles for custom delays/durations
  const transitionStyle: React.CSSProperties = {
    ...style,
    ...(delay > 0 ? { transitionDelay: `${delay}ms` } : {}),
    ...(duration ? { transitionDuration: `${duration}ms` } : {}),
  };

  return (
    <Component
      ref={elementRef}
      className={`reveal-base ${variantClass} ${visibleClass} max-w-full ${className}`.trim()}
      style={transitionStyle}
    >
      {children}
    </Component>
  );
}
