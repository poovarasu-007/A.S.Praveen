# Changelog

## Unreleased

### Added

- Central three-level botanical design-token system in `src/index.css` and `tailwind.config.js`.
- Shared English/Tamil language switcher available on authentication and authenticated shells.
- Validated `en`/`ta` locale persistence with pre-hydration language application and `Intl` formatters.
- Accessible light botanical authentication, dashboard, billing, catalog, customer, history, reports, backup, user, settings, audit, and print experiences.
- Print-specific botanical application chrome and ink-efficient document rules.
- Design-system and migration documentation.

### Changed

- Replaced the former architectural navy/gold visual layer with the light mint canvas, deep teal brand surfaces, and botanical green accents.
- Updated PWA manifest colors and bumped the service-worker cache to `as-praveen-traders-v2`.
- Kept Dexie schema, persisted enum values, authentication session storage, billing calculations, and existing routes/state navigation intact.

### Fixed

- Database seeding now shares a single initialization promise, so React StrictMode mounts cannot race into duplicate-seed errors on a fresh browser profile.
- Print rules no longer hide document `<header>`/`<footer>` elements inside invoices; only application chrome marked `no-print` is removed.
- New bill lines snapshot the product HSN code so A4/A5 invoices print the real HSN/SAC value; older bills fall back to an em dash instead of a product-id fragment.

### Verification

- `npm run build` passes (`tsc` and `vite build`); `npm run check:i18n` reports 465 English/Tamil keys in parity.
- Browser smoke tests covered every authenticated section in English and Tamil, live language switching, persistence across reload, modal flows, and print format switching.
- Lighthouse accessibility, best-practices, and SEO scores were 1.00 on login and the representative dashboard, audit, settings, and billing views; no browser console errors were observed.
- Vite reports the existing JavaScript chunk-size warning; no build failure.
- No repository test runner, ESLint setup, or physical multi-device/visual-regression lab is present, so those acceptance checks are not claimed.
