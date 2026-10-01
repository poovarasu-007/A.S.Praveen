import React from 'react';

interface GlobalAgriculturalBackgroundProps {
  /** Opacity of the background image layer (e.g., 0.50 for billing screen, 0.85 for dashboard) */
  opacity?: number;
  /** Whether to show the animated atmospheric sky mist */
  showMist?: boolean;
  /** Whether to enable subtle, slow panoramic drift across the agricultural scenery */
  panoramicDrift?: boolean;
}

/**
 * Reusable Global Agricultural Background Component
 *
 * Implements a unified, high-performance Tamil Nadu agricultural visual theme
 * combining all 5 signature agricultural photographs into one seamless panoramic image:
 *  1. Traditional farmer ploughing wet paddy field with two white oxen
 *  2. Farmer soil preparation and furrowing
 *  3. Hardworking farmers transplanting rice seedlings in monsoon rain field
 *  4. Modern tractor spraying crops with precision booms in lush green fields
 *  5. High-tech agricultural drone in flight spraying fine crop protection mist
 *
 * Features:
 * - Ultra-smooth cinematic Sky Mist animation drifting naturally across the upper atmosphere
 * - Smooth panoramic slow drift bringing all 5 agricultural scenes into living focus
 * - Botanical diffuser overlay ensuring high contrast and pristine readability for all data
 * - Strictly suppressed during physical print
 */
export const GlobalAgriculturalBackground: React.FC<GlobalAgriculturalBackgroundProps> = ({
  opacity = 0.85,
  showMist = true,
  panoramicDrift = true,
}) => {
  return (
    <div
      className="global-agricultural-background pointer-events-none fixed inset-0 z-[-1] overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* ── Unified Multi-Photo Composite Image Layer ────────────────── */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          panoramicDrift ? 'composite-bg-pan' : 'composite-bg-static'
        }`}
        style={{
          opacity,
          backgroundImage: "url('/images/agricultural_composite_panorama.webp'), url('/images/agricultural_composite_fitted.webp'), url('/images/agricultural_composite_panorama.jpg')",
        }}
      />

      {/* ── Soft Botanical Contrast Diffuser ─────────────────────────── */}
      <div
        className="absolute inset-0 backdrop-blur-[0.5px] transition-all duration-500"
        style={{
          background:
            'radial-gradient(ellipse 120% 70% at 50% 0%, rgba(2, 51, 55, 0.08) 0%, rgba(227, 245, 221, 0.62) 100%)',
        }}
      />

      {/* ── Cinematic Sky Mist Atmospheric Animation (Masked to sky only) ─ */}
      {showMist && (
        <div className="mist-container">
          <div className="mist-layer mist-layer-1" />
          <div className="mist-layer mist-layer-2" />
          <div className="mist-layer mist-layer-3" />
          <div className="mist-layer mist-layer-4" />
        </div>
      )}
    </div>
  );
};

export default GlobalAgriculturalBackground;
