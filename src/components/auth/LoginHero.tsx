import React from 'react';
import { CloudOff, FileSpreadsheet, Printer, Wheat } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface LoginHeroProps {
  /** Fades the photograph in once, without any looping movement. */
  entered: boolean;
}

/**
 * Agricultural photograph panel for the authentication screen.
 *
 * The photograph is meaningful content (it establishes the farming context of
 * the product), so it ships a localized `alt` text instead of being marked as
 * decorative. Responsive WebP variants keep the above-the-fold hero light on
 * mobile; the JPEG original is only used as a `<picture>` fallback.
 */
export const LoginHero: React.FC<LoginHeroProps> = ({ entered }) => {
  const { t } = useSettings();

  const features = [
    { icon: CloudOff, label: t.loginHeroFeatureOffline },
    { icon: FileSpreadsheet, label: t.loginHeroFeatureGst },
    { icon: Printer, label: t.loginHeroFeaturePrint },
  ];

  return (
    <div className="relative isolate h-[200px] w-full overflow-hidden bg-primary-900 sm:h-[260px] lg:h-screen lg:w-auto">
      <picture>
        <source media="(max-width: 639px)" srcSet="/images/login-farm-mobile.webp" type="image/webp" />
        <source media="(min-width: 640px) and (max-width: 1023px)" srcSet="/images/login-farm-tablet.webp" type="image/webp" />
        <source media="(min-width: 1024px)" srcSet="/images/login-farm-desktop.webp" type="image/webp" />
        <img
          src="/images/login-farm-fallback.jpg"
          alt={t.loginImageAlt}
          width={1800}
          height={1005}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className={`h-full w-full object-cover object-[50%_38%] transition-opacity duration-500 ease-out sm:object-[50%_42%] lg:object-[52%_50%] ${
            entered ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </picture>

      {/* Very light botanical wash so the photograph integrates with the theme
          without dimming the farming subjects. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,51,55,0.12),rgba(78,166,116,0.08))]"
      />

      {/* Caption sits in a compact translucent card so its contrast never
          depends on the brightness of the photograph behind it. */}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 lg:p-10">
        <div className="max-w-lg rounded-2xl border border-primary-100/30 bg-primary-900/80 p-4 shadow-soft-lg backdrop-blur-[3px] sm:p-5 lg:p-6">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary-100/40 bg-primary-500/25" aria-hidden="true">
              <Wheat size={18} className="text-primary-100" />
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-100">
              {t.loginHeroEyebrow}
            </p>
          </div>

          <h2 className="font-display text-lg font-semibold leading-snug text-white sm:text-xl lg:text-2xl">
            {t.loginHeroTitle}
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-primary-100 sm:text-[13px]">
            {t.loginHeroCaption}
          </p>

          <ul className="mt-3 flex flex-wrap gap-1.5">
            {features.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary-100/35 bg-primary-800/70 px-2.5 py-1 text-[10px] font-semibold text-primary-100 sm:text-[11px]"
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
