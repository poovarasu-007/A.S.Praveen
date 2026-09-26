# A.S. Praveen Traders Botanical Design System

## Principles

- Calm, spacious, high-readability agricultural interface.
- Light botanical canvas by default; deep teal is reserved for strong brand/navigation surfaces.
- Semantic status colors are never used as decoration.
- English and Tamil share the same LTR layout and use Unicode-capable fonts.
- Motion is functional and disabled/reduced under `prefers-reduced-motion`.

## Primitive colors

| Token | Value | Use |
| --- | --- | --- |
| `--color-primary-900` | `#023337` | Deep brand/navigation |
| `--color-primary-800` | `#124B46` | Brand hover/raised dark surface |
| `--color-primary-700` | `#216454` | Dark botanical support |
| `--color-primary-600` | `#348667` | Dark green support |
| `--color-primary-500` | `#4DA674` | Main botanical green |
| `--color-primary-400` | `#70B987` | Hover/highlight |
| `--color-primary-300` | `#91C99A` | Input hover |
| `--color-primary-200` | `#B0DDAA` | Card hover border |
| `--color-primary-100` | `#C1E6BA` | Soft selection/accent |
| `--color-primary-50` | `#EAF8E7` | Pale mint surface |
| `--color-secondary-700` | `#287056` | Link/secondary action |
| `--color-secondary-600` | `#388A64` | Success |
| `--color-bg-default` | `#E3F5DD` | Page canvas |
| `--color-bg-surface` | `#FFFFFF` | Cards/forms |
| `--color-bg-elevated` | `#EAF8E7` | Secondary surface |
| `--color-bg-card-hover` | `#F3FAF0` | Card hover |
| `--color-text-primary` | `#023337` | Main text |
| `--color-text-secondary` | `#28564B` | Supporting text |
| `--color-text-tertiary` | `#55766A` | Metadata |
| `--color-border` | `#C1E6BA` | Default border |
| `--color-focus` | `#4DA674` | Focus ring |
| `--color-error` | `#B42318` | Error only |
| `--color-warning` | `#B7791F` | Warning only |
| `--color-success` | `#388A64` | Success only |

## Semantic and component aliases

`src/index.css` defines three levels:

1. Primitive `--color-primary-*`, `--color-secondary-*` values.
2. Semantic `--color-bg-*`, `--color-text-*`, `--color-border-*`, and status values.
3. Component values such as `--button-primary-bg`, `--card-bg`, `--input-border`, and `--sidebar-bg`.

Tailwind exposes matching `primary`, `secondary`, `surface`, `text`, `border`, and `status` utilities. Legacy agricultural aliases are compatibility mappings only.

## Typography

- Body: `Noto Sans Tamil`, `Inter`, `Manrope`, system UI, sans-serif.
- Display: `Playfair Display`, Georgia, serif; Tamil text falls back to the body font when glyphs are unavailable.
- Labels: short, readable, sentence case where possible; avoid forcing uppercase on Tamil.
- Minimum normal text target: WCAG AA (4.5:1).

## Components

### Buttons

- Primary: deep teal background, white text.
- Secondary: botanical green background, white text.
- Light: pale mint background, deep teal text.
- Ghost: transparent with mint hover.
- All buttons use the 180ms botanical easing and a visible 2px focus outline.

### Forms

Inputs use white surfaces, botanical borders, `#4DA674` focus borders, and a three-pixel translucent green focus ring. Error and success states add an icon/message in addition to color.

### Cards and tables

Cards are white, 18–20px radius, with a subtle deep-teal shadow. Tables use a pale mint header, white rows, and a mint hover row. Wide tables scroll horizontally instead of clipping Tamil text.

### Navigation

Desktop/mobile navigation uses deep teal with white text, mint hover, and a soft-green active state. Active items expose `aria-current="page"`.

### Feedback

Success, warning, and error use dedicated semantic backgrounds and borders. Toasts and inline alerts include text and/or an icon; color is never the only signal.

## Internationalization

- Supported codes: `en` and `ta` only.
- Default: English (`en`).
- Preference key: `as_praveen_language` in `localStorage`.
- `index.html` applies the saved language and `dir="ltr"` before React mounts.
- `SettingsContext` updates `document.documentElement.lang`, `dir`, and the document title.
- `src/utils/i18n.ts` centralizes `Intl.NumberFormat`, `Intl.DateTimeFormat`, locale mapping, interpolation, safe storage access, and display labels for persisted payment/unit/category enums.
- English/Tamil dictionary parity is checked in development; missing keys are warned rather than silently falling back.
- User-entered product/customer names, IDs, GSTINs, URLs, and codes are not translated.

## Accessibility

- Semantic headings, labels, dialog roles, `aria-modal`, and keyboard handlers.
- Visible focus is never removed.
- `forced-colors` and reduced-motion media queries are supported.
- Form validation uses text and icons, not color alone.

## Print

`@media print` removes application chrome, uses high-contrast black on white, hides shadows, and keeps invoice paper dimensions. A4 and 80mm previews remain separate from the interactive UI.

## Do not use

Do not introduce the former architectural navy colors (`#011425`, `#081E2E`, `#0D2438`, `#1F4959`, `#5C7C89`), purple/neon gradients, rainbow chart palettes, or arbitrary saturated colors. Use semantic tokens and reserve warning/error colors for their states.
