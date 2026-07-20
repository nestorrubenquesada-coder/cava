# Color and color theory

**Load when:** defining or auditing a color palette, picking brand colors, building a token system, designing for theming, or choosing chart series colors.

## 60-30-10 — starter heuristic, not a system

- **60%** neutral, **30%** secondary color, **10%** accent.
- Icons **shouldn't carry color** unless they communicate state.
- **Important**: 60-30-10 helps avoid chaotic palettes in small projects or for beginners, but **it's insufficient for product design**. A real app needs background layers, multiple shades per functional color, and theming. For product, use the 4-layer system below.

## Avoid AI-generated "bright" palettes

AI tools often default to high-saturation, high-contrast color combinations that lack harmony — loud blues, purples, and greens that scream "generated." For professional SaaS and product UI:

- **Shift to muted, desaturated palettes.** Deep greens, slate blues, warm grays with subtle color undertones read as intentional and human-designed.
- **Color should indicate information, not decorate.** In dashboards, reserve color for data in charts, status indicators, and actionable elements. Neutral surfaces everywhere else. If everything is colorful, nothing communicates.
- The test: if you remove all color from the page and it still reads (hierarchy, grouping, structure are clear), the color was used well. If removing color makes it unreadable, color was doing structural work it shouldn't have been.

## The 4-layer system (recommended for product)

A more complete and professional approach for web apps and dashboards. Replaces 60-30-10 when the project moves from mockup to real product.

### Layer 1 — Neutral foundation

The product's structure: backgrounds, strokes, and text. If this layer is wrong, no color on top can save it.

- **Backgrounds**: in a web app, aim for **4 background levels** (from lowest to most elevated) to create depth without shadows. Use neutral grays (e.g. `#f0f0f0` canvas, `#f9f9f9` cards). To add subtle grouping without visible borders, tint secondary containers with a very low-opacity brand color (e.g. `rgba(brand, 0.05)`).
- **Strokes**: at least **1-2 strokes** to define edges. **Never use pure black**: ~85% white gives visible edges without harshness. If an element doesn't need a background to be grouped, a simple `border: 1px solid #e0e0e0` often works better than a filled container.
- **Text**:
  - Headings: strong dark (~10% white or less on white background).
  - Body: **15-20%** white over the background (e.g. gray ~#333 in light mode).
  - Subtext / metadata: **30-40%** white (e.g. gray ~#666-#999).

### Layer 2 — Functional accent

The brand color or primary action color, **but as a scale, not a single value**.

- Define a full scale (e.g. 50-950) instead of a single hex.
  - **500-600**: primary elements (primary buttons, active links).
  - **700**: hover.
  - Lighter tones for subtle backgrounds of the color, darker for press/active.
- In **dark mode**, **double the distance between shades** (from ~2% to 4-6%) because the human eye discriminates worse between dark tones — too close together, they all look the same.
- **Surfaces lighten as they elevate**: closer to the user in visual hierarchy = lighter background (opposite of light mode, where it's the reverse).

### Layer 3 — Semantic communication

Colors that **communicate meaning**, independent of the brand palette.

- Red = destructive / error. Green = success. Yellow / amber = warning. Blue = info.
- Don't replace these with the brand color even if tempted: users read the meaning before the aesthetic.
- **For charts and data visualization**: use the **OKLCH** palette to achieve consistent perceptual brightness across series.
  - Fix `lightness` and `chroma` constant, increment `hue` in steps of **25-30** to generate the color series.
  - This avoids the classic RGB/HSL problem where some colors look much brighter than others with the same numeric values.

### Layer 4 — Theming

If you need multiple themes (light/dark, or color variants per section/brand), OKLCH makes it efficient:

- Take your neutral colors, **drop `lightness` ~0.03** and **raise `chroma` ~0.02**.
- That "pushes" the palette toward a tint (red, green, blue, etc.) while keeping the foundation structure intact.
- Result: themes that share DNA, not disconnected palettes.

## HSB > HEX (for mockups and rapid exploration)

- For designing and exploring, work in **HSB (Hue, Saturation, Brightness)**: it gives intuitive control over brightness and saturation.
- To produce variants from a base color: **+20 saturation, -10 brightness**, or rotate the hue slightly for harmonics.
- **Hue shifting for depth:** shift hue toward blue (lower hue values) for elements that should feel darker or recessed (shadows, backgrounds, folders). Shift toward yellow/red (higher hue values) for elements that should feel lighter or elevated. This creates more sophisticated color relationships than just adjusting brightness alone.
- For serious product systems: switch to **OKLCH** (perceptually uniform) when defining tokens and final scales.

## Neutral balance

- Avoid bright colors in backgrounds. Start with neutral grays.
- Try subtle tints of your brand color in the neutrals, or replace backgrounds with simple borders.
- **Accent-based backgrounds:** instead of pure `#000` or `#FFF`, use a dark desaturated version of the brand accent for backgrounds — a deep navy, dark slate-green, or muted charcoal with brand undertones. In Tailwind: use the `50` shade for light mode backgrounds and `950` for dark mode, with `500` or `300` as the primary accent.

## Adapting brand colors

Don't fear adjusting the brand for better design: rotate the hue, use analogous or complementary colors to improve contrast and accessibility. Pure brand color rarely works as the only accent — it usually needs lighter and darker variants the brand book doesn't define.

## Element states

- **Hover**: slightly lighter/brighter (one step up the scale, e.g. 600 → 500). CSS shortcut: `filter: brightness(110%)`.
- **Press / active**: slightly darker (one step down, e.g. 600 → 700). CSS shortcut: `filter: brightness(90%)`.
- **Disabled**: desaturated and lower contrast. CSS: `opacity: 0.5; filter: grayscale(100%)`. Also set `pointer-events: none` to prevent interaction.
- **Focus**: visible ring (3:1 contrast against background, see `accessibility-and-ux-laws.md`).

## Common mistakes

- **Single hex for the brand color** without a scale around it. The first time you need a hover or a faint background tint, you're guessing.
- **Pure black text on pure white** — too harsh. Use ~10-15% off-black.
- **Choosing colors in HSL/RGB** for chart series and ending up with one series that "shouts" while others fade. Use OKLCH for series.
- **Inverting light mode for dark mode** instead of building a separate palette. See `modes.md`.
