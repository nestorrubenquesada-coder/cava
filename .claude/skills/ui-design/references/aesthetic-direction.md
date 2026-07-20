# Aesthetic direction — escaping the generic AI look

**Load when:** picking the visual style for a new project, when work risks looking like generic SaaS, or when reviewing a design that "looks fine but feels generic". Applies most to expressive contexts (landings, marketing, portfolios, brand experiences) and less to pure product (dashboards, internal tools) — but even in product, escaping the default differentiates.

## Commit to a direction

- Before coding or designing, pick **one** direction and execute it precisely.
- "Bold maximalism" and "refined minimalism" work equally well — the key is **intentionality**, not intensity.
- A clear direction, executed in detail > a tepid mix of several.
- If a design could be reused unchanged for a B2B SaaS, a vet clinic, and a fitness app, it has no direction — it's generic.

## Direction playbooks

When a project starts without a design system, pick from this catalog. Each direction is a complete recipe — not just a label. Two compatible directions can combine, but keep one dominant.

For font selection guidance beyond what's listed here, see `typography-guide.md` — it covers domain-appropriate choices and pairing strategy.

---

### Editorial / magazine

Strong typographic grid, dramatic size contrast between headlines and body, generous whitespace used as a design element. The typography IS the design.

- **Typography:** Serif display (PP Editorial New, Instrument Serif, Cormorant) + clean sans body (Instrument Sans, Söhne, DM Sans). The contrast between serif headlines and sans body creates the editorial tension.
- **Color:** Restrained. Near-black text on off-white, one strong accent (deep red, navy, forest green). The palette should feel like a print publication, not a screen.
- **Hero:** Statement hero (large serif headline, minimal imagery) or split hero with editorial-quality photography. The headline does the work.
- **Cards/blocks:** Generous padding, thin borders or no borders — whitespace defines boundaries. Text-heavy with strong typographic hierarchy.
- **Buttons:** Understated. Thin border, generous letter-spacing, often uppercase at small size. Ghost buttons for secondary actions. The button should not compete with the typography.
- **Spacing:** Dramatic. Large gaps between sections (100px+), tight leading on headlines (-3% letter-spacing, 110% line-height). The contrast between tight type and open space IS the direction.
- **Effects that fit:** Subtle hover transitions on text (underline animations, color shifts). Staggered text reveals on scroll. No glows, no gradients on backgrounds, no shadows on cards.
- **Icons:** Minimal use — let typography carry the hierarchy. When needed: thin-stroke icons (Lucide, Phosphor light). Or no icons at all — use numbers, letters, or typographic markers instead.
- **Best for:** media, publishing, content platforms, premium B2B, agencies, portfolios, cultural institutions.
- **Avoid for:** data-dense tools, agricultural/industrial platforms, children's products, discount retail.
- **Reference sites:** stripe.com (marketing pages), linear.app/blog, monocle.com.

---

### Organic / natural

Curved shapes, earth tones, tactile textures, warmth. Feels handcrafted rather than machine-generated. Connection to physical materials.

- **Typography:** Humanist sans (DM Sans, Lato, Source Sans 3) or rounded sans (Nunito Sans — not Nunito, which is too bubbly). For display: a soft serif (Fraunces, Lora) can add warmth. Avoid geometric or cold sans (Helvetica, Roboto).
- **Color:** Earth palette as the neutral foundation — warm grays with ochre or clay undertones, not cool blue-grays. Accent: a single saturated green, terracotta, or amber. Avoid: cool blues, neon anything, purple gradients.
- **Hero:** Full-bleed photography of real environments (fields, nature, production). Split hero with organic rounded containers. Or: textured background (paper, grain, subtle noise) with warm overlay.
- **Cards/blocks:** Rounded corners (12-16px), soft shadows with warm tint (`shadow-lg` with a slight amber offset), cream or warm-gray backgrounds. Cards should feel like paper or natural material.
- **Buttons:** Rounded (full pill or 8-12px radius), solid fill in earth tones. Hover: darken slightly, not opacity change. Feels like touching a physical surface.
- **Spacing:** Generous and comfortable. Nothing feels cramped. Sections breathe. Use larger vertical padding than other directions (80-120px between sections).
- **Effects that fit:** Subtle parallax on nature imagery. Soft entrance animations (fade + slight upward drift). Grain/noise texture overlay at very low opacity (2-5%). Organic blob shapes as decorative elements — but use sparingly and with intent.
- **Icons:** Rounded stroke icons (Phosphor regular, Lucide). Illustrations > icons when possible — hand-drawn or organic illustration style reinforces the direction.
- **Best for:** agriculture, sustainability, food/beverage, wellness, outdoor brands, eco products, rural services.
- **Avoid for:** fintech, enterprise SaaS, developer tools, gaming.
- **Reference sites:** patagonia.com, aesop.com, allbirds.com.

---

### Brutally minimal

Everything dispensable goes. Only the essential remains. Power comes from restraint, not addition. Every element earns its place.

- **Typography:** One sans-serif, period. Geist, Inter, Instrument Sans, or Suisse Intl. No display font — the body font at large sizes IS the display font. Weight variation (light body, bold headlines) creates the hierarchy.
- **Color:** Near-monochrome. One neutral palette (white/gray/black or warm equivalents) + one accent color used extremely sparingly — only for primary actions and the single most important element per screen.
- **Hero:** Statement hero (one sentence, one CTA) or product screenshot hero with no decoration. Maximum negative space. The emptiness IS the design.
- **Cards/blocks:** No borders, no shadows, no backgrounds. Whitespace and alignment define groups. If you must use a container, a single thin gray border.
- **Buttons:** Simple text links or minimal outlined buttons. One solid primary button per page. No gradients, no shadows, no border-radius games.
- **Spacing:** Extreme precision. Every pixel is intentional. Use a strict 8px grid and never deviate. Tight where content is grouped, vast where sections separate (120px+).
- **Effects that fit:** Instant transitions (no bounce, no ease-out-back). Opacity changes for hover. `transition-duration: 150ms`. Anything slower feels indulgent. No entrance animations — content is there or it isn't.
- **Icons:** Lucide or Heroicons at their thinnest weight. Monochrome. Size-matched to text. Consider replacing icons with text labels entirely — in minimal design, icons can feel like decoration.
- **Best for:** developer tools, design tools, premium tech, portfolios for designers/architects, luxury tech.
- **Avoid for:** consumer products targeting broad audiences, children's apps, anything that needs warmth or personality.
- **Reference sites:** linear.app, vercel.com, rauno.me.

---

### Industrial / utilitarian

Pure function, no decoration, gray/black palette plus one accent. Looks like it was built by engineers for engineers. Data density is a feature.

- **Typography:** System fonts, mono-spaced for data, or utilitarian sans (JetBrains Mono, IBM Plex Mono for display; Inter or IBM Plex Sans for body). Information density matters more than typographic beauty.
- **Color:** Gray-scale foundation with one functional accent (blue, orange, or green). The accent means "interactive" — it's a signifier, not decoration. Dark mode is the natural home for this direction.
- **Hero:** Data hero (live metric, system status, or real-time visualization). Or: no hero at all — go straight to the content. The product IS the landing page.
- **Cards/blocks:** Tight padding (12-16px), thin borders (1px solid gray), no border-radius or 2px max. Content density is high. Cards look like terminal panels or dashboard widgets.
- **Buttons:** Small, compact, labeled clearly. No icons in buttons unless universally understood. Ghost or outlined for secondary, solid accent for primary. All business.
- **Spacing:** Compact. Efficient use of space. Dense information grids. Whitespace exists for clarity, not aesthetics — just enough to separate, not enough to feel "designed."
- **Effects that fit:** None decorative. Functional transitions only (panel open/close, tab switch). No entrance animations. Loading states are spinners or progress bars, not skeletons. If it doesn't communicate system state, it doesn't belong.
- **Icons:** Tabler or Lucide, single weight, monochrome. Icon function is obvious or labeled. No decorative icons.
- **Best for:** developer platforms, internal tools, monitoring dashboards, enterprise admin, command-line companions, DevOps.
- **Avoid for:** consumer marketing, lifestyle brands, creative agencies, anything that needs emotional appeal.
- **Reference sites:** github.com, grafana.com, railway.app.

---

### Luxury / refined

Serifs, lots of whitespace, gold/black/deep neutrals. Signal exclusivity and attention to detail. Every element feels considered.

- **Typography:** High-contrast serif for display (Canela, Noto Serif Display, Cormorant Garamond) + refined sans for body (Söhne, Neue Haas Grotesk, Graphik). Letter-spacing is generous on headings, weight is medium not bold — luxury whispers, it doesn't shout.
- **Color:** Deep neutrals (charcoal, espresso, midnight) as primary. Off-white (not pure white) as base. Accents: gold, champagne, deep burgundy, or muted emerald. Never bright or saturated — luxury colors are always pulled back.
- **Hero:** Full-bleed high-quality photography or video with subtle overlay. Or: dark background with elegant serif headline and generous space. The hero should feel like opening a premium magazine.
- **Cards/blocks:** Generous padding (32-48px), thin borders or none. Image-heavy. When borders exist, they're thin and dark (not gray — dark). Content is sparse per card — fewer words, larger type.
- **Buttons:** Pill-shaped or thin-bordered rectangular. Uppercase with generous letter-spacing (0.1em+). Subtle hover (fill the border, darken slightly). Never loud.
- **Spacing:** Excessive whitespace by most standards — 140px+ between sections. Content floats in space. The whitespace signals "we can afford to leave this empty."
- **Effects that fit:** Smooth, slow transitions (400-600ms ease-out). Parallax on imagery. Subtle scale on image hover (1.02-1.05). Fade-in on scroll. No bounce, no spring, no playfulness.
- **Icons:** Minimal use. When needed: thin-stroke, elegant (Phosphor thin). Prefer text and imagery over icons.
- **Best for:** fashion, real estate, premium food/wine, luxury goods, high-end services, hospitality, architecture.
- **Avoid for:** SaaS dashboards, agricultural tools, developer platforms, budget products.
- **Reference sites:** apple.com (product pages), bottegaveneta.com, aesop.com.

---

### Soft / pastel

Low contrasts, light palettes, rounded corners, gentle everything. Approachable and non-threatening. Feels like a comfortable space.

- **Typography:** Rounded sans (Nunito Sans, Varela Round) or soft geometric (Plus Jakarta Sans, DM Sans at lighter weights). Nothing sharp or angular. Display size should be large but weight should be medium, not bold — soft means gentle.
- **Color:** Pastel palette — but not random pastels. Pick one primary pastel (soft lavender, mint, peach) and pair it with warm off-white and one slightly darker shade for text (never pure black — use a dark version of the primary hue). Avoid pastel rainbow (too many pastels = generic).
- **Hero:** Light background with centered or split layout. Soft illustrations (isometric, blob-style, or flat). Or: gradient background (subtle, same-hue, not multi-color rainbow).
- **Cards/blocks:** Rounded corners (16-24px), pastel background fills, no visible borders (color difference defines the card). Soft shadows with high blur and low opacity.
- **Buttons:** Pill-shaped (full border-radius), filled with the primary pastel or a slightly darker shade. Hover: lighten or add soft shadow. Never dark or aggressive.
- **Spacing:** Comfortable. Generous padding inside components (20-32px). Sections spaced 80-100px apart. Everything feels padded and safe.
- **Effects that fit:** Bouncy micro-animations (spring easing). Soft blob shapes as decorative backgrounds. Gentle entrance animations (fade + slight drift). Rounded progress indicators. Shadows with colored tint matching the palette.
- **Icons:** Rounded stroke icons or filled with pastel colors. Phosphor regular or bold. Icons can be inside colored circles — this is one of the few directions where that pattern works naturally.
- **Best for:** consumer apps, onboarding flows, children/family products, health/wellness, note-taking, personal finance (friendly tier), educational tools.
- **Avoid for:** enterprise B2B, agriculture, developer tools, anything that needs authority or urgency.
- **Reference sites:** notion.so (marketing pages), headspace.com, linear.app/customers (soft version of minimal).

---

### Maximalist chaos (stub)

Layers, density, lots of color, lots of texture. Energy over elegance.

- **Typography:** Mix fonts boldly (2-3 families). Variable weights. Large display type in unexpected positions.
- **Color:** Multi-hue, saturated. The palette is loud and intentional.
- **Spacing:** Tight within groups, overlap between elements. Negative space is rare and therefore powerful.
- **Effects that fit:** Layered animations, hover state surprises, scroll-triggered transformations, noise textures, grain overlays.
- **Best for:** creative agencies, music/entertainment, fashion, experimental portfolios.

### Retro-futuristic (stub)

70s/80s/90s vision of the future. Nostalgia meets technology.

- **Typography:** Mono for display (Space Mono, JetBrains Mono). Retro sans for body.
- **Color:** CRT-inspired palettes — neon green on black, amber on dark brown, cyan accents. Or: faded 70s palette (burnt orange, olive, cream).
- **Effects that fit:** Scanline overlays, CRT glow effects, ASCII-art decorative elements, pixel-art accents. Typewriter text animations.
- **Best for:** gaming, retro brands, tech with personality, developer-adjacent creative.

### Playful / toy-like (stub)

Saturated colors, rounded shapes, bouncy animations. Joy as a design principle.

- **Typography:** Rounded bold sans (Nunito, Baloo, Comfortaa for display). Weight is heavy — nothing timid.
- **Color:** Primary colors or saturated secondaries. Bold, unapologetic. Yellow, pink, electric blue.
- **Effects that fit:** Bouncy spring animations, confetti effects, emoji/sticker decorative elements, parallax with character.
- **Best for:** children's products, gaming, social apps, creative tools for non-designers.

### Brutalist / raw (stub)

Hard edges, mono fonts, flat blacks, deliberately "ugly." Anti-design as design.

- **Typography:** Monospace (Courier, IBM Plex Mono, Space Mono). Oversized. Uppercase for impact.
- **Color:** Black, white, one accent (red or yellow). No gradients. No shades of gray — pure values only.
- **Effects that fit:** None. Brutalism rejects decoration. If it moves, it's functional (hover feedback only).
- **Best for:** experimental art, counter-culture brands, architecture firms, design studios making a statement.

### Art deco / geometric (stub)

Precise geometric shapes, symmetry, restricted palettes. Gatsby-era elegance meets modern craft.

- **Typography:** Geometric display (Poiret One, Josefin Sans) + clean body. Strong vertical lines in letterforms.
- **Color:** Gold + black + cream (classic). Or: jewel tones with gold accents.
- **Effects that fit:** Geometric border patterns, symmetrical layouts, subtle gold shimmer on hover.
- **Best for:** premium events, hospitality, luxury with a vintage edge, cocktail/spirits brands.

---

## Typography

For the complete font selection framework — choosing fonts by domain, audience, and aesthetic direction — see `typography-guide.md`.

Core principle: the font must match the domain and audience, not just "look distinctive." Playfair Display on an agricultural data platform is worse than Inter, because Inter is neutral while Playfair actively signals the wrong audience.

## Color: dominants with sharp accents

- Tepid, "balanced" palettes split evenly feel generic.
- **One dominant color + sharp, punctual accents** usually beats an evenly distributed palette.
- This coexists with the 4-layer system (`color-system.md`): the idea is for the neutral foundation to have its own personality and for the functional accent to be confident, not timid.

## Creative spatial composition

When the context allows (landings, marketing, portfolios, microsites), step out of the safe orthogonal layout:

- **Asymmetry** by intention instead of centered-by-inertia.
- **Overlap** between elements, layers riding on each other.
- **Diagonal or curved flow** instead of pure linear scroll.
- **Grid-breaking elements**: something that breaks the grid on purpose and therefore catches the eye.
- **Generous negative space** OR **controlled density**. The worst world is being halfway between the two.

> **Doesn't apply to dashboards, internal tools, or admin panels**: there strict grid is feature, not bug. Asymmetry in a dashboard generates more friction than it's worth.

For section-level composition (how sections flow, weight distribution, hero patterns), see `page-composition.md`.

## Backgrounds with atmosphere

Solid color backgrounds are the safe default. When the context calls for more depth:

- Gradient meshes, noise textures, geometric patterns, layered transparencies.
- Dramatic shadows used with judgment (not the default offset 0/4/12 shadow).
- Decorative borders, custom cursors, grain overlays.
- **Caution**: they cost performance and can break accessibility (text over noise loses contrast). Use with judgment and test.

## Effects with purpose

Effects are tools, not decoration. Each has a job — use it when the job needs doing, skip it when it doesn't. The question is never "more or fewer effects" but "does each effect serve a purpose?"

### Shadows

Communicate elevation and interactive state.
- **Light** (2-4px blur, low opacity): card resting state. Says "this is a surface."
- **Medium** (8-16px blur): dropdown, popover, tooltip. Says "this floats above the page."
- **Heavy** (24-48px blur): modal, dialog. Says "this demands attention."
- **Warm-tinted** (shadow with subtle color): adds life to organic and soft directions. Cold shadows feel sterile.
- **No shadow**: appropriate for minimal, brutalist, and editorial directions. Whitespace and borders define surfaces instead.

### Gradients

Create depth, direct the eye, add warmth.
- **Same-hue subtle** (e.g., light blue to slightly darker blue): adds dimension without drawing attention. Safe for any direction.
- **Complementary accent** (e.g., blue to purple): bolder statement. Fit for expressive contexts (landing heroes, CTAs). Must be intentional.
- **Multi-hue rainbow**: almost always signals "generic AI design." Avoid unless the brand genuinely owns a rainbow palette.
- **Mesh gradients**: can create beautiful atmospheric backgrounds. High impact, but test for text readability.

### Animations and transitions

Confirm actions, guide attention, add perceived quality.
- **Page-load orchestration** (staggered reveals with cascading delay): creates more impact than twenty scattered microinteractions. One well-choreographed entrance > many random ones.
- **Hover feedback**: should surprise mildly — not the default `opacity: 0.8`. Color shift, underline animation, subtle scale, border fill.
- **Route transitions**: smooth transitions between pages signal polish. Even a simple fade (200ms) beats an instant swap.
- **Scroll-triggered reveals**: use with restraint. One entrance animation per section is enough. Animating every element on scroll is noise.
- **Timing matters**: under 200ms feels instant (use for hovers, toggles). 200-400ms feels responsive (use for entrances, page transitions). Over 600ms feels slow (use only for dramatic reveals).
- **Delight animations on non-essential elements:** decorative icons, illustrations, and supporting visuals can have personality animations (slow bob, gentle rotation, pop-in on scroll) without disrupting usability. Use natural easing: `cubic-bezier(0.175, 0.885, 0.32, 1.275)` for bouncy character, `ease-in-out` for smooth looping. Keep these on non-interactive elements — functional UI should animate for feedback, not for fun.
- **Directional meaning:** animation direction communicates location and state. Vertical movement (slide up from bottom) = temporary overlay (modal, bottom sheet, action panel). Horizontal movement (slide left/right) = sequential navigation (onboarding steps, wizard, carousel). Standardize these across the app — users subconsciously learn the mapping, and inconsistency creates confusion.
- **Surprise mechanics:** after a predictable sequence (feature list, standard cards), one unexpected interaction rewards engagement. A modal that expands from its trigger point (`transform-origin` + `scale()`), editing tools that slide up from the bottom, or a custom cursor-tracked effect — these "pattern breaks" signal that a specific section is important or interactive. Use sparingly — one per page is a surprise, three is chaos.

### Blur and glassmorphism

Create layering and depth over visual content.
- Excellent for overlays, navigation bars over hero images, modal backdrops.
- Terrible when applied to every surface — it becomes noise, and it's expensive to render.
- Always test on lower-end devices — backdrop-filter is GPU-intensive.

### Glow and light effects

Create focal points and energy.
- Fit: maximalist, retro-futuristic, gaming, tech-with-personality contexts.
- Don't fit: minimal, editorial, organic, industrial directions.
- A single glow behind a CTA button can be effective. Glow on every interactive element is noise.

### The test

For every effect you add, answer: **"What job is this effect doing?"** Name the job specifically — "communicates elevation," "confirms the click," "directs the eye to the CTA," "creates atmospheric depth for the hero."

If you can't name the job, remove the effect. If you can, execute it well.

## Match complexity to vision (meta-principle)

- **Maximalist designs** need elaborate code: extensive animations, layered effects, dense detail. Elegance comes from **executing a lot, well**.
- **Minimalist / refined designs** need restraint: millimetric spacing, careful typography, subtle detail. Elegance comes from **executing little, perfectly**.
- A minimalist design with overloaded code feels imbalanced. Tepid maximalism (little code for a big vision) feels incomplete.

## Anti-patterns that tag generic design

Each anti-pattern below includes what to do instead. The blacklist alone strips things away without replacing them — that makes pages bare, not better.

- **Default fonts** (Inter, Roboto, Arial, system fonts) without justification. **Instead:** choose from `typography-guide.md` based on domain and audience.
- **Cliché color schemes** (purple-to-pink gradients, blue-to-purple CTAs, pastel rainbow for everything, flat "modern dark mode" with `#1a1a1a` as the only dark). **Instead:** build the palette from the brand or domain per `color-system.md`. One dominant + sharp accents.
- **Predictable layouts** (centered hero with giant CTA over lorem ipsum, three-column features with icon-title-text, circular-photo testimonials). **Instead:** use section archetypes from `page-composition.md` — asymmetric highlights, number-led blocks, annotated screenshots.
- **Identical component patterns** (same border-radius for everything, default offset 0/4/12 shadows, modals that always appear with scale + opacity). **Instead:** vary radius by component type (pills for tags, moderate for cards, sharp for inputs), vary shadow by elevation level.
- **Cookie-cutter** — if the design could serve three unrelated industries unchanged, it has no direction. **Instead:** pick a direction from this file and execute the full playbook.

## Variation across projects (if this skill produces many UIs)

If a workflow produces many UIs, avoiding convergence matters:

- **Vary between light and dark** depending on context, don't default to one.
- **Rotate fonts**: never always fall back to the same "default cool font" (Space Grotesk was popular and turned generic for that exact reason).
- **Vary aesthetic direction**: each project should have its own personality, not always default to "minimalist tech".
- **Avoid convergence to the average**: the workflow should push toward bold decisions, not the statistical center.
