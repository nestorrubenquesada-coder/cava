# Discovery questions

**Load when:** starting any design work — new screen, redesign, or extension. Before writing CSS or moving pixels in Figma. The four blocking questions are A, B, D, and G; the rest sharpen the result.

The first question (A) gates everything else. Answer it before reading the rest of this file.

## A. Type of work — the question that frames everything

> Which of these three scenarios are we solving?
>
> 1. **New page or screen from scratch** — no prior design system, full aesthetic freedom.
> 2. **Visual restructuring of something existing** — redesign, modernization, or fixing concrete problems.
> 3. **New screen following an existing visual style** — consistency with a prior system.

The answer changes the rest of the questions:

- **In #1**, ask about colors, typography, tone, references.
- **In #2**, ask for screenshots of the current state + what problems it has + what to preserve.
- **In #3**, ask for the design system, screenshots of neighboring screens, component library, color tokens.

## B. Context and users

- What problem does this UI solve? What's the user's primary task on this screen?
- Who uses it? (general public, power users, internal teams, paying customers)
- What's the expected technical expertise level?
- Daily, weekly, or occasional use?
- Internal (private tool) or public-facing?
- What's the use context? (office, mobile, dirty hands in the field, multitasking)
- Success metrics? (conversion, completion rate, task time, satisfaction)

## C. Platform and devices

- Mobile, desktop, both? Which is primary?
- If responsive, what are the key breakpoints?
- Web, native app (iOS/Android), or both?
- Legacy browsers or modern features (CSS Grid, container queries)?
- Tablets in scope or not?

## D. Visual identity and design language

- Does a design system exist? If yes, link or file.
- Brand colors? (preferably HSB or with all tints/shades)
- Defined typography? (family, weights, sizes)
- Iconography: specific library or style (outline / filled / duotone)?
- **System modes** (decide before defining the palette — see `modes.md`):
  - Does the product support **one mode** (light only or dark only) or **both**?
  - If dual-mode, what's the **default**? Does it follow OS preference?
  - If dual-mode, can the user override and persist the choice?
  - If mono-mode, is there a future plan to add the other? (Changes whether to use semantic tokens now or absolute colors.)
  - Theming beyond light/dark? (brand variants, high-contrast mode)
- Forbidden colors or ones to avoid? (brand reasons or clash with neighboring product)
- **Tone and personality**: formal or casual? Minimalist or expressive? Technical or friendly? Serious or playful?
- **Visual references**: 2-3 products whose aesthetic you like? Links or screenshots.
- **Anti-references**: any design you do NOT want to look like?

## E. Content

- Is there real copy or are we working with placeholders?
- Real data for charts/tables, or lorem ipsum / fake data?
- **Edge cases**: what happens with very long text, empty lists, load errors, negative values?
- Single language or multi-language? (Affects layout: German expands, Chinese contracts.)
- Sensitive content requiring disclaimers or special treatment?

## F. Components and functionality

- What concrete elements does the screen need? (forms, tables, charts, cards, lists, modals, toasts)
- What interactions must be supported? (hover, drag-and-drop, swipe, multi-select, search)
- Special widgets? (calendars, file upload, maps, video players, rich text editors)
- States to cover? (loading, empty, error, success, partial, no-permission)

## G. Technical constraints

- Frontend framework? (React, Vue, Svelte, vanilla, Angular)
- CSS approach? (Tailwind, CSS Modules, styled-components, plain CSS, design tokens)
- Component library in use? (shadcn/ui, MUI, Ant Design, Radix, Chakra, custom)
- Icon library? (Lucide, Heroicons, Phosphor, Feather, Tabler, custom)
- Chart library? (Recharts, Chart.js, D3, Plotly, ECharts)
- Performance constraints? (bundle size, limited animations, low-end device support)

## H. Accessibility and inclusion

- WCAG level required? (AA is the de facto standard; AAA for government/health/education)
- Screen reader support mandatory?
- Internationalization / RTL (Arabic, Hebrew)?
- High-contrast mode?
- Audience age constraints (children, older adults)?

## I. Expected output

- Visual mockup (Figma, image) or **functional code** (HTML/CSS, React component)?
- If code: single file or project structure? With or without real state?
- Single isolated screen or full flow (multiple connected screens)?
- Expected fidelity? (wireframe → high-fidelity → production-ready)
- Deadline or scope constraints?

## J. Restructure-only questions (scenario #2)

- What are the 3 worst problems with the current design?
- What metrics or user feedback motivate the redesign?
- Are there elements that **must be preserved** for brand recognition or usability?
- Pure visual redesign or also flow/function changes?
- Need to maintain compatibility with the previous version during a transition?

## J2. Redesign process — before touching anything (scenario #2)

In redesign scenarios, the most common failure mode is tearing apart an existing design based on aesthetic preferences without understanding what already works. This sequential process prevents that.

**Complete these steps before proposing any visual changes:**

1. **Audit the current state.** Read the existing design without judging. List every element, section, pattern, and interaction present. Take screenshots or notes.

2. **Identify what works and WHY.** For each element, ask:
   - Does this serve the user's primary task?
   - Does it carry brand meaning or internal semantic meaning (see section L)?
   - Has the user built a habit or muscle memory around it?
   - Is there evidence it performs well (analytics, feedback, lack of complaints)?
   - Mark these as **PRESERVE**. The burden of proof is on changing them, not keeping them.

3. **Identify what fails and WHY.** For each problem, ask:
   - Is this a **structural problem** (wrong layout, wrong section sequence, wrong hierarchy)?
   - Or a **surface problem** (wrong color, wrong font, wrong effect)?
   - Structural problems matter 10x more than surface problems — see `page-composition.md` § "Structure > Effects."
   - Mark as **MODIFY** (keep the element, change its execution) or **REMOVE** (the element doesn't serve a purpose).

4. **Present the change plan.** Before executing anything, present to the user: "Here's what I plan to **preserve** [list], **modify** [list with rationale], and **remove** [list with rationale]. Confirm before I proceed."

5. **Execute changes in order:**
   - (a) Structural fixes first (layout, section sequence, hierarchy).
   - (b) Typography, color, and spacing second.
   - (c) Effects and polish last.
   - Never start with effects — that's how redesigns go wrong.

6. **Compare before and after.** Does the redesign preserve what worked? Does it fix what was broken? Did it introduce new problems?

## K. Extension-only questions (scenario #3)

- Pass me the design system or link to its docs.
- Screenshots of 2-3 existing screens that are aesthetically representative.
- Which components already exist and must be reused vs which can I create new?
- Are there color/spacing/typography tokens already defined? (CSS variables, Figma styles)
- Is there a "stack" of similar screens to the one I'm building? (e.g. "it's like the customer detail but for vendors")

## L. Changes that need explicit confirmation (scenarios #2 and #3)

**Prerequisite:** In redesign scenarios (#2), the agent MUST complete the audit process in section J2 above before proposing changes. The most common failure mode is tearing apart an existing design without understanding what already works.

Some elements should **never be modified without asking first**, even if "they look better" or "follow best practices" from this skill. Changing them can break user habits, internal product semantics, or brand recognition, and the cost to the end user usually outweighs the visual improvement.

**Before changing any of these, the agent ASKS:**

### Frequently used elements

- Buttons, links, or controls that appear on screens used daily.
- Position or shape of primary navigation.
- Established keyboard shortcuts, gestures, or shortcuts.
- Any element the user has memorized through repetition.

> *"I see the primary button on screen X is in the top-right corner across the product. Should I move it or respect that?"*

### Elements with internal semantic meaning

- **Colors assigned to specific categories or states** of the product (e.g. "blue = active customer", "orange = batch in progress"). Even if they don't follow the standard semantic convention (red = error), they may carry an internal meaning users have learned.
- **Icons with conventional meaning** within the product, even if not the most universal ones.
- **Specific terminology** of the product or industry (button labels, section names, internal jargon). The user may have memorized "Gaps" — changing it to "Differences" breaks their mental map.
- **Metrics or KPIs in fixed positions** that the user already scans automatically.

> *"Yellow appears multiple times in the current UI for what looks like a warning state. Does it have a specific meaning I need to respect?"*

### Conventions that differ from standards

If the app breaks a common convention (e.g. uses yellow where most use green, or puts the menu in an unusual place), **it's probably a deliberate decision or an established habit**. Don't "fix" it unilaterally.

> *"I noticed the product uses X where the convention would be Y. Is that a conscious design decision you want to keep, or is it legacy we're using this opportunity to correct?"*

### Established interaction patterns

- How actions are confirmed (modal vs toast vs nothing).
- How navigation between detail levels works.
- Animation timings and curves.
- The way errors or feedback appear.

### Brand and identity elements

- Logo, lockups, primary color.
- Corporate typography.
- Voice and tone / copy personality.

## Operational rule

Before changing anything in scenarios #2 or #3, the agent asks itself two questions:

1. **Is this used a lot?** If it appears on frequent screens or the user interacts with it daily → ask before changing.
2. **Could this carry meaning I'm not seeing?** If a color, position, icon, or name looks arbitrary but might communicate something internal → ask before changing.

If the answer to either is "yes" or "I'm not sure", ask. The right framing is not "I'm going to change X" but: *"X is currently this way. I see it could be improved by doing Y, but before touching it: does it have a use or meaning I need to respect?"*

## General rule

> **Don't start designing until questions A, B, D, and G are answered.** Without those, any output is guessing dressed up as a proposal.

If the user can't or won't answer something, **state the assumption explicitly** ("I'll assume desktop-first, light mode default, no prior design system") so they can correct early.

**In redesign or extension scenarios (#2 and #3)**: when in doubt between changing or preserving an existing element, **preserving is the default**. Unsolicited "improvements" are usually noise to a user who already built habits on the current version.
