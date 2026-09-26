# Theme Migration Plan

## Project audit

- **Runtime:** React 18 + TypeScript + Vite 5.
- **State/persistence:** React state plus Dexie/IndexedDB. No API or router migration is required.
- **Styling:** Tailwind CSS 3 with a central `src/index.css` token layer.
- **Authentication:** Existing `AuthContext`; persisted session key remains `as_praveen_auth_session`.
- **Internationalization:** Existing `SettingsContext` and `src/utils/translations.ts`, extended with typed locale helpers in `src/utils/i18n.ts`.
- **Testing:** The repository has no test runner or lint script. `npm run build` is the available automated gate; browser Lighthouse is used for accessibility checks.

## Migration map

| Previous visual | New token/role |
| --- | --- |
| Architectural navy backgrounds | `--color-primary-900` / `--color-primary-800` |
| Slate architectural text | `--color-text-secondary` / `--color-text-tertiary` |
| Agricultural green | `--color-primary-500` / `--color-secondary-600` |
| Gold accent | `--color-primary-100` / `--color-primary-300` |
| Grey utility backgrounds | `--color-bg-elevated` / `--color-bg-card-hover` |
| Error red | `--color-error` and `--color-error-bg` only |
| Warning amber | `--color-warning` and `--color-warning-bg` only |

The old Tailwind aliases (`agri-*`, `navy-*`, `deep-*`, `charcoal-*`) remain only as compatibility mappings and resolve to botanical values. They are not a second visual system.

## Delivery checkpoints

1. **Tokens:** centralize primitive, semantic, and component variables in `src/index.css`; expose matching Tailwind utilities in `tailwind.config.js`.
2. **Shell:** migrate header, sidebar, footer, offline/backup banners, authentication, and dialogs to shared botanical classes and visible focus states.
3. **Billing:** preserve all existing handlers, shortcuts, GST calculations, bill numbering, IndexedDB writes, and print flows while changing presentation only.
4. **Feature views:** migrate dashboard, products, customers, history, reports, backup, users, settings, and audit views to semantic surfaces and locale-aware formatters.
5. **Print:** keep invoice dimensions and document readability; use black/white print-specific rules and locale-aware labels.
6. **Validation:** build, browser smoke test, Lighthouse accessibility, keyboard review, and responsive inspection at 320/768/1024/1440/1920 CSS pixels (the last item remains a manual/device-lab check in this repository).

## Data and rollback safety

- No Dexie schema version, enum value, bill field, customer field, authentication key, or user data is changed by the visual migration.
- The service-worker cache is versioned (`as-praveen-traders-v2`) so the new document and hashed assets are delivered after deployment.
- Roll back with a Git revert or the previous deployment. This does not require a database migration or data rollback.

## Known non-functional risks

- Tamil labels are longer than English labels; tables use horizontal scrolling and compact controls at narrow widths.
- The current production bundle is approximately 512 kB before gzip and triggers Vite's existing chunk-size warning. Code splitting can be handled separately without changing billing behavior.
- External payment/social/map providers would need their own supported theme API; this repository currently has no such embed.
