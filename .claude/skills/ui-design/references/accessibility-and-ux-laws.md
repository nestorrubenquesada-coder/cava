# Accessibility, UX laws, and the often-forgotten

**Load when:** auditing accessibility, designing for WCAG compliance, applying behavioral psychology to a layout, designing forms or microcopy, or making sure the loading/empty/error states aren't being skipped.

## Accessibility (WCAG 2.1 / 2.2)

### Minimum contrast ratios

- Normal text (<18pt or <14pt bold): **4.5:1**
- Large text (≥18pt or ≥14pt bold): **3:1**
- UI components (input borders, functional icons, focus indicators): **3:1**
- For AAA level: 7:1 normal, 4.5:1 large.

### Sizing and spacing

- **Minimum body text size: 16px.** Below that gets uncomfortable on screen.
- **Line-height** of body: minimum **1.5x** font size.
- **Maximum line width** for long text: **80 characters** (~600-700px).
- **Tap targets on mobile**: minimum **44×44px** (Apple HIG) or **48×48px** (Material).

### Other rules

- **Visible focus indicators**: never remove the focus outline without replacing it with something equivalent.
- **Don't use color alone** to communicate state or meaning: add icons, text, or patterns.

### Five quick accessibility tests

1. **Contrast check**: Stark or Contrast in Figma over each text/background combo.
2. **Keyboard nav**: tab through the interface — do you reach everything? Can you see where you are?
3. **Screen reader**: VoiceOver (Mac) or TalkBack (Android) — does what gets read make sense?
4. **Zoom 200%**: does the layout break? Is the text still legible?
5. **Squint test**: blur your eyes until you can't see clearly — is the visual hierarchy still clear?

## Laws of UX (applied psychology)

Apply as heuristics, not rigid rules.

- **Jakob's Law**: users spend more time on other sites than on yours. They expect yours to work the same. **Use familiar patterns**, don't reinvent unless it adds real value.
- **Hick's Law**: more options = more decision time. Limit visible choices, group, use progressive disclosure.
- **Fitts's Law**: time to reach a target depends on its size and distance. **Primary CTAs = large and close to the flow**; destructive actions (delete, cancel) = smaller or further away.
- **Miller's Law**: working memory holds **7 ± 2 items**. Mandatory chunking in menus, forms, lists.
- **Tesler's Law**: every app has a minimum irreducible complexity. The question isn't how to eliminate it but **who carries it**: the system or the user. Make the system carry it.
- **Aesthetic-Usability Effect**: pretty is perceived as more usable. But that's not an excuse for pretty things that don't work.
- **Peak-End Rule**: people remember the **peak** and the **end** of the experience, not the average. Take special care with those two moments.
- **Doherty Threshold**: system responses under **400ms** feel instant. Above that, show feedback (skeleton, spinner, optimistic UI).
- **Von Restorff Effect**: things that look different are remembered more. Reserve "visual difference" for what you want to highlight.

## States almost always forgotten

- **Loading states**: any action >500ms needs feedback. Skeleton screens > generic spinners when you know the structure of the content coming.
- **Empty states**: never leave a screen blank. Explain what will appear there, show the primary CTA, and add an illustration or example if it helps.
- **Error states**: actionable errors ("couldn't save — retry") instead of generic ones ("error 500"). Inline form validation > validation on submit.
- **404 pages as brand moments**: treat error pages as an extension of your brand's voice, not a technical dead end. A custom illustration, an interactive mini-game, or a quirky character animation transforms user frustration into brand delight. For SaaS: keep the user in the product mindset (e.g., a relevant quiz or search). For consumer/creative brands: a custom illustration reinforces personality. Always include a clear path back (home link, search bar).
- **Success states**: confirm important actions with clear feedback (toast, chip, animation).
- **Partial states**: what happens with 1 item? 100? 10,000? Design all three.

## Forms and conversion

- **Minimize fields**: studies show 20-60% of fields in checkout/signup can be removed without losing useful data.
- **Inline validation**: validate while typing, not on submit.
- **Labels above the input** (don't use placeholders as labels — they vanish on type).
- **One field per line** unless they're naturally short (city/zip, date/time).
- **Explicit submit button**: "Create account", not "Submit".

## Responsive and mobile-first

- **Mobile-first**: design the smallest version first, then scale. Much easier than the reverse.
- **Common breakpoints**: 640px (sm), 768px (md), 1024px (lg), 1280px (xl), 1536px (2xl) — match Tailwind defaults.
- On mobile, cards and charts usually **stack vertically**. Think about priority order for that single column.

## Current trends (use with judgment, not by fashion)

- **Bento Box layouts**: content in segmented blocks, Japanese bento style. Excellent for dashboards and data-heavy home pages (Apple popularized it).
- **Glassmorphism**: translucent backgrounds with blur. Works well for overlays and nav bars over visual content.
- **Neumorphism**: soft shadows, tactile look. Polarizing — works for specific cases but fails in accessibility if abused.
- **Dark mode is no longer a trend, it's an expectation**. Design both modes from the start. See `modes.md`.
- **Microinteractions with purpose**: confirm actions, guide attention. Don't abuse; every animation costs attention and performance.

## Microcopy / UX writing

- **Buttons in imperative and specific**: "Save changes" > "OK"; "Delete account" > "Confirm".
- **Errors in human language**: "We couldn't send the file. Try again in a few seconds." > "Error 500".
- **Empty states with personality**: a simple line that orients, without being overly cute.
- **Consistent tone** across the app: if one screen is formal and the next is casual, it feels broken.
