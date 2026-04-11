# The Curated Canvas

## 1. North Star

This design system is built around **The Curated Canvas**.

The goal is not to make ticketing feel like a dashboard template. It should feel premium, editorial, and atmospheric: equally credible for a black-tie gala, a festival, or a fashion event.

Core principles:

- Use **tonal layering** instead of hard boxes.
- Let **imagery and depth** do the work instead of divider lines.
- Keep the interface **calm, dark, and spacious**.
- Use accent color with restraint so high-intent actions feel valuable.

This is a **dark-only** system. The runtime sets `data-theme="dark"` and there is no user-facing theme switcher.

---

## 2. File Structure

The design system is implemented in layered CSS and thin React wrappers:

- `src/design-system/styles/tokens.css`: theme tokens and CSS variables
- `src/design-system/styles/base.css`: base element styles, focus states, skip link
- `src/design-system/styles/components.css`: semantic utility classes and component primitives
- `src/components/ui/Button.tsx`: button wrapper
- `src/components/ui/FormField.tsx`: form field wrapper
- `src/lib/motion.ts`: shared Framer Motion settings

`src/index.css` is only the import hub.

---

## 3. Token Reference

### Color palette

| Token | Value | Usage |
| --- | --- | --- |
| `--ds-background` | `#131313` | Global page background |
| `--ds-surface` | `#131313` | Page canvas |
| `--ds-surface-container-low` | `#181818` | Secondary sections |
| `--ds-surface-container` | `#1e1e1e` | Standard cards and panels |
| `--ds-surface-container-high` | `#242424` | Floating panels |
| `--ds-surface-container-highest` | `#2e2e2e` | Focused interactive surfaces |
| `--ds-surface-container-lowest` | `#0f0f0f` | Wells, inset areas, map shells |
| `--ds-surface-bright` | `#1a1a1a` | Slightly elevated neutral surface |
| `--ds-surface-variant` | `#2a2826` | Glass backgrounds |
| `--ds-surface-dim` | `#141414` | Dimmed base surface |
| `--ds-primary` | `#dfcd72` | Primary actions, prestige accents |
| `--ds-on-primary` | `#1a1816` | Text/icons on primary surfaces |
| `--ds-primary-gradient-end` | `#8a7f46` | Primary gradient end |
| `--ds-primary-container` | `#8a7f46` | Darker primary-toned container |
| `--ds-secondary` | `#9064f6` | Secondary support accent |
| `--ds-tertiary` | `#1f6fe0` | Cool informational accent |
| `--ds-error` | `#ad3f3f` | Error and destructive emphasis |
| `--ds-on-error` | `#ffffff` | Text/icons on error surfaces |
| `--ds-on-surface` | `#e5e2e1` | Primary text |
| `--ds-on-surface-variant` | `#9a9694` | Muted text |
| `--ds-outline-variant` | `#5c5957` | Ghost borders and low-emphasis outlines |

### Reusable color-mix tokens

These exist to prevent inline `color-mix(...)` values inside JSX:

| Token | Purpose |
| --- | --- |
| `--ds-ghost-border` | Low-contrast containment border |
| `--ds-border-subtle` | Section and footer borders |
| `--ds-input-border` | Default bottom input border |
| `--ds-primary-wash` | Soft primary glow/wash |
| `--ds-primary-wash-strong` | Stronger primary glow/wash |
| `--ds-primary-wash-solid` | Primary-tinted surface fill |
| `--ds-primary-tint` | Strong primary highlight fill |
| `--ds-primary-border` | Primary accent border |
| `--ds-primary-border-strong` | Hover/focus accent border |
| `--ds-primary-ring` | Selected/focused primary ring |
| `--ds-primary-ring-soft` | Subtle primary ring |
| `--ds-primary-glow` | Primary glow shadow |
| `--ds-primary-focus` | Global focus outline |
| `--ds-primary-selection` | Text selection highlight |
| `--ds-tertiary-wash` | Soft tertiary glow/wash |
| `--ds-tertiary-wash-strong` | Strong tertiary glow/wash |
| `--ds-tertiary-border` | Tertiary accent border |
| `--ds-tertiary-ring` | Tertiary state ring |
| `--ds-tertiary-ring-strong` | Strong tertiary ring |
| `--ds-on-surface-emphasis` | Elevated muted text emphasis |
| `--ds-on-primary-muted` | Muted text on primary gradient |
| `--ds-on-primary-soft` | Soft translucent fill on primary |
| `--ds-on-primary-soft-muted` | Softer translucent fill on primary |
| `--ds-ticket-panel-fill` | Ticket panel glass fill |
| `--ds-ticket-panel-inner` | Inner ticket panel tonal layer |

### Material 3 role mapping (adopted)

The current token model maps directly to Material 3 role intent:

- surfaces: `--ds-background`, `--ds-surface`, `--ds-surface-container-*`, `--ds-surface-variant`
- on-color text: `--ds-on-surface`, `--ds-on-surface-variant`, `--ds-on-primary`, `--ds-on-error`
- boundaries: `--ds-outline-variant`, plus derived borders like `--ds-ghost-border` and `--ds-input-border`
- key roles: `--ds-primary`, `--ds-secondary`, `--ds-tertiary`, `--ds-error`
- state layers/rings: `--ds-primary-wash*`, `--ds-tertiary-wash*`, `--ds-primary-ring*`, `--ds-primary-focus`

### Typography scale

Display and heading text use **Manrope**. Body and labels use **Inter**.

#### Display scale

| Token | Value | Usage |
| --- | --- | --- |
| `--ds-display-hero-size` | `clamp(2.25rem, 1.81rem + 1.9vw, 3.5rem)` | Hero headline |
| `--ds-display-lg-size` | `clamp(2rem, 1.56rem + 1.9vw, 3.75rem)` | Main section titles |
| `--ds-display-md-size` | `clamp(1.875rem, 1.6rem + 1.2vw, 3rem)` | Medium section titles |
| `--ds-display-sm-size` | `clamp(1.5rem, 1.35rem + 0.65vw, 2.25rem)` | Compact display text, success states |

#### Heading and body scale

| Token | Value | Usage |
| --- | --- | --- |
| `--ds-heading-lg-size` | `1.5rem` | Card titles |
| `--ds-heading-md-size` | `1.25rem` | Subtitles, compact cards |
| `--ds-heading-sm-size` | `1rem` | Small headings |
| `--ds-body-lg-size` | `1.25rem` | Lead copy |
| `--ds-body-md-size` | `1.125rem` | Standard body |
| `--ds-body-sm-size` | `0.875rem` | Helper text, nav links, lists |
| `--ds-label-sm-size` | `0.625rem` | Micro labels |

Use the semantic classes instead of assembling ad-hoc font stacks:

- `.ds-display-hero`
- `.ds-display-lg`
- `.ds-display-md`
- `.ds-display-sm`
- `.ds-heading-lg`
- `.ds-heading-md`
- `.ds-heading-sm`
- `.ds-body-lg`
- `.ds-body-md`
- `.ds-body-sm`
- `.ds-label`
- `.ds-label-sm`

### Radius

| Token | Value | Usage |
| --- | --- | --- |
| `--ds-radius-functional` | `0.375rem` | Buttons and small controls |
| `--ds-radius-structural` | `0.75rem` | Cards and panels |
| `--ds-radius-pill` | `9999px` | Chips and pills |

### Elevation

| Token | Value | Usage |
| --- | --- | --- |
| `--ds-shadow-ambient` | `0 32px 56px -16px rgb(var(--ds-shadow-rgb) / 0.07)` | Default cards |
| `--ds-shadow-ambient-lg` | `0 40px 64px -18px rgb(var(--ds-shadow-rgb) / 0.1)` | Hovered cards |
| `--ds-shadow-ambient-sm` | `0 24px 48px -14px rgb(var(--ds-shadow-rgb) / 0.06)` | Softer floating panels |

### Motion

| Token | Value |
| --- | --- |
| `--ds-duration-fast` | `150ms` |
| `--ds-duration-normal` | `300ms` |
| `--ds-duration-slow` | `500ms` |
| `--ds-duration-slower` | `800ms` |
| `--ds-ease-default` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--ds-ease-out` | `cubic-bezier(0, 0, 0.2, 1)` |
| `--ds-ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` |

Framer Motion equivalents live in `src/lib/motion.ts` as `dsMotion`.

### Z-index

| Token | Value | Usage |
| --- | --- | --- |
| `--z-navbar` | `50` | Fixed header |
| `--z-dropdown` | `60` | Mobile menus |
| `--z-tooltip` | `70` | Tooltips and skip link |

---

## 4. Surface and Boundary Rules

### The No-Line rule, clarified

Do **not** use borders to define major page sections.

Use:

- alternating surfaces (`surface` vs `surface-container-low`)
- tonal wells (`surface-container-lowest` inside `surface-container-low`)
- glow, blur, and spacing

You **may** use borders for containment at the element level:

- ghost borders on cards, chips, and glass elements
- low-contrast outlines for accessibility and separation

That means this is valid:

- `.ds-ghost-border` on a chip, card, or floating panel

This is not:

- a 1px divider line separating full-width sections

### Layering rules

| Context | Recommended surface |
| --- | --- |
| Page canvas | `--ds-surface` |
| Alternate section | `--ds-surface-container-low` |
| Standard card | `--ds-surface-container` |
| Elevated floating item | `--ds-surface-container-high` |
| Active/focused inner control | `--ds-surface-container-highest` |
| Inset well or recessed map area | `--ds-surface-container-lowest` |

### Glass and gradients

Use `.ds-glass` for nav and floating overlays. It applies:

- 50% `surface-variant`
- `backdrop-filter: blur(20px)`

Use `.ds-gradient-primary` or `var(--ds-primary-gradient)` for premium CTA fills and highlight tiles.

Use `.ds-gradient-primary-text` for premium emphasis text.

---

## 5. Layout System

### Section primitives

Default section structure:

```tsx
<section className="ds-section bg-[var(--ds-surface)]">
  <div className="ds-section-inner">{/* content */}</div>
</section>
```

Available layout primitives:

- `.ds-section`: default vertical spacing and page gutter
- `.ds-section-inner`: default max width (`80rem`)
- `.ds-section-hero`: hero-specific top/bottom spacing
- `.ds-section-footer`: footer-specific spacing

### Spacing rules

| Token | Value |
| --- | --- |
| `--ds-page-gutter` | `1.5rem` |
| `--ds-section-padding-y` | `5rem` |
| `--ds-section-padding-y-md` | `7rem` |

Use these as the default rhythm for landing and marketing sections. Narrower containers such as contact cards or roadmap wrappers can intentionally override width.

---

## 6. Component Catalog

### Buttons

Base class:

- `.ds-btn`

Variants:

- `.ds-btn-primary`
- `.ds-btn-ghost`
- `.ds-btn-secondary`

Sizes:

- `.ds-btn-sm`
- `.ds-btn-md`
- `.ds-btn-lg`

Wrapper:

- `src/components/ui/Button.tsx`

API:

```tsx
<Button variant="primary" size="lg" icon={<ArrowRight size={20} />}>
  Начать работу
</Button>
```

States covered:

- default
- hover
- active
- disabled
- loading
- keyboard focus via global `:focus-visible`

### Inputs

Base class:

- `.ds-input-field`

Behavior:

- bottom-border only by default
- surface lift on focus
- primary bottom-border on focus
- secondary border on invalid state

Error state:

- `.ds-input-field[aria-invalid='true']`

Wrapper:

- `src/components/ui/FormField.tsx`

API:

```tsx
<FormField id="email" label="Email" error={formErrors.email}>
  <input type="email" value={value} onChange={...} />
</FormField>
```

### Chips and accents

Use:

- `.ds-chip` for pill shape
- `.ds-label` for uppercase label typography
- `.ds-accent-primary`
- `.ds-accent-secondary`
- `.ds-accent-tertiary`

Recommended pattern:

```tsx
<div className="inline-flex items-center gap-2 px-4 py-2 ds-accent-primary ds-chip ds-label">
  ...
</div>
```

### Cards

Use:

- `.ds-card` for default ambient depth
- `.ds-card-soft` for lighter floating depth
- `.ds-card-hover` when hover elevation should increase
- `.ds-ghost-border` when the card needs containment

### Icons

Use:

- `.ds-icon-primary`
- `.ds-icon-secondary`
- `.ds-icon-tertiary`

These provide tinted backgrounds and foreground color pairing.

### Specialized ticket and seat primitives

Use:

- `.ds-ticket-panel`
- `.ds-seat-free`
- `.ds-seat-free-vip`
- `.ds-seat-free-cool`
- `.ds-seat-sold`

These are app-level seat states for consumer-facing surfaces. The editor/viewer packages consume the same palette through their `--seatmap-*` bridge tokens, not by importing app CSS directly.

Seat selection behavior must use:

- `role="group"` on the seat region
- `role="option"` on seat controls
- `aria-selected` on chosen seats
- descriptive `aria-label` including row, seat, section, price, and state

---

## 7. Motion System

All motion should use `src/lib/motion.ts`.

### Shared config

- `dsMotion.duration.fast`
- `dsMotion.duration.normal`
- `dsMotion.duration.slow`
- `dsMotion.duration.slower`
- `dsMotion.ease.default`
- `dsMotion.ease.out`
- `dsMotion.ease.inOut`
- `dsMotion.spring.default`
- `dsMotion.spring.crisp`
- `dsMotion.spring.snappy`
- `dsMotion.spring.settle`
- `dsMotion.spring.smooth`
- `dsMotion.stagger.default`
- `dsMotion.stagger.tight`
- `dsMotion.stagger.bars`
- `withReducedMotion()`

### Rules

- Respect `prefers-reduced-motion` in all decorative or looping animation.
- Use springs for UI confirmation and selection transitions.
- Use eased opacity/position transitions for section entrance.
- Keep looping float motion subtle and slow.
- Avoid dramatic rotation or aggressive scaling outside hero storytelling.

---

## 8. Accessibility Rules

- Always preserve visible keyboard focus.
- Use the `.ds-skip-link` at the top level.
- Prefer semantic wrappers (`Button`, `FormField`) over custom ad-hoc controls.
- Form validation must expose errors via `aria-describedby`.
- Success and error messages must be announced with `role="status"` and `aria-live="polite"`.
- Selected states in collections should use `aria-selected`, not `aria-pressed`.
- Avoid using accent color as the sole signal; pair it with text, icon, or state shape.

---

## 9. Implementation Rules

### Do

- Use semantic classes instead of rebuilding styles inline.
- Prefer token-backed CSS variables over inline `color-mix(...)`.
- Use `ds-section` and `ds-section-inner` for section rhythm.
- Use `.ds-display-*`, `.ds-heading-*`, `.ds-body-*`, and `.ds-label*` for typography.
- Keep contrast calm but readable: muted text should remain clearly legible on dark surfaces.
- Keep seatmap integration on semantic token bridges (`--seatmap-*` defaults resolving from `--ds-*`).

### Don’t

- Don’t reintroduce legacy aliases like `--text-color`, `--text-muted`, or `--bg-color`.
- Don’t define new one-off font stacks or arbitrary type ramps inside JSX.
- Don’t use full-width divider lines to separate sections.
- Don’t add motion values ad hoc when `dsMotion` already provides an equivalent.
- Don’t inline `color-mix(...)` in component class strings unless you are adding a new reusable token immediately after.
- Don’t couple shared seatmap packages to app CSS file imports.

---

## 10. Extension Guidance

This system is intentionally built for **marketing pages plus light product surfaces** such as event pages, seat-picking, checkout steps, and simple dashboards.

When extending it:

1. Add new tokens before adding new one-off values.
2. Add semantic classes before adding repetitive inline utilities.
3. Add thin React wrappers only for patterns with real accessibility or API value.
4. Keep the aesthetic consistent: restrained accents, dark surfaces, editorial spacing, and premium restraint.
