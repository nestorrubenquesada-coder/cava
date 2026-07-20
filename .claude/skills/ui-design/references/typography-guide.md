# Typography guide

**Load when:** choosing fonts for a project, auditing typography choices, or when the aesthetic direction requires a font pairing decision. Covers font selection by domain and audience, pairing strategy, when defaults are the right choice, and licensing.

## Font selection by domain and audience

The most common typography mistake is choosing a font because it "looks cool" without considering who will read it and in what context. A serif display font signals editorial luxury — on a precision agriculture platform, it signals "wrong audience." Use this matrix to narrow the field before browsing specimens.

### Agriculture / industrial / field tools

**Signal:** authority, clarity, no-nonsense reliability.

Farmers, agronomists, and field technicians need data-dense interfaces that read fast. Typography should disappear into the content, not call attention to itself.

- **Display:** DM Sans (bold weights), Satoshi, Manrope. Geometric sans with wide apertures and clear letterforms.
- **Body:** Same family at regular weight. One font family is enough.
- **Avoid:** editorial serifs (Playfair Display, PP Editorial), playful rounded fonts (Quicksand, Nunito), decorative display fonts. These mismatch the audience's expectations and the content's density.
- **Inter is fine here.** A data-dense dashboard benefits from typographic neutrality. The "avoid Inter" rule is about lazy defaults in expressive contexts, not about Inter being a bad font.

### Fintech / banking / insurance

**Signal:** trust, precision, stability.

Users need to feel their money or data is safe. Typography should be authoritative without being cold.

- **Display:** Tiempos Headline, GT Sectra, Source Serif 4 (free). Serifs convey tradition and seriousness.
- **Body:** Inter, Söhne, Instrument Sans. Clean sans that reads well at small sizes. **Tabular lining figures** matter — numbers must align in columns.
- **Avoid:** playful or casual fonts, anything with a "startup" feel (Space Grotesk, Clash Display).

### Creative / agency / portfolio

**Signal:** personality, distinction, artistic confidence.

Maximum typographic freedom. This is where personality fonts earn their place.

- **Display:** PP Editorial New, Migra, ABC Diatype, Right Grotesk, Neue Montreal. Choose based on the specific aesthetic direction.
- **Body:** can be more expressive than other domains — ABC Favorit, Söhne, Akkurat.
- **Avoid:** nothing is off-limits, but avoid combinations that fight each other (two display fonts competing for attention).

### SaaS / productivity tools

**Signal:** clarity, efficiency, modernity.

Users spend hours in the interface. Typography should be effortlessly readable and not fatiguing.

- **Display:** Instrument Sans, Plus Jakarta Sans, Geist, General Sans. Modern geometric sans with slight warmth.
- **Body:** Same family or a complementary sans at regular weight.
- **Avoid:** serif display fonts (they signal editorial, not efficiency), overly geometric fonts like Futura (fatiguing at small sizes over long sessions).

### Health / wellness / fitness

**Signal:** approachable warmth, care, accessibility.

Users may be anxious, in pain, or unfamiliar with technology. Typography should feel human and inviting.

- **Display:** Source Sans 3, Lato, Nunito Sans (not Nunito — the rounded version is often too casual). Humanist sans with open apertures.
- **Body:** Same family. Generous sizing — lean toward 18px body, not 16px.
- **Avoid:** cold geometric sans (Helvetica, Roboto), anything that feels clinical or technical.

### E-commerce / retail

**Signal:** depends on market segment.

- **Luxury retail:** editorial serif display (Canela, Cormorant, Noto Serif Display) + clean sans body. Signal sophistication.
- **Mass market:** friendly sans for everything (DM Sans, Plus Jakarta Sans). Signal accessibility and speed.
- **Discount / deals:** bold sans display (Archivo Black, Work Sans Bold). Signal urgency and value. Higher contrast, larger type.

### Government / education / nonprofit

**Signal:** accessibility first, democratic clarity.

Audiences are diverse in age, ability, and device quality. Accessibility is non-negotiable.

- **Display + Body:** Atkinson Hyperlegible (designed for low vision), Public Sans (US government standard), Recursive (variable, highly readable). All free.
- **Avoid:** decorative fonts, low-contrast typefaces, fonts with ambiguous letterforms (where I/l/1 or O/0 look similar).

## Pairing strategy

### The mechanical rule

Contrast in **category** (serif + sans, geometric + humanist), harmony in **weight and x-height**. If two fonts have similar x-heights, they'll feel balanced even if they're from different families.

### Safe pairings that always work

- **Serif display + sans body:** the classic. Serif headlines add gravity; sans body reads well at small sizes.
- **Geometric display + humanist body:** geometric headlines (Satoshi, DM Sans) feel modern; humanist body (Source Sans, Lato) adds warmth.
- **Same family, different weights:** one variable font with a good weight range (300-800) covers display + body without conflict. Simplest approach, lowest risk.

### Mood-specific pairings

- **Editorial authority:** PP Editorial New (display) + Söhne (body). Magazine tension.
- **Tech precision:** Geist (display) + Geist Mono (code/data). Developer-friendly.
- **Warm professionalism:** Source Serif 4 (display) + Source Sans 3 (body). Free, well-designed, excellent language support.
- **Agricultural clarity:** Satoshi (display, bold) + Satoshi (body, regular). One font, two weights. Honest and clean.

### The one-font strategy

For product UI, dashboards, and data-dense interfaces, a single variable font with weights 300-800 often works better than a pair. It eliminates font loading overhead, guarantees visual consistency, and reduces decisions.

Good candidates for single-font: Inter (yes, intentionally), DM Sans, Plus Jakarta Sans, Instrument Sans, Geist.

## When defaults ARE the right choice

The "avoid Inter/Roboto" rule exists to prevent lazy defaults in **expressive contexts** (landings, marketing, brand experiences) where typography is a primary differentiator. But there are contexts where typographic neutrality is the goal:

- **Internal tools and admin panels:** users care about the data, not the font. Inter, Roboto, or system fonts are correct.
- **Data-dense dashboards:** the font should not compete with charts, numbers, and tables. Neutral sans with good tabular figures wins.
- **Developer-facing products:** monospace or system fonts signal "this is a tool for people like you."
- **Multi-language applications:** Inter and Roboto have excellent Unicode coverage. A distinctive font with poor CJK/Arabic support is worse than a neutral font that works everywhere.

The rule is not "never use Inter" — it's "don't use Inter because you didn't think about it."

## Licensing and practical considerations

### Google Fonts — the distinctive ones

Most Google Fonts are overused. These are genuinely good and less common:

- **DM Sans / DM Serif Display:** well-designed pair. Free.
- **Instrument Sans / Instrument Serif:** modern, clean. Free.
- **Plus Jakarta Sans:** warm geometric sans. Free.
- **Source Serif 4 / Source Sans 3:** Adobe's contribution. Excellent quality. Free.
- **Cormorant:** beautiful display serif for luxury contexts. Free.
- **Atkinson Hyperlegible:** designed for accessibility. Free.

### Fontshare — hidden gems (free for commercial use)

- **Satoshi:** geometric sans, excellent for tech/product.
- **General Sans:** versatile, slightly warmer than Satoshi.
- **Clash Display:** bold display sans for headlines.
- **Cabinet Grotesk:** distinctive geometric with character.

### Paid foundries worth the investment

- **Grilli Type:** GT Sectra, GT America, GT Walsheim. Swiss precision.
- **Pangram Pangram:** Neue Montreal, Right Grotesk, Editorial New. Good value.
- **Colophon Foundry:** Söhne, Aperçu. High-quality workhorse fonts.

### Variable fonts

Prefer variable fonts when available. Benefits:
- **Single file** covers all weights (smaller total download than multiple static files).
- **Fine-grained weight control** for responsive design (heavier on large screens, lighter on small).
- **Animation** — weight, width, and optical size can transition smoothly.

### Loading strategy

- Always set `font-display: swap` to prevent invisible text during load.
- Preload the primary font (`<link rel="preload" as="font">`).
- Subset to the character sets you actually need (Latin, Latin Extended) to reduce file size.
- For Next.js: use `next/font` — it automatically optimizes loading and eliminates layout shift.
