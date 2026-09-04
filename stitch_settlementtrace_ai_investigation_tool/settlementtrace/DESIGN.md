---
name: SettlementTrace
colors:
  surface: '#f7f9fc'
  surface-dim: '#d8dadd'
  surface-bright: '#f7f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f7'
  surface-container: '#eceef1'
  surface-container-high: '#e6e8eb'
  surface-container-highest: '#e0e3e6'
  on-surface: '#191c1e'
  on-surface-variant: '#45464e'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f4'
  outline: '#75777f'
  outline-variant: '#c5c6cf'
  surface-tint: '#505e81'
  primary: '#081837'
  on-primary: '#ffffff'
  primary-container: '#1f2d4d'
  on-primary-container: '#8795bb'
  inverse-primary: '#b8c6ee'
  secondary: '#466083'
  on-secondary: '#ffffff'
  secondary-container: '#b9d3fd'
  on-secondary-container: '#415b7f'
  tertiary: '#001c29'
  on-tertiary: '#ffffff'
  tertiary-container: '#003246'
  on-tertiary-container: '#00a0d8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#b8c6ee'
  on-primary-fixed: '#0b1a3a'
  on-primary-fixed-variant: '#384668'
  secondary-fixed: '#d3e3ff'
  secondary-fixed-dim: '#aec8f1'
  on-secondary-fixed: '#001c39'
  on-secondary-fixed-variant: '#2d486a'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#7bd0ff'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#f7f9fc'
  on-background: '#191c1e'
  surface-variant: '#e0e3e6'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
  tabular-nums:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 24px
  margin-screen: 32px
  panel-padding: 24px
  stack-xs: 4px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  stack-xl: 32px
---

## Brand & Style

This design system establishes a restrained, enterprise-grade glassmorphism aesthetic tailored for high-stakes fintech operations. The visual language conveys security, precision, and clarity through translucent frosted panels, layered depth, and subtle glossy edge highlights set against a cool pearl white canvas.

- **Brand Personality:** Analytical, trustworthy, high-performance, authoritative.
- **Target Audience:** Payment support specialists, financial analysts, and fraud investigators handling complex transaction lifecycles.
- **Emotional Response:** Reassurance, focus, absolute control over dense operational data.

## Colors

The palette is anchored by a deep slate blue primary, supported by cool pearl backgrounds and high-clarity status indicators designed for rapid visual parsing of transaction states.

- **Primary:** Deep Slate Blue (`hsl(222, 45%, 35%)`) for primary actions, active states, and key navigational anchors.
- **Secondary:** Muted Steel (`hsl(210, 25%, 48%)`) for secondary UI elements and supporting metadata.
- **Neutral:** Pearl Whites (`hsl(220, 20%, 97%)` to `hsl(210, 30%, 95%)`) for canvas backgrounds, paired with semi-transparent white glass surfaces (`hsla(0, 0%, 100%, 0.65)`).
- **Status Indicators:** Sage green for successful settlements, warm amber for pending reviews, muted coral red for alerts, and deep crimson for critical exceptions.

## Typography

Typography balances clean readability for dense operational data with strict tabular alignment for financial figures. Inter drives structural UI elements, while JetBrains Mono is strictly reserved for transaction IDs, amounts, timestamps, and ledger codes to ensure flawless scanning across investigation workflows.

## Layout & Spacing

A structured 12-column fluid grid system governs the workspace, optimized for desktop-first enterprise operations. The layout prioritizes spatial density without inducing cognitive overload, utilizing consistent 24px gutters and 32px outer margins.

- **Breakpoints:** Desktop (`1280px+`), Laptop (`1024px`), Tablet (`768px`). Mobile viewports are unsupported for core investigative workflows.
- **Grid Behavior:** Fixed-width side navigation with a fluid central investigation canvas that scales gracefully to accommodate multi-pane telemetry and AI trace graphs.

## Elevation & Depth

Depth is rendered through frosted glassmorphism rather than traditional drop shadows. 

- **Surface Layers:** Base canvas sits at ground level. Glass panels (`background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(12px);`) float above with soft, multi-layered depth.
- **Borders & Highlights:** Panels feature a subtle 1px gradient border (`linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.1))`) to catch simulated top-down light, establishing clear structural separation without harsh visual weight.

## Shapes

A refined, moderately rounded shape language communicates modern enterprise stability.

- **Border Radius:** Standard containers and glass panels use `0.5rem` (`8px`) to `0.75rem` (`12px`) radii. Interactive controls (buttons, inputs) utilize `0.375rem` (`6px`) for a crisp, professional finish. Pill shapes are strictly reserved for status badges and categorical tags.

## Components

- **Buttons:** Primary buttons use solid deep slate blue with subtle inset highlights. Secondary and ghost variants adopt translucent glass fills with crisp 1px borders that shift to primary accent on hover.
- **Input Fields:** Semi-opaque glass wells with inner shadows, clear monospaced text for data entry, and distinct focus rings in primary accent.
- **Cards & Panels:** The foundational building block. Frosted glass containers housing distinct settlement trace modules, featuring sticky header zones and subtle bottom-edge accent lines for status.
- **Chips & Badges:** Pill-shaped indicators combining soft status backgrounds (sage, amber, coral) with dark monospaced labels for instant state recognition.
- **Tables & Lists:** High-density data grids with alternating row opacities, sticky headers with backdrop blur, and right-aligned tabular numerals for all currency and ledger values.
- **Checkboxes & Radios:** Clean geometric controls with subtle inner fill gradients when active.
- **AI Trace Timeline:** A specialized component mapping transaction hops across gateway, ledger, and bank partners using connected glass nodes and status-colored connector lines.