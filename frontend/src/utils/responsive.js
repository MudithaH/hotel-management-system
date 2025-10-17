/**
 * Responsive utility functions
 * Helpers for handling responsive design and mobile-specific logic
 */

import { useState, useEffect } from 'react';

// Detect if user is on mobile device
export const isMobile = () => {
  return window.innerWidth < 768; // Tailwind's md breakpoint
};

// Detect if user is on tablet device
export const isTablet = () => {
  return window.innerWidth >= 768 && window.innerWidth < 1024; // Between md and lg
};

// Detect if user is on desktop device
export const isDesktop = () => {
  return window.innerWidth >= 1024; // Tailwind's lg breakpoint
};

// Get current breakpoint
export const getCurrentBreakpoint = () => {
  const width = window.innerWidth;
  if (width < 640) return 'sm';
  if (width < 768) return 'md';
  if (width < 1024) return 'lg';
  if (width < 1280) return 'xl';
  return '2xl';
};

// Hook to listen for window resize
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// Get responsive grid columns based on screen size
export const getResponsiveColumns = (mobile = 1, tablet = 2, desktop = 3) => {
  if (isMobile()) return mobile;
  if (isTablet()) return tablet;
  return desktop;
};

// Responsive text sizes
export const getResponsiveTextSize = (base, mobile, tablet) => {
  if (isMobile() && mobile) return mobile;
  if (isTablet() && tablet) return tablet;
  return base;
};

// Responsive spacing
export const getResponsiveSpacing = (base, mobile) => {
  return isMobile() && mobile ? mobile : base;
};