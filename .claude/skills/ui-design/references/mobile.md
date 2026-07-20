# Mobile design

**Load when:** designing for mobile (web or native), or adapting a desktop design for small screens. For breakpoints and the responsive sizing rules, see `accessibility-and-ux-laws.md`.

## Navigation

- **Floating bottom nav**, 3 to 5 links max, **44px** minimum touch targets.
- If you have more links than fit, turn the sidebar into a **dedicated home page** instead of cramming a drawer full of stuff.
- If icons aren't obvious, add labels. Active-state indicator always visible.

## Layout and scale

- Type scale on mobile should be **equal to or larger** than desktop (iOS uses 17px as base).
- **One scroll direction per section**: never ask for vertical and horizontal scroll at the same time.

## Building blocks

- Use cards to group content (whitespace is limited).
- **Don't nest cards inside cards**: the doubled padding squeezes the entire interface. Instead of wrapping groups in a container with background and border, use a flex column with `gap: 16px` to define groups — whitespace does the grouping work without the padding tax.

## Focus and context

- **One screen, one primary task.**
- Use **bottom sheets** for secondary actions without removing the user from the current context.

## Gestures

- Lean on familiar gestures (swipe right = back, swipe up = search) and educate the user about them.
- **Contextual actions**: show only what's needed for the current task.

## Empty states

- **First-time empty:** use a full-screen layout that draws focus to the primary action button (e.g. a centered "+" or "Create first item"). The empty state is an onboarding moment — guide the user to their first action.
- **Search empty:** when a search returns no results, offer helpful suggestions ("Try a shorter query", "Check spelling") and a clear button to reset the search. Don't just say "No results."
- Add useful instructions or illustrations. Empty whitespace alone is a missed opportunity.
- See `accessibility-and-ux-laws.md` for the broader treatment of empty/loading/error states.

## Mobile-first as a working method

- Design the smallest version first, then scale up. Much easier than the reverse.
- On mobile, cards and charts usually **stack vertically**. Think about priority order for that single column.
- Common breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl), 1536px (2xl) — match Tailwind defaults.
