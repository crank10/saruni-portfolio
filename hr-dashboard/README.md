# Interactive HR Analytics Dashboard

A Power BI-style interactive dashboard for analyzing and optimizing HR processes and workforce management at SME Corp.

## Features

- **Overview** — KPI cards (Headcount, Turnover Rate, Satisfaction, Open Positions), recruitment pipeline, turnover trends, satisfaction radar, performance distribution, headcount trends, engagement index
- **Recruitment Analytics** — Recruitment funnel with conversion rates, open positions by department, cost per hire trend, time to hire trend, detailed recruitment summary table
- **Workforce Analytics** — Gender diversity breakdown, age distribution, department turnover comparison, absenteeism rate, training budget by department, department headcount composition
- **Performance & Engagement** — Performance rating distribution, average performance by department, quarterly satisfaction trends, monthly engagement index
- **Predictive Analytics** — 6-month hiring needs forecast, headcount projection, turnover rate forecast, cost per hire projection (all using linear regression)

## Tech Stack

- Vanilla HTML / CSS / JavaScript
- [Chart.js 4.x](https://www.chartjs.org/) (loaded via CDN)
- Dark Power BI-inspired theme
- Fully responsive layout

## Quick Start

No build step or dependencies to install. Just open `index.html` in a browser:

```bash
# Option 1: Open directly
open index.html

# Option 2: Serve with Python
python3 -m http.server 8080
# Then visit http://localhost:8080

# Option 3: VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

## Project Structure

```
hr-dashboard/
├── index.html      # Page layout, sidebar navigation, KPI cards, chart canvases
├── styles.css      # Dark Power BI theme, responsive grid, card styles
├── data.js         # HR dataset (headcount, recruitment, turnover, satisfaction, etc.)
├── dashboard.js    # Chart rendering, KPI updates, navigation, filters
└── README.md       # This file
```

## Interactive Filters

- **Department** — Filter by Sales, Marketing, Operations, HR, or IT
- **Date Range** — Select From/To month to filter time-series charts and table data
- Click **Apply** to update all charts and KPIs

## Data Coverage

| Metric | Granularity | Range |
|--------|-------------|-------|
| Headcount | Monthly by department | Jan–Dec 2025 |
| Recruitment Pipeline | Monthly (applications → hired) | Jan–Dec 2025 |
| Turnover | Monthly (voluntary/involuntary) | Jan–Dec 2025 |
| Satisfaction | Quarterly by department | Q1–Q4 2025 |
| Performance | Annual distribution | FY 2025 |
| Engagement | Monthly index (0-100) | Jan–Dec 2025 |
| Cost per Hire | Monthly | Jan–Dec 2025 |
| Time to Hire | Monthly (days) | Jan–Dec 2025 |
| Forecasts | 6-month projection | Jan–Jun 2026 |
