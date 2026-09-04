---
name: Warga Kebonjati Community OS
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#434655'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#006242'
  on-tertiary: '#ffffff'
  tertiary-container: '#007d55'
  on-tertiary-container: '#bdffdb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  max-width: 1280px
---

## Brand & Style

The design system is anchored in the principles of civic trust, clarity, and inclusivity. As a public service portal, the interface prioritizes function over flourish, utilizing a refined **Minimalist** aesthetic that ensures residents of all ages—including elderly users—can navigate municipal services without cognitive overload.

The visual narrative is built on "Invisible Design": the interface recedes to let the information and actions take center stage. High legibility, generous touch targets, and a systematic use of whitespace create a calm, reliable environment. The emotional response should be one of stability and efficiency, transforming complex government interactions into a modern, frictionless experience.

## Colors

The palette is grounded in a "Clean Slate" philosophy. We use a range of Zinc and Slate grays to establish a structured, professional hierarchy.

- **Primary (#2563eb):** A dependable Blue used exclusively for primary calls-to-action and active states to guide the user's eye.
- **Surface & Backgrounds:** We utilize `#f8fafc` for the main canvas and white (`#ffffff`) for elevated cards to create subtle contrast without harsh lines.
- **Functional Colors:** Emerald is reserved for success confirmations and "Approved" statuses. Rose is used sparingly for errors and critical alerts.
- **Contrast:** A minimum contrast ratio of 4.5:1 is maintained for all text-to-background pairings to ensure readability for users with visual impairments.

## Typography

This design system uses **Inter** for its exceptional legibility and neutral, systematic tone. To accommodate elderly users, the base body size is set at a generous `18px` for primary content.

- **Scale:** We utilize a tight typographic scale to prevent visual noise. 
- **Hierarchy:** Bold weights are used for headlines to provide clear landmarks. 
- **Accessibility:** Line heights are intentionally loose (1.5x to 1.6x) to prevent lines of text from blurring together during reading. 
- **Mobile:** Headlines scale down on mobile to prevent awkward line breaks while maintaining a clear distinction from body text.

## Layout & Spacing

The layout follows a **Fluid-to-Fixed Grid** model. Content is contained within a 12-column grid on desktop with a maximum width of 1280px, ensuring line lengths remain comfortable for reading.

- **Spacing Rhythm:** We use an 8px base unit. 
- **Spaciousness:** Generous margins (`lg` and `xl`) are used between major sections to reduce "information density," which can be overwhelming for some users.
- **Touch Targets:** All interactive elements maintain a minimum hit area of 48x48px.
- **Breakpoints:**
  - **Mobile:** 0-599px (4 columns, 16px margins).
  - **Tablet:** 600-1023px (8 columns, 24px margins).
  - **Desktop:** 1024px+ (12 columns, 40px margins).

## Elevation & Depth

This design system employs **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows to convey depth. This ensures the UI feels lightweight and modern.

- **Surface Levels:** 
  - Level 0: The background slate (`#f8fafc`).
  - Level 1: White cards (`#ffffff`) with a subtle 1px border (`#e2e8f0`).
- **Interaction States:** Instead of deep shadows, interactive elements use a 2px "Focus Ring" with a 2px offset in the Primary Blue.
- **Depth:** Occasional soft, ambient shadows (Blur 12px, Opacity 5%, Color #000) are used only for floating elements like modals or dropdowns to separate them from the primary page flow.

## Shapes

The shape language is **Soft** and approachable. We avoid sharp corners to maintain a friendly, community-oriented feel, but we also avoid hyper-rounded "pill" shapes to keep the aesthetic professional and civic.

- **Standard Elements:** Buttons, input fields, and cards use a `0.25rem` (4px) radius.
- **Large Containers:** Modals and large content sections use a `rounded-lg` (8px) radius to soften the visual impact.

## Components

### Buttons
Primary buttons use the Primary Blue background with white text. To ensure accessibility, they feature a minimum height of 48px. Secondary buttons use a Slate-100 background or a simple outline. Focus states are mandatory, appearing as a clear blue ring.

### Input Fields
Inputs are large, featuring 16px internal padding and clear labels positioned above the field. Errors are signaled by both a 2px Rose border and an accompanying error message icon for color-blind accessibility.

### Cards
Cards are the primary container for services (e.g., "Pay Taxes," "Report Issue"). They use a white background, a subtle gray border, and transition to a slightly thicker border on hover to indicate interactivity.

### Lists
Lists are designed with high vertical padding (16px - 24px per row) and clear dividers. For data-heavy views, alternating row tints are used to help users track information across the screen.

### Feedback Toasts
Success and error notifications appear at the top-right of the interface. They use solid color backgrounds (Emerald for success, Rose for error) to ensure they are unmissable, even for users with low-tech literacy.