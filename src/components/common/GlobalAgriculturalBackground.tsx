import React from 'react';

interface GlobalAgriculturalBackgroundProps {
  /** Opacity of the background image layer (e.g., 0.50 for billing screen) */
  opacity?: number;
  /** Whether to show the animated atmospheric sky mist */
  showMist?: boolean;
}

/**
 * Reusable Global Agricultural Background Component
 *
 * Provides a unified, high-performance Tamil Nadu agricultural visual theme
 * across all authenticated pages (Dashboard, Billing, Products, Customers, Reports, Settings, etc.).
 *
 * - Master Image: Traditional farmer ploughing wet paddy field with two white oxen
 * - Atmospheric Sky Mist: GPU-accelerated horizontal drift strictly masked to sky
 * - Completely suppressed during print
 */
export const GlobalAgriculturalBackground: React.FC<GlobalAgriculturalBackgroundProps> = ({
  opacity = 0.85,
  showMist = true,
}) => {
  return (
    <div
      className="global-agricultural-background pointer-events-none fixed inset-0 z-[-1] overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* ── Agricultural Scenery Image Layer ───────────────────────── */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out"
        style={{
          backgroundImage: "url('/images/farmer_bullock_ploughing.jpg')",
          opacity,
        }}
      />

      {/* ── Soft Botanical Diffuser for High UI Contrast ───────────── */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#E3F5DD]/80 via-[#EAF8E7]/70 to-[#E3F5DD]/90 backdrop-blur-[1px]"
        style={{
          background:
            'radial-gradient(ellipse 120% 70% at 50% 0%, rgba(2, 51, 55, 0.12) 0%, rgba(227, 245, 221, 0.65) 100%)',
        }}
      />

      {/* ── Sky Mist Atmospheric Animation (Only over sky area) ───── */}
      {showMist && (
        <div className="mist-container">
          <div className="mist-layer mist-layer-1" />
          <div className="mist-layer mist-layer-2" />
          <div className="mist-layer mist-layer-3" />
        </div>
      )}
    </div>
  );
};

export default GlobalAgriculturalBackground;
