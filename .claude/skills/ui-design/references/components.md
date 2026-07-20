# Specific UI components

**Load when:** designing or auditing specific component types — cards, buttons, modals, chips, etc. For aesthetic direction (which style of card to design), pair with `aesthetic-direction.md`.

## Cards

- Modern type, consistent margins.
- In lists: **the whole card is clickable**, not a small button on the side. If the entire card is a single link, don't add a redundant CTA button — instead, show an arrow icon on hover to signify interactability.
- Text over an image: use a **progressive overlay** — a `linear-gradient` from `transparent` to a dark tone (not a uniform flat overlay, which hides image quality). For heavier blur: `backdrop-filter: blur(8px)` on the text container softens the image behind without a dark mask.
- Drop redundant labels if the content is already clear.
- Don't nest cards inside cards (especially on mobile — see `mobile.md`).
- **Cards are excellent for product UI** (dashboards, lists, settings). For marketing and landing pages, the card grid is often the wrong pattern — consider the section archetypes in `page-composition.md` instead.

## Handling variable content

Design for the worst case, not the pretty demo:

- **Long text:** apply CSS truncation to prevent layout breaking: `text-overflow: ellipsis; white-space: nowrap; overflow: hidden;` for single-line elements. For multi-line, use `-webkit-line-clamp`.
- **Icons over images:** wrap icons in a semi-transparent container (e.g. `bg-black/40 rounded-full p-1`) to guarantee visibility over any background image.
- **Empty lists, zero values, negative numbers, missing data:** design these states explicitly. If a component only works with "perfect" short content, it's not done.

## Load more vs infinite scroll

- **Prefer "Load More" buttons over infinite scroll** for most content lists. Infinite scroll prevents users from reaching the footer (important for navigation and legal links) and makes it hard to share a position in the list.
- Infinite scroll is acceptable only for feed-style content (social media, chat) where there's no footer and the content is inherently endless.

## Presenting features and benefits

The icon + title + description card in a 3-column grid is the most common AI-generated layout pattern. For alternatives — number-led blocks, asymmetric highlights, annotated screenshots, before/after splits, and more — see `page-composition.md`.

## Pricing cards

- **Outlines** for secondary buttons, not heavy solid backgrounds.
- Checkmarks for features.
- Clear plan names and pricing context (e.g. "billed monthly").
- One plan visually emphasized as recommended (subtle background tint, badge, or border) — not three identical cards.

## Buttons

- **Ghost buttons** (no background until hover) for secondary actions.
- **Always include all states**: default, hover, active, disabled, loading.
- Primary button per screen: only one. Multiple primaries dilute hierarchy.
- Destructive actions (delete, cancel subscription) get visually distinct treatment — usually red, often confirmed via modal.
- Imperative, specific copy: "Save changes" > "OK"; "Delete account" > "Confirm".

## Icons

### Emojis are not icons

In professional software UI, never use emojis as interface icons. Emojis lack the visual weight, consistent stroke width, and standardized sizing required for professional dashboards and data-heavy contexts. They make apps look like quick prototypes. Reserve emojis for user-generated content (chat, comments) where they belong.

### The generic icon problem

FontAwesome with FaSearch, FaChartLine, FaDollarSign is the single most recognizable tell of AI-generated UIs. These icons appear on millions of template sites — using them instantly signals "this was assembled, not designed."

The problem isn't just the icon library — it's the pattern. Icon + title + description in a 3-column grid, repeated for every feature, is the layout that makes icons look generic. Break the layout pattern (see `page-composition.md`) and even common icons stop looking template-default.

### Icon library tiers

- **Distinctive and modern:** Phosphor (multiple weights — thin to bold — and duotone variant), Tabler (large set, clean geometry), Remix Icon (fills + lines, consistent style). These have enough personality to differentiate.
- **Neutral and professional:** Lucide (Feather evolution, well-maintained, good for product UI), Heroicons (Tailwind ecosystem, solid and outline variants).
- **Overused — avoid for expressive contexts:** FontAwesome (instantly recognizable as a default), Material Icons (too Google-branded), Bootstrap Icons. Fine for internal tools where nobody cares about aesthetics.
- **Maximum distinctiveness:** Lordicon (animated icons — use sparingly for key moments), custom SVG illustrations per feature (highest impact, highest cost), abstract geometric shapes that relate to the brand.

### Treatment strategies

- **Monochrome single-weight:** most versatile, works everywhere. Pick one weight and stick to it.
- **Duotone** (Phosphor duotone): adds depth, good for feature highlights and empty states.
- **Filled with colored background** (icon on colored circle/pill): this IS the template pattern — only use if the surrounding layout breaks the template feel.
- **No icons at all:** for brutalist, editorial, and industrial directions, replacing icons with numbers, letters, or typographic markers creates more distinction than any icon library.

### Basics

- Same library across the project — mixing icon styles is immediately visible.
- Size = line-height of the accompanying font.
- If an icon's meaning isn't universally obvious, add a label.

## Signup / login modals

- Labels **above** the inputs (visible while typing).
- Placeholder with a useful example, not generic ("name@company.com" > "Email").
- Clear subheading and easy toggle between login/signup.
- Inline validation, not just on submit.

## Navigation dropdowns

For sites with complex feature sets or multiple product areas, replace plain text dropdown lists with **rich dropdowns** that include visual context:

- Two-column layout: icons or thumbnails on the left, actionable copy on the right.
- Group items by category with subtle section headers.
- Include a brief description (1 line) under each item title — the user decides whether to click without needing to navigate first.
- This provides immediate context and significantly improves navigation conversion compared to flat text-only menus.

## Footers

- Don't overcomplicate. With few links: centered logo on top, links in a single line, social media at the bottom.
- Avoid the massive multi-column footer unless content actually justifies it.

## Chips

- Ideal for breadcrumbs and filters.
- Thinner than buttons, **non-primary** colors so they're visually distinct. Concrete rule: set vertical padding to 1/2 or 1/4 of horizontal padding (e.g., `px-5 py-1.5` or `px-5 py-1`). This prevents chips from accidentally looking like buttons.
- Auto Layout for consistent padding.
- Removable chips (filters): an X icon on the right.

## Carousels

- Dots/indicators **always visible** over any image.
- Place them on a dark background with blur to ensure visibility.
- Auto-advance only if the user can pause it. Otherwise it competes for attention with everything else.

## Modals (general)

- Single primary action, secondary ("Cancel") less prominent.
- Click outside to dismiss only if the content is non-destructive and changes are auto-saved or discardable.
- Escape key always closes.
- Don't nest modals — if a modal needs another action, redesign the flow.

## Toasts

- Live 3-5 seconds for confirmations, longer (or persistent + dismissible) for errors.
- Position: top-right or bottom-center are the conventions. Pick one and stick with it across the app.
- Color-code by type (success green, error red, warning yellow, info blue) but don't rely on color alone — include an icon.

## User identity / account

- **Never use gradient-filled circles as user avatars or profile indicators.** The random-gradient circle (e.g., a linear gradient from purple to pink as a placeholder avatar) is one of the most recognizable AI-generated UI defaults. It signals "no one designed this."
- **Instead:** use an Account Card component — the user's name/email + role in a compact card that triggers a popover with secondary settings (billing, usage, preferences). This is an established pattern that communicates depth and maturity.
- If you must have an avatar placeholder (no photo available), use the user's initials on a solid, brand-consistent background color — not a gradient.

## Modals vs full pages

- **Use modals for task-specific input** (creating a new item, editing a single field, confirming an action) rather than navigating to a full page. A full page for a simple "create URL" or "add item" form feels empty and disconnects the user from their context.
- Collapse advanced or optional fields by default to prioritize the primary action. Show them behind a "More options" toggle.
- **Use full pages when:** the task is complex (multi-step wizard, long form), the content needs breathing room, or the user needs to reference other parts of the page while working.

## Stickers / decorative elements

- For breaking up overly square layouts.
- Star tool for custom shapes, "quirky" typefaces, outlines, and shadows.
- Use in expressive contexts (landings, marketing); avoid in serious dashboards or admin tools.
