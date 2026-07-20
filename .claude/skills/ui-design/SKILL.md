---
name: ui-design
description: Use when designing UI/UX — building visual interfaces from scratch, choosing color palettes, typography, spacing, aesthetic direction, dashboards, dark/light modes, charts and data visualization, accessibility, or redesigning existing screens. Also use when implementing frontend components, pages, hooks, layouts, styles, or tests in this repo's Next.js/React/Tailwind stack.
---

# Skill: UI Design

Universal UI/UX guidance for designing interfaces, plus the code conventions for implementing them in this repo. The skill is split into a compact entry point (this file) plus reference files in `references/` that get loaded on demand based on what the task needs.

## When to use this skill

- Designing a new screen, page, or component from scratch.
- Choosing or auditing a color palette, typography scale, or spacing system.
- Designing dashboards: layout, KPI placement, charts, sidebar structure.
- Picking light vs dark mode strategy or designing a dark mode pass.
- Auditing accessibility (WCAG contrast, tap targets, keyboard nav, focus states).
- Redesigning an existing screen — visual modernization, fixing usability issues, simplifying clutter.
- Picking an aesthetic direction (minimal vs maximal, editorial vs playful, etc.) for a new product or section.
- Designing data visualizations: choosing chart types, axes, units, colors for series.

## When NOT to use this skill

- Backend, API, schema, or data work → `backend-endpoint` / `db-migration`.
- Pre-PR validation → `self-review-checklist` then `qa-engineer`.

## Core workflow

Always run these four steps in order. Skipping discovery is the most common failure mode.

### Step 1 — Discovery

Don't draw or pixel anything until you know what you're solving for. The discovery questions in `references/discovery-questions.md` cover the full set; the four that block all design work are:

1. **Type of work** — is this (a) new design from scratch, (b) restructuring something existing, or (c) a new screen inside an existing design system? Each path has different constraints.
2. **Context and users** — who uses this, what task are they completing, on what device, in what context.
3. **Visual identity and modes** — does a design system exist? Brand colors? Typography? Single mode (light or dark) or dual mode?
4. **Technical constraints** — framework, component library, icon library, chart library, performance budget.

If the user can't or won't answer something, **state the assumption explicitly** ("assuming desktop-first, light mode default, no prior design system") so they can correct early. For restructure/extension scenarios (b/c), default to **conserving** existing elements unless explicitly told otherwise — see the "elements that need explicit confirmation" section in `references/discovery-questions.md`.

**For redesigns (scenario b):** before proposing any changes, complete the redesign audit process in `references/discovery-questions.md` section J2. The most common failure mode is tearing apart an existing design without understanding what already works.

### Step 2 — Pick an aesthetic direction

Commit to **one** direction and execute it precisely. Brutally minimal, maximalist chaos, retro-futuristic, editorial, playful — they all work, the differentiator is intentionality. A design that could be reused unchanged for a SaaS B2B, a vet clinic, and a fitness app has no direction; it's generic. Catalog of directions with full execution playbooks (typography, color, hero, cards, buttons, spacing, effects, icons, reference sites): `references/aesthetic-direction.md`. The direction label alone is not enough — follow the playbook for your chosen direction.

### Step 3 — Execute

Start from user intent, not aesthetics. Wireframe the core functionality based on the primary user goal before adding visual polish — if the goal is "search for property," start with the search input and mandatory fields as the focal point, not a background image. Then apply the universal principles (next section) and load the references relevant to the task scope. Reference index below.

### Step 4 — Run the delivery checklist

End of this file. Treat it as a hard gate.

## Universal principles at a glance

Full detail in `references/principles.md`. The seven that compound:

- **Visual hierarchy** drives attention with size, position, and color. Important = bigger, bolder, or more colorful. Group related elements; order them by importance.
- **4 or 8px spacing grid.** Every margin, padding, and offset snaps to it. In Figma, set "nudge amount" to 8.
- **One sans-serif** is enough for product UI. Headers: letter-spacing -2% to -3%, line-height 110-120%. Very large type (70px+) needs manual kerning.
- **Consistency** in corner radius, sizes, colors, and typography across components. Use a single icon library; icon size matches the line-height of the text it accompanies.
- **Every interaction has visible feedback.** Buttons need hover, active, and disabled states; inputs need loading, error, and success states.
- **Every element earns its place.** Shadows, gradients, animations are tools — each should have a clear job. If an element duplicates what another already communicates, one of them goes. See `references/principles.md` § "Purposeful elements."
- **Structure before effects.** Layout, section sequence, and typography hierarchy matter 10x more than shadows, gradients, or animations. Fix structure first. See `references/page-composition.md`.
- **Whitespace is part of the design.** Cramming is the easiest way to look amateur.

## Pro tips / cheat codes

- **Nested rounded corners.** When a rounded shape sits inside another, corners look uneven unless: `inner_radius = outer_radius - padding_distance`. In Figma, enable iOS Corner Smoothing.
- **Lose the lines.** Divider lines between rows usually add noise. Replace them with consistent spacing or subtle alternating row backgrounds.
- **User flow first.** Plan navigation, search, skip, back, and error states before designing screens. The gaps in these are what tag amateur work.
- **Effects with purpose.** Heavy shadows + glows + saturated gradients layered without intention = noise. But effects with clear jobs (elevation, depth, feedback, atmosphere) are essential for perceived quality. The question is not "how many effects?" but "does each effect have a job?" See `references/aesthetic-direction.md` § "Effects with purpose."

## Reference index

Load only what the task needs. Don't read all of these — the point of the split is that you pick.

| File | Load when… |
|---|---|
| [`references/discovery-questions.md`](references/discovery-questions.md) | Always first, on any new design or redesign task. The full discovery checklist and the rules for when to confirm vs change existing elements. |
| [`references/principles.md`](references/principles.md) | Drilling into hierarchy, spacing, typography rules, affordances, or feedback patterns. |
| [`references/color-system.md`](references/color-system.md) | Defining or auditing a color palette. Covers 60-30-10 (only as a starter heuristic), the 4-layer system for product, OKLCH, semantic colors, and brand adaptation. |
| [`references/modes.md`](references/modes.md) | Designing for light, dark, or both. Covers the mono-mode vs dual-mode decision and its downstream cost. |
| [`references/mobile.md`](references/mobile.md) | Designing for mobile: navigation, layout, gestures, empty states. |
| [`references/dashboards.md`](references/dashboards.md) | Designing dashboards or admin tools: sidebar, KPI layout, interaction patterns (popover/modal/toast), tables, snappiness. |
| [`references/data-visualization.md`](references/data-visualization.md) | Designing charts: legibility, axes, units, when labels are non-negotiable. |
| [`references/components.md`](references/components.md) | UI element specifics: cards, pricing, buttons, icons, modals, footers, chips, carousels. |
| [`references/aesthetic-direction.md`](references/aesthetic-direction.md) | Picking and committing to a visual direction. Full execution playbooks per direction (typography, color, hero, cards, buttons, spacing, effects, icons, reference sites). Also covers effects with purpose. |
| [`references/page-composition.md`](references/page-composition.md) | Designing full pages, landings, marketing sites, or multi-section layouts. Covers visual rhythm, section archetypes (alternatives to icon+title+desc), hero patterns, structure vs effects, and the scroll story. |
| [`references/typography-guide.md`](references/typography-guide.md) | Choosing fonts for a project or auditing typography choices. Covers font selection by domain/audience, pairing strategy, when defaults are the right choice, and licensing. |
| [`references/accessibility-and-ux-laws.md`](references/accessibility-and-ux-laws.md) | Auditing or designing for WCAG compliance, applying Laws of UX (Hick, Fitts, Miller, etc.), forgotten states (loading/empty/error), forms, microcopy, responsive breakpoints. |

## Anti-patterns to never ship

These tag a design as "AI-generated SaaS default". Each includes what to do instead — the blacklist alone strips things away without replacing them, which makes pages bare, not better.

- **Default fonts** without justification. **Instead:** choose by domain and audience per `references/typography-guide.md`.
- **Cliché color schemes** (purple-to-pink gradients, blue-to-purple CTAs, pastel rainbows, flat dark mode). **Instead:** build from brand + domain per `references/color-system.md`.
- **Predictable layouts** (centered hero + giant CTA, three-column icon-title-text features, circular-photo testimonials). **Instead:** use section archetypes from `references/page-composition.md`.
- **Identical component patterns** (same radius everywhere, default 0/4/12 shadows, same modal animation). **Instead:** vary by component type and elevation per `references/components.md`.
- **Cookie-cutter anything** — if it could serve three unrelated industries, it has no direction. **Instead:** pick and execute a direction playbook from `references/aesthetic-direction.md`.

## Implementation conventions (this repo)

Stack: Next.js 15 (App Router, standalone) · React 19 · TypeScript `strict: true` · Tailwind 4.

### Folder structure

```
frontend/src/
├── app/            App Router routes (page.tsx, layout.tsx, route.ts). Nested dirs for nested routes.
├── components/     Reusable components (PascalCase.tsx). Subdirs by feature (brechas/, pronostico/).
├── contexts/       Providers + hooks (AuthContext.tsx, FiltersContext.tsx).
├── lib/            Data hooks, shared utils, __tests__/.
└── utils/          Pure utilities (no React).
```

### Naming

- **Components**: `PascalCase.tsx`. **Hooks**: `useCamelCase.ts`. **Utils**: `camelCase.ts`.
- **Routes**: `app/<segment>/page.tsx`, `app/<segment>/layout.tsx`.
- **Contexts**: `XxxContext.tsx` — one file per context (provider + hook).

### Client vs Server Components

Components in App Router are Server Components by default. Add `'use client'` as the **first line** only when using hooks (`useState`, `useEffect`, `useRouter`, contexts).

### Props and types

Always type props with a separate `interface`. No `React.FC` — destructure props in the function signature. `strict: true` means: no implicit `any`, handle `null`/`undefined` explicitly, avoid `any` (comment why if unavoidable). Alias `@/*` → `src/*` for imports.

### Exports

**Default export** for components (one per file). **Named exports** for hooks, utils, types.

### State — Context API

The repo uses Context API for shared state (no Redux, no Zustand). Pattern: provider + `use<Feature>()` hook in `src/contexts/<Feature>Context.tsx`. Don't introduce another state library without an ADR.

### Styles

Tailwind 4 classes inline in JSX. No CSS modules, no styled-components. Reuse existing patterns for common UI (spinners, loading states).

For projects without a full design system, define a minimal set of design tokens as CSS variables (`--spacing-sm: 8px; --spacing-md: 16px; --color-accent: ...`) in the global CSS. This allows quick, global updates without enterprise-grade framework overhead. In Tailwind 4, `@theme` directives serve this purpose.

### Testing

Vitest + @testing-library/react. Tests in `src/lib/__tests__/` or co-located as `ComponentName.test.tsx`. If a component has non-trivial logic, write at least a happy-path test.

## Delivery checklist

Run this before declaring a design done. Each item is a hard gate.

### Design

- [ ] Clear visual hierarchy on every screen.
- [ ] Similar elements look identical (same radius, padding, color).
- [ ] Every interaction has feedback (hover, active, disabled, loading).
- [ ] Spacing follows a 4 or 8px grid.
- [ ] Color palette has a neutral foundation (4 background levels, strokes ~85% white) and functional scales — not single hex values.
- [ ] Light and dark modes have independent palettes (not inverses), with shades more spaced apart in dark mode.
- [ ] Semantic colors (red destructive, green success, etc.) are respected even when off-brand.
- [ ] Charts read in 3 seconds without explanation.
- [ ] All redundant elements removed (extra lines, labels, arrows).
- [ ] WCAG AA contrast met on all text/background combinations.
- [ ] Tap targets ≥44px on mobile.
- [ ] Forgotten states (loading, empty, error) are designed, not just the happy path.

### Implementation

- [ ] `'use client'` only where hooks or interactivity require it.
- [ ] Props typed with `interface`, no `any`.
- [ ] `npm run lint` passes with no type warnings.
- [ ] Responsive tested (at least mobile + desktop).
- [ ] Non-trivial logic has a Vitest test.
- [ ] No `console.log` or debug code left behind.
- [ ] Styles use Tailwind classes (no inline CSS except dynamic values).
- [ ] Imports use `@/*` alias where appropriate.
