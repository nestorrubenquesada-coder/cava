# Page composition

**Load when:** designing full pages, landings, marketing sites, or any multi-section layout. Covers visual rhythm, section archetypes, hero patterns, and the distinction between structural and visual problems.

## Structure > Effects (the 10x principle)

A page with excellent structure and zero effects looks better than a page with mediocre structure and expensive effects. The hierarchy of what to fix:

1. **Section sequence and purpose** — does each section answer the next natural question?
2. **Visual weight distribution** — is there contrast between dense and airy sections?
3. **Typography hierarchy** — can you tell what's most important at a glance?
4. **Spacing and rhythm** — do sections breathe at different rates?
5. **Color** — does the palette support the hierarchy or fight it?
6. **Effects** — do shadows, gradients, and animations serve specific jobs?

Fix them in this order. Never start at #6. A page where everything is structurally right but visually flat is one polish pass away from excellent. A page where the structure is wrong but the effects are beautiful is a full redesign away.

## Visual rhythm — alternating density and whitespace

Pages need contrast between sections, like music needs contrast between loud and quiet passages.

### Section weight

Classify each section as one of three weights before designing any of them:

- **Heavy** — dark background, large type, image-dominant, high visual density. Commands attention. Examples: hero with full-bleed media, dark testimonial band, large stats section.
- **Medium** — cards, lists, moderate content density, standard backgrounds. Carries information. Examples: feature explanations, pricing table, FAQ.
- **Light** — generous whitespace, single statement, sparse content. Creates breathing room. Examples: pull quote, simple CTA, transition statement.

### The rhythm rule

Never place 3+ consecutive sections of the same weight. Alternate.

**Good rhythm:** H → M → L → H → L → M → L
**Bad rhythm:** M → M → M → M (feels monotonous, "AI-assembled")
**Bad rhythm:** H → H → H (overwhelming, no rest for the eye)

Before designing any section, map out the weight sequence for the entire page. Adjust before you invest in details.

### Weight transitions

When moving between weights:
- **Heavy → Light**: creates dramatic contrast (strong impact). Use for key moments.
- **Medium → Medium**: acceptable if the content type changes (cards → table), but vary the background or layout.
- **Light → Heavy**: resets attention (use before your most important message after the hero).

## Section archetypes for landings and marketing

These replace the default "three-column grid with icon + title + description." Each archetype serves different content and audiences.

### Number-led blocks

Large metric as the primary element + one-line explanation underneath.

```
47%        3x           <2min
faster     more yield    setup time
onboarding per season
```

- **When to use:** quantifiable value propositions, impressive stats, comparisons with competitors or previous state.
- **When NOT to use:** when the numbers aren't genuinely impressive, or when the value is qualitative (trust, ease, beauty).
- **Weight:** Medium. Can go Heavy with dark background and oversized numbers.
- **Layout variations:** horizontal row (3-5 metrics), vertical stack with context paragraphs, scattered asymmetric placement.

### Before/after split

Two states shown side by side or with a slider, demonstrating the transformation.

- **When to use:** when the product changes a visible state (UI improvement, data cleanup, crop health, visual transformation).
- **When NOT to use:** when the change is invisible or abstract (backend speed, security improvement).
- **Weight:** Heavy (visual-dominant).
- **Layout variations:** side-by-side columns, slider overlay, sequential scroll (before on scroll-in, after on scroll-out).

### Asymmetric feature highlight

One large visual (screenshot, illustration, video) on one side + text on the other. Alternate sides per feature. Each feature gets a full-width section, not a card in a grid.

- **When to use:** features that have a strong visual component (dashboards, maps, charts, workflows).
- **When NOT to use:** features that are hard to screenshot or visualize (API endpoints, integrations list).
- **Weight:** Medium to Heavy depending on visual size.
- **Key principle:** the visual does the selling — the text supports. If the visual isn't compelling, this archetype doesn't work.

### Narrative scroll

Features revealed through a single continuous visual that changes as you scroll (sticky element with changing content, parallax sections, progressive reveal).

- **When to use:** when features form a story or sequence (onboarding flow, data pipeline, analysis process).
- **When NOT to use:** when features are independent and unrelated. High implementation cost — only when the narrative justifies it.
- **Weight:** Heavy (immersive).
- **Implementation:** sticky container with `position: sticky` + content panels that trigger visual changes on intersection.

### Quote-driven

Customer quote as the primary element, with the feature it references as secondary context.

- **When to use:** when social proof is stronger than feature description. B2B products where buyer trust matters. When you have genuinely good quotes (not generic "Great product!" testimonials).
- **When NOT to use:** when quotes are weak, generic, or unavailable.
- **Weight:** Light to Medium.
- **Layout variations:** large pull quote with attribution, quote cards with customer photo and role, video testimonial embed.
- **Anti-pattern to avoid:** the circular-photo grid of identical testimonial cards — break the template with asymmetric layout, varying quote lengths, or mixed media.

### Annotated screenshot

Real product screenshot with callout annotations pointing to specific capabilities. Authentic and specific — the opposite of abstract feature descriptions.

- **When to use:** when the product UI is clean enough to showcase. When features are easier to point at than describe.
- **When NOT to use:** when the UI is in progress, visually complex, or requires context to understand.
- **Weight:** Heavy (image-dominant).
- **Key principle:** the screenshot must be real and current. Mock screenshots destroy trust faster than no screenshot at all.

### Interactive demo

Embedded interaction that lets the visitor experience the feature directly on the page.

- **When to use:** when the product's value is best understood by trying it. When the interaction is simple enough to embed (calculator, filter, configurator).
- **When NOT to use:** when the product requires setup, data, or context to be meaningful. Highest build cost — reserve for the hero or primary conversion moment.
- **Weight:** Heavy (engagement-dominant).

### Comparison table

Structured comparison against known alternatives or plan tiers.

- **When to use:** when competing against known alternatives and your product wins on concrete dimensions. Pricing page tiers.
- **When NOT to use:** when comparison data is made up or when competitors change frequently (maintenance burden).
- **Weight:** Medium.
- **Key principle:** be honest. Rigged comparison tables are instantly recognizable and erode trust.

## Hero section patterns

The hero is the first thing visitors see. The centered CTA over a vague background is the single most common "AI landing page" pattern. Alternatives:

### Contextualized hero

Instead of a single stock image or flat illustration, arrange smaller thematic icons, doodles, or product-relevant illustrations around a centered core message. The supporting elements trail off in size/opacity as they move from the center, creating depth and guiding focus to the headline.

- **Pairs with:** playful, organic, soft directions.
- **Best when:** the product has recognizable visual elements (invoices for accounting, crops for agriculture, charts for analytics). Custom doodles that relate directly to features help the user understand the product at a glance — far better than generic stock photos.
- **Key principle:** these are supporting elements, not the focus. They orbit the headline, not compete with it.

### Split hero

Text on one side, visual on the other (or reversed). The most versatile pattern — works for nearly any product.

- **Pairs with:** editorial, organic, industrial, soft directions.
- **Text side:** headline + subheadline + CTA. Keep it tight — 3 elements max.
- **Visual side:** product screenshot, illustration, photo, or video. The visual should be specific to the product, not a stock photo.

### Full-bleed media hero

Background image or video fills the entire viewport. Text overlaid with sufficient contrast (gradient overlay, solid overlay, or text in a constrained box).

- **Pairs with:** luxury, maximalist, organic directions.
- **Risk:** background competes with text. The overlay must guarantee readability — test contrast ratios.
- **Best when:** the imagery IS the product (agriculture, real estate, photography, food).

### Statement hero

One large sentence, no image. The typography does all the work. Maximum typographic impact.

- **Pairs with:** brutalist, editorial, brutally minimal directions.
- **Requires:** a headline that's genuinely good. If the copy is generic ("Revolutionize your workflow"), this hero exposes it. If the copy is sharp ("See your field's potential before harvest"), it's powerful.

### Product screenshot hero

The product itself as the hero visual. Screenshot, UI mockup, or live embed.

- **Pairs with:** any product-focused direction. The product is the star.
- **Best when:** the product UI is polished and self-explanatory. If the screenshot needs a paragraph of explanation, it's not ready for the hero.
- **Skewed perspective technique:** instead of a flat screenshot, apply a subtle CSS perspective transform (`transform: perspective(1000px) rotateY(-15deg)`) to give the screenshot depth and tangibility. This makes the product feel real and provides implicit social proof — "this is what you'll actually use." Far more effective than generic placeholder icons or abstract illustrations.

### Video hero

Background video loop (muted, atmospheric) or inline video (play button, sound).

- **Pairs with:** luxury, maximalist, organic directions.
- **Risk:** performance. Compress aggressively. Provide a static fallback. Never autoplay with sound.

### Data hero

A key metric, live counter, or real-time data visualization as the centerpiece.

- **Pairs with:** industrial, editorial, brutally minimal directions.
- **Best when:** the number is genuinely impressive and updated. A static "10,000+ users" is not a data hero — a live dashboard visualization is.

## Flow and transitions between sections

### The scroll story

Each section should answer the next natural question the visitor has. A page that follows this progression feels coherent; one that doesn't feels like assembled blocks:

1. **Hero:** "What is this?" — the product's identity and primary value proposition.
2. **Social proof or credibility:** "Can I trust this?" — logos, numbers, or a short testimonial band.
3. **Features/benefits:** "What does it do for me?" — 2-4 key features using the archetypes above.
4. **How it works:** "How does it actually work?" — 3-step process, demo, or walkthrough.
5. **Deeper social proof:** "Does it really work?" — case studies, detailed testimonials, results.
6. **Pricing:** "What does it cost?" — tiers, comparison, or a simple ask.
7. **Final CTA:** "How do I start?" — reduce friction, restate the main benefit.

Not every page needs all 7. But the *order* of questions matters — don't put pricing before the visitor understands what they're buying.

### Logo marquee / social proof band

A horizontal scrolling strip of client or partner logos near the hero, establishing instant trust.

- **Implementation:** CSS flex with `animation: scroll 20s linear infinite` + `mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent)` for smooth fade at edges.
- **Key principle:** use greyscale logo versions to maintain visual hierarchy — colored logos compete with your brand palette. Avoid static, poorly-aligned grids that look like clip-art.
- **Weight:** Light (doesn't dominate, but adds credibility).
- **Placement:** immediately after the hero or after the first feature section. The "can I trust this?" question comes early.

### Bento grid

A modular grid layout (typically 3-4 columns with varying cell sizes) that showcases multiple features in a dense, visual format. Named after the Japanese lunch box compartments.

- **When to use:** when you have 4-8 features that are roughly equal in importance and each has a strong visual (screenshot, icon, illustration).
- **Implementation:** CSS Grid with `grid-template-columns: repeat(3, 1fr)` and varying `grid-row` / `grid-column` spans for visual variety. To break the rigid "AI-generated grid" feel, apply a slight rotation to one card (`transform: rotate(-2deg)`) — subtle enough to feel intentional, not enough to feel broken.
- **Weight:** Medium to Heavy depending on content density.
- **Risk:** without varying cell sizes, it looks like a boring uniform grid. Make at least one cell span 2 columns or 2 rows.

### Visual continuity between sections

- **Shared color thread:** one accent color that appears in every section (as a button, a highlight, an icon tint) ties the page together.
- **Typography rhythm:** consistent use of the same heading weights and sizes creates predictability. The reader learns where to look.
- **Element carry-over:** a visual motif (shape, illustration style, border treatment) that appears across sections creates cohesion.

### Deliberate breaks between sections

- **Background color change:** the most effective section separator. No divider line needed.
- **Full-bleed image or illustration:** creates a hard reset. Use between major content shifts.
- **Dramatic whitespace:** 120px+ of vertical padding signals "new topic."

## Structural anti-patterns

These are the patterns that make a page feel "assembled by AI." They matter 10x more than effect problems (gradients, shadows, glows). Fix these first.

### Centered-everything layout

Every section has centered text, centered image, centered CTA. No visual tension, no eye movement, no hierarchy beyond size.

**Instead:** vary alignment across sections. Left-aligned text in feature sections, centered only for short statements and CTAs. Let the grid create natural asymmetry.

### Identical section templates

Same padding, same background, same layout pattern repeated with different content. The page feels like a for-loop.

**Instead:** vary the weight (H/M/L), the background, and the layout archetype. Each section should feel like it was designed for its specific content.

### No weight variation

Every section has similar visual density — nothing is emphatic, nothing is quiet. The page flatlines.

**Instead:** map H/M/L weights before designing. Ensure at least one Heavy section (the hero or a key message) and at least one Light section (breathing room).

### No focal point

The eye doesn't know where to land first. Everything competes for attention equally.

**Instead:** one element per section should be obviously dominant (largest, boldest, most colorful). If you squint and everything blurs equally, hierarchy is broken.

### Too many ornaments

Decorative elements (icons, badges, floating shapes, stickers) compete with the core message. If a section's purpose isn't clear within 5 seconds of seeing it, the structure is failing — not the effects.

**Instead:** if a section feels cluttered, remove 50% of the decorative elements. The ones that remain will have more impact. Limit to one illustration or decorative pattern per section.

### Repetitive grid structures

Every feature is a card in a 3-column grid. Every testimonial is a card in a 3-column grid. Every stat is a card in a 3-column grid. The grid becomes invisible through repetition.

**Instead:** use different archetypes for different content types. Features as asymmetric highlights, testimonials as pull quotes, stats as number-led blocks. Break the grid pattern at least once per page.
