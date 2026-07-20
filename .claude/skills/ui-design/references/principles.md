# Universal principles

**Load when:** drilling into visual hierarchy, spacing, typography rules, affordances, or feedback patterns. These principles apply to every platform, stack, and aesthetic direction.

## Visual hierarchy

- Drive attention with **size, position, and color**. Important = bigger, bolder, or more colorful.
- Group (stack) related objects and order them by importance.
- Reserve pure white/black for the most critical actions; use dark grays for secondary information (metadata, descriptions). Pure black on pure white is harsh — back off slightly.
- **Respect proven mental models**: navigation at the top, content top-to-bottom, left-to-right. To avoid a "template" look, put your uniqueness in micro-interactions and component styling — not in unconventional layout structures that confuse navigation.

## Affordances and signifiers

Use visual cues (containers, gray text, button states) so the user understands how elements work **without explicit instructions**. If an element looks clickable, it should be clickable. If it doesn't look clickable, it probably won't get clicked.

## Spacing and grid

- Work on a **base grid of 4 or 8 pixels**. In Figma, set the "nudge amount" to 8 to keep alignment when moving elements. Common intervals: 16px within groups, 32px between groups, 64-80px+ between sections.
- Use **Auto Layout** for consistent padding and spacing.
- Prioritize whitespace — let the design breathe. Cramming is the easiest way to look amateur.
- **Spacing hierarchy prevents the "AI look."** Uniform spacing (everything equally spaced) is the clearest tell of generated UIs. Create intentional contrast: tight gaps within related elements (8-12px), medium gaps between groups (24-32px), large gaps between sections (64px+). The variation itself communicates structure — it tells the eye what belongs together and what's separate.

## Typography

- A single sans-serif font is usually enough for product UI.
- Headers: `letter-spacing` between **-2% and -3%**, `line-height` between **110% and 120%**.
- Very large text (70-80px+): manual kerning between **-2% and -4%** so it doesn't look loose.
- Body text: minimum 16px. Below that gets uncomfortable on screen. Line-height ≥1.5x font size.
- Maximum line width for long text: ~80 characters (~600-700px).

## Component consistency

- Uniformity in corner radius, sizes, colors, and typography across the app.
- Use styles and components (Figma) so buttons, search bars, etc. look identical everywhere.
- Icons: a single library (Feather, Phosphor, Lucide, etc.). The **icon size should equal the line-height** of the text it sits next to.

## Interactive feedback

Every interaction needs a visible response.

- **Buttons need:** hover, active, disabled.
- **Inputs need:** loading, error, success.
- Subtle microinteractions (e.g. a chip that pops up to confirm an action).
- **Doherty Threshold**: under 400ms feels instant; over that needs visible feedback (skeleton, spinner, optimistic UI).

## Purposeful elements

Every visual element should earn its place — but "earning" means it serves hierarchy, feedback, atmosphere, or brand identity. The criterion is not "does it carry raw data?" (Tufte's data-ink ratio was designed for statistical charts, not interactive interfaces) but **"does it serve the user's experience?"**

What earns its place:
- **Shadows** earn their place by communicating elevation and interactive state.
- **Gradients** earn their place by creating depth, directing the eye, or adding warmth.
- **Animations** earn their place by confirming actions, guiding attention, or adding perceived quality.
- **Decorative elements** earn their place when they establish mood, break monotony, or reinforce brand identity in expressive contexts (landings, marketing).

What doesn't:
- **Duplicate indicators** — an arrow AND a label AND a color change all saying "clickable." Keep one.
- **Uniform decoration** — if every card has a glow, no card has a glow. Effects applied to everything communicate nothing.
- **Purely ornamental borders** that create visual noise without defining boundaries or groups.

The test: not "can I remove this?" but **"what job is this doing? Is anything else already doing that job?"** For the full framework on when each type of effect is appropriate, see `aesthetic-direction.md` § "Effects with purpose."

## Whitespace

- Whitespace is part of the design, not empty space waiting to be filled.
- Margins and gaps between sections: at least 32px on desktop, 16px between items.
- The temptation to "fill the gap" with a banner, illustration, or extra copy almost always weakens the result. Resist it.
- For how whitespace creates rhythm between page sections (alternating density and breathing room), see `page-composition.md`.

## Hierarchy of importance — quick test

Squint at the design until it blurs. Can you still see what's most important? If everything looks the same after blurring, hierarchy is broken.
