# Charts and data visualization

**Load when:** designing charts, graphs, or any data display. Pairs with `dashboards.md` (where to place charts) and `color-system.md` § "Layer 3 — Semantic communication" (OKLCH for series colors).

## Legibility first

- **Avoid curved lines** in line charts: they obscure exact data points.
- Include **horizontal gridlines** to make values readable.
- Clear markers on each data point.
- If there's room, add **legends** and comparisons against the previous period.

## No over-styling

- No unnecessary decorations that hide the data.
- Include only the axes that are actually needed. Rule is functional, not aesthetic.
- For dashboards: data should be understandable in 3 seconds without explanation.
- **Data-ink ratio (Tufte)**: if a pixel doesn't carry new information, remove it. No heavy gridlines, decorative borders, or 3D. Avoid rounded tops on bar charts — they make precise value reading difficult and add purely decorative complexity.
- **Never truncate the Y axis** to exaggerate trends — it's misleading.
- **Progress and status indicators:** use distinct visual contrast between states — high-saturation color for "completed" (e.g., saturated blue or green), desaturated gray for "incomplete." Never use the same color at different opacities for different states (ambiguous). Replace vague labels ("In Progress") with precise percentages or counts when possible — they give the user actionable data, not descriptions.

## Axes and units

By default: **each axis must make clear what it represents and in what unit it's measured**. An axis without a unit invalidates the chart when the unit changes meaning (kg/ha vs t/ha, USD vs ARS, mm vs inches, NDVI 0-1 vs percentage).

**Practical rule**: the unit appears **once**, in the most efficient location. Repeating it in three places is noise.

Valid places to put it:

- **Chart title** (e.g. "Yield in kg/ha by plot") — then the axis label can be lighter or absent.
- **Axis label** (e.g. "Yield (kg/ha)").
- **Value format** (e.g. "$50K", "$100K") — then a "USD" label is redundant.
- **Tooltip on hover** — valid if the chart is exploratory and values change meaning on drill-down.

When the axis label **can be omitted**:

- **Time axes** with explicit dates ("Jan", "Feb", "Mar") — the unit reads itself.
- **Sparklines and mini-charts inside cards** — the card context tells the story; axes vanish.
- When axis values already carry the unit symbol.

When it's **non-negotiable**:

- **Two Y axes** (e.g. yield in kg/ha + rainfall in mm): units are the only way to know which axis reads which series. Bonus: **color-code each series with its axis label color** to reinforce the match.
- Data where the unit changes operational decisions (prices, yields, doses, conversions).
- Cross-region or cross-period comparisons where units might vary.

## Choosing chart types — quick guide

- **Bar chart** for comparing categories.
- **Line chart** for trends over time.
- **Stacked bar / area** for parts of a whole over time — but careful, hard to read individual series.
- **Pie chart** only for ≤3-4 categories that clearly add up to 100%. Otherwise, use a horizontal bar chart.
- **Sparkline** inside a card or KPI for at-a-glance trend without spending real estate.
- **Heatmap** for matrix data (categories × time, or two categorical dimensions).
- **Scatter plot** for relationships between two continuous variables.

## Color for series

- Use **OKLCH** with fixed lightness and chroma + hue steps of 25-30 to get visually equal brightness across series. See `color-system.md` § "Layer 3".
- Don't use red/green pairs as the only distinction (color-blindness). Add a shape or pattern variation if the chart depends on telling them apart.
- Reserve semantic colors (red, green, yellow) for series that genuinely mean error/success/warning. Otherwise the user reads emotional cues that aren't there.

## Empty and loading states

- Empty chart: explain what would appear there ("No data for this date range. Try expanding to last 30 days.").
- Loading: a skeleton chart (axes + gray rectangles where bars/lines will be) reads faster than a spinner.
