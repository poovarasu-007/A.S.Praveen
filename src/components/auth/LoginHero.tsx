import React from 'react';
import { CloudOff, FileSpreadsheet, Printer, Wheat } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface LoginHeroProps {
  /** Indicates whether the container has mounted for smooth entry */
  entered: boolean;
}

/**
 * Agricultural Visual Hero Panel for the Login Screen
 *
 * Implements:
 * - IMAGE 1 (Primary Hero): Traditional farmer ploughing wet field with two white oxen
 * - IMAGE 2 (Subtle overlay): Farmer close ploughing detail softly feathered
 * - IMAGE 3 (Subtle blend): Lush green paddy transplanting layer softly merged
 * - Sky Mist Animation: Independent drifting mist layers strictly masked to the sky
 * - Preserved dark green translucent information branding card
 */
export const LoginHero: React.FC<LoginHeroProps> = ({ entered }) => {
  const { t } = useSettings();

  const features = [
    { icon: CloudOff, label: t.loginHeroFeatureOffline },
    { icon: FileSpreadsheet, label: t.loginHeroFeatureGst },
    { icon: Printer, label: t.loginHeroFeaturePrint },
  ];

  return (
    <div
      className={`login-hero-panel relative isolate w-full overflow-hidden bg-primary-950 transition-opacity duration-700 ease-out h-[38vh] min-h-[270px] max-h-[380px] lg:h-full lg:max-h-none ${
        entered ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden="true"
    >
      {/* ── IMAGE 1: Primary Full-Cover Agricultural Hero Background ───── */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat bg-[center_36%] sm:bg-[center_38%] lg:bg-[center_center]"
        style={{
          backgroundImage: "url('/images/farmer_bullock_ploughing.jpg')",
        }}
      />

      {/* ── IMAGE 3: Soft blended background layer (farmers in paddy field) ── */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-15 mix-blend-screen"
        style={{
          backgroundImage: "url('/images/farmers_rain_field.jpg')",
          maskImage:
            'radial-gradient(ellipse 65% 55% at 85% 65%, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 65% 55% at 85% 65%, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 75%)',
        }}
      />

      {/* ── IMAGE 2: Subtle secondary agricultural detail with feather mask ── */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 hidden h-[40%] w-[45%] bg-cover bg-center opacity-20 mix-blend-soft-light xl:block"
        style={{
          backgroundImage: "url('/images/farmer_close_ploughing.jpg')",
          maskImage:
            'radial-gradient(ellipse 80% 70% at 95% 95%, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 55%, transparent 85%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 70% at 95% 95%, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 55%, transparent 85%)',
        }}
      />

      {/* ── Atmospheric Sky Mist Animation (Strictly Masked to Sky Only) ── */}
      <div className="mist-container">
        <div className="mist-layer mist-layer-1" />
        <div className="mist-layer mist-layer-2" />
        <div className="mist-layer mist-layer-3" />
      </div>

      {/* ── Subtle botanical tint for brand cohesion ─────────────────── */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary-950/40 via-transparent to-primary-900/15" />

      {/* ── Agricultural Branding Panel (Preserved per Requirements) ───── */}
      <div className="absolute inset-x-3 bottom-3 sm:inset-x-6 sm:bottom-6 lg:left-[5%] lg:right-auto lg:bottom-[8%] lg:w-[72%] lg:max-w-[620px] z-20">
        <div
          className="rounded-2xl p-4 sm:p-5 lg:p-6 text-white transition-transform duration-300"
          style={{
            background: 'rgba(0, 55, 50, 0.78)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(193, 230, 186, 0.25)',
            boxShadow: '0 14px 38px rgba(0, 30, 25, 0.35)',
          }}
        >
          {/* Eyebrow badge */}
          <div className="mb-2.5 flex items-center gap-2">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-primary-100/40 bg-primary-500/25 shadow-sm"
              aria-hidden="true"
            >
              <Wheat size={16} className="text-primary-100" />
            </span>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-primary-100">
              {t.loginHeroEyebrow}
            </p>
          </div>

          {/* Heading */}
          <h2 className="font-display text-base font-semibold leading-snug text-white sm:text-xl lg:text-2xl">
            {t.loginHeroTitle}
          </h2>

          {/* Subtitle / Caption */}
          <p className="mt-1 text-xs leading-relaxed text-primary-100/90 sm:text-[13px] hidden sm:block">
            {t.loginHeroCaption}
          </p>

          {/* Feature Badges */}
          <ul className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
            {features.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary-100/35 bg-primary-900/70 px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold text-primary-100 shadow-sm"
              >
                <Icon size={12} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginHero;
