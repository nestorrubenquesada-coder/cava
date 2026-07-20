# Light mode, dark mode, and the mode decision

**Load when:** designing for light or dark mode, deciding whether the product should support one or both, or auditing an existing palette across modes.

## Light mode

### Shadows

- Use them sparingly. Lower opacity, more blur.
- **Rule**: if the first thing you see is the shadow, it's too strong.
- Prefer soft light-gray shadows with high blur, not hard black ones.

### Backgrounds

Avoid pure white. Use very darkened versions of your accent color as the background — the result feels more integrated and professional. Slight tint > absolute white.

### Image overlays

Replace solid overlays with **linear gradients** or **progressive blurs**: the image looks better and the text stays legible.

## Dark mode

### Don't invert light mode

It needs its own palette, not a simple negative.

- Use light gray instead of pure white for body text (reduces eye fatigue).
- Cards and borders need a bit more brightness so they're visible.
- Pure black backgrounds increase contrast with light text and cause halation. Prefer near-black like `#0a0a0a` or a slight cool/warm tint.

### Distance between shades

In dark mode, **double the distance between shades** compared to light mode (from ~2% to 4-6% lightness difference).

Reason: the human eye discriminates much worse between dark tones. Too close together = they all look the same.

### Surfaces lighten as they elevate

In light mode, the closest surface to the user is usually white and backgrounds darken behind it. In dark mode it's **the reverse**: the base background is the darkest, and each elevation level (cards, modals, popovers) is **slightly lighter**.

### Depth without shadows

Shadows barely work in dark mode. Use luminance steps in HSB to create depth: for each level of elevation, increase brightness by **4-6%** and decrease saturation by **10-20%**. This creates visible layering without relying on shadows that disappear against dark backgrounds.

- Generate depth with **stacked cards** of slightly different background colors: same base, adjusting brightness (and sometimes saturation) in steps big enough to distinguish them.
- Low-contrast borders also help separate layers.

## Mono-mode vs dual-mode: what changes based on the decision

Before defining the palette, decide whether the product supports **one mode** (light only or dark only) or **both**. The decision changes cost, token architecture, and several principles in this guide.

### If the system is **mono-mode**

- Colors can be **absolute** (specific hex values like `#1A1A1A`); you don't need abstract semantic tokens.
- **Shadows** work normally in mono-light; replaced by elevation-via-background in mono-dark.
- **Images, illustrations, and icons** are designed for that single context (no variants needed).
- **Logo and brand elements**: a single version.
- **Charts** are calibrated for a single set of backgrounds; colors are picked once and that's it.
- **Low maintenance cost**, simpler design decisions.
- Typical for products with a strong identity: gaming/dev tools (dark only), productivity and traditional banking apps (light only).

### If the system is **dual-mode (light + dark)**

Every color decision doubles. That forces a different architecture:

- **Semantic tokens are mandatory**, not absolute colors. Instead of `color: #1A1A1A`, use `color: var(--text-primary)` that resolves differently per mode.
- **Each token needs two values**: one light, one dark. Naming must be semantic (`--surface-elevated`, `--text-secondary`) and not descriptive (`--gray-900`, `--white`), because "white" and "dark gray" swap roles between modes.
- **Different shade distances per mode**: ~2% in light, 4-6% in dark (see "Distance between shades" above). Not the same scale with inverted values.
- **Images and icons**: often need different versions. SVG icons with `currentColor` self-resolve; PNGs don't.
- **Logo**: if the original has a background or shadows, almost certainly needs a dark mode variant.
- **Shadows in light + elevation-via-background in dark**, coexisting in the same design system.
- **Charts**: using OKLCH is practically mandatory to maintain consistent perceptual brightness across modes; HSL/HSB makes some colors "disappear" or "shout" when the background changes.
- **Default mode**: needs a decision (system preference, light by default, dark by default). Save the user's preference if they change it manually.
- **Double QA**: every new screen tested in both modes. Typical bugs: insufficient contrast, vanishing borders, invisible focus rings, gradients that look dirty in dark.
- **High maintenance cost** but it's the current expectation for modern products, especially productivity, dashboard, and dev tools.

### If the system supports **full theming** (more than two modes)

Some products expose multiple themes (e.g. light, dark, dim, high-contrast, brand variants). Additional implications:

- All tokens must go through an abstraction layer (CSS custom properties, design tokens in JSON).
- **OKLCH scales better than any alternative**: dropping lightness 0.03 and raising chroma 0.02 over neutrals (see Layer 4 — Theming in `color-system.md`) lets you generate new variants without redefining the whole palette.
- Documenting **which token to use for which purpose** becomes critical. Without that, every new feature invents its own colors and theming breaks.
