# Dashboards and admin UI

**Load when:** designing dashboards, admin panels, BI tools, or any data-dense desktop interface. Pairs with `data-visualization.md` (chart-specific rules) and `components.md` (cards, tables, modals).

Most universal principles still apply, but dashboards have specific concerns around density, navigation, and layout. This file covers them.

## General principles

- Maximum information density possible: tables, multiple charts, complex layouts.
- Use multi-column grids, but respect whitespace so it doesn't saturate.
- **Single typography**, clear hierarchy between primary KPIs and secondary metrics, neutral colors as base with accents only on what needs attention.
- Hover states and tooltips gain importance (they don't exist on mobile).

## Sidebar — the spine of the product

The sidebar is the dashboard's spine: it hosts global navigation, profile management, and search. If the sidebar is wrong, the whole product feels disorganized.

- **Group links by relevance** to reduce cognitive load. Items used rarely (settings, help, logout) go **at the bottom**, visually separated from the rest.
- **Recognizable icons + short titles**: the icon alone isn't enough unless it's universal. Text + icon is the safe default.
- **Clear active state**: an indicator rectangle, a different background, or a side border. The user must know where they are without thinking.
- **Profile and search** usually go at the top of the sidebar (or in the header if the sidebar is dense).
- **De-clutter the navbar:** replace generic text labels ("Menu", "Dashboard", "Settings") with identity-anchored components — a user avatar with dropdown for account switching, icon-only items for universally understood actions. Text labels in the navbar should be reserved for sections that genuinely need naming. Fewer words = faster scanning.

## Dashboard layout

- **One screen, one main objective.** The most common mistake is the "junk drawer": piling in everything that exists "because it might be useful". A dashboard that does one thing well gets used; one that does ten things badly gets abandoned.
- **Information hierarchy**: most important up top (project status, key KPIs, actionable alerts). Detail goes below or in drill-down.
- **Typography and density**: dashboard features are smaller and more compact than a landing page — **do not copy landing page font scales.** Use 12-13px for metadata and table cells, 14px for body content, 16-18px for section headers. To handle that density without feeling cramped: **strict grid** (12-column standard), consistent spacing (16px between elements, 32px between sections).
- **Clean charts**: gridlines, data labels, and simple summaries. No needlessly complex visuals. Rule: every decoration must justify the space it occupies.

## Reading patterns and layout rules

- **5-second rule**: if a user can't identify the key insight in 5 seconds, redesign.
- **F-pattern**: eyes scan dashboards in an F (top-left → top-right → down the left side). Primary KPI top-left, secondary top-right, detail below. Assign a priority tier (High/Mid/Low) to every widget and use CSS Grid areas to enforce placement: `grid-template-areas: "tasks tasks stats" "cards cards stats";`.
- **Maximum 5-9 metrics per screen** (Miller's law). More than 12 KPIs = 40% engagement drop.
- **Inverted pyramid**: actionable up top, detail at the bottom.
- **"Compared to what?"**: an isolated number means nothing. Every metric needs context: vs prior period, vs target, vs cohort/industry.

## Interaction patterns

Choosing well between these three saves the user clicks and context switches:

- **Popovers**: for simple, **non-blocking** context. The user can click outside to dismiss. Ideal for auxiliary info, small menus, previews.
- **Modals**: for **complex actions** (creating a new item, editing a large record) that require full focus. Keep the user on the same page flow without losing context behind.
- **Toast notifications**: to **confirm actions** or give system feedback (saved, error, lost connection) **without interrupting** what the user is doing. They appear, live a few seconds, leave.

Quick rule: if the action is one simple step and reversible → toast. If it has several fields and needs attention → modal. If it's info the user will read and dismiss → popover.

## Core dashboard components

- **Lists and tables**: clear row separation using **space, lines, or alternating row backgrounds** (one of the three, not all three). Make them interactive: **filters, column sort, search**. A static table in a product dashboard is a missed opportunity.
- **Cards**: to group related content (a KPI widget, a mini-chart with title and legend). Generous margins so they don't feel cramped together.
- **User inputs (forms and settings)**: intuitive, labels above, inline validation, sensible defaults.
- **Tabs**: the best way to **switch between related views without saturating the sidebar**. If you have "Overview / Detail / History" for the same entity, those are tabs, not separate nav items.

## Optimizing the "feel" (snappiness)

The difference between a dashboard that feels expensive and one that feels bootcamp is almost always feedback microdetails:

- **Microinteractions**: hover states with smooth transitions, 150-200ms show/hide animations, decent easing (not linear). These details make the UI feel "responsive" even when the network is slow.
- **Optimistic UI**: when an action has very high probability of success (e.g. delete an item, mark as read, add a tag), **reflect the change in the UI immediately** without waiting for server confirmation. If the server fails, revert and show error. The perceptual difference between "0ms until change appears" and "400ms until change appears" is huge.
- **Skeleton screens > spinners**: if you know the structure of what's coming (a table, a card), show a gray skeleton in its place while loading. Users perceive load time as faster.

## Integrate actions into their context

Never force the user to navigate to a separate page just to toggle a state or see status information. Embed actions directly into the component they affect:

- A "lock card" toggle belongs on the card component itself, not on a separate settings page.
- A status indicator (active/paused/disabled) belongs next to the entity name, not in a distant status page.
- Use visual state changes (greyed-out overlay, locked icon) to provide immediate feedback without leaving the current view.

The principle: if an action affects a specific entity, the control for that action lives on that entity's component.

## Avoid "Dribbble-style" decoration

Decorative elements that don't convey data are noise in a dashboard. Floating blobs, ornamental shapes, tiny navigation dots, and charts that are too small to read are hallmarks of designs optimized for screenshots rather than for use.

- If you include a chart, it must be readable at its rendered size. If it's not, swap it for a number + sparkline or remove it entirely.
- If a component exists only to "fill space" or "look interesting," remove it. Dashboards are tools, not art installations.
- **Brand watermarks as an exception:** to add subtle branding to functional cards (e.g., a credit card component, a membership badge), scale the brand logo up and set `opacity: 0.05` to `0.1`, placed behind the card's primary content. This provides bespoke branding without clutter.

## KPI placement — don't repeat, consolidate

Showing the same four KPI cards (revenue, users, growth, churn) as a header on every page is a hallmark of AI-generated apps that lack information hierarchy. Instead:

- **Show KPIs only where they are relevant.** A settings page doesn't need a KPI header. A detail view needs metrics specific to that entity, not global dashboard numbers.
- **Create a dedicated Analytics tab** (or Overview screen) that consolidates all high-level metrics in one place with proper context (comparisons, trends, sparklines).
- **For entity-specific metrics** (e.g., a single customer's activity), use a compact two-column layout with small doughnut charts or sparklines — not the same global KPI bar copy-pasted.
- The rule: each metric appears **once**, on the screen where it's most actionable. If a user needs it on another screen, they navigate to it — that's what navigation is for.

## Other rules worth keeping

- **Never truncate the Y axis** to exaggerate trends — it's misleading. See `data-visualization.md`.
- **Replace speedometers/gauges** with compact numbers + sparklines: same info in 10% of the space.
- **Progressive disclosure**: drill-down from overview to detail, not everything open at once.
- **Design for one persona, not all of them**: multi-audience dashboards fail. If there are several roles, build several dashboards on the same data source.
