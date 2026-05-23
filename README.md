# Financial Health & HR Analytics Dashboard — SME Corp

A Power BI-inspired interactive dashboard for SME companies, built with vanilla HTML, CSS, and JavaScript using Chart.js. Includes both financial health analytics and a comprehensive HR analytics module.

## Features

- **KPI Cards** — Revenue, Expenses, Net Profit, Cash Flow with YoY change indicators
- **Income Statement** — Monthly breakdown with waterfall charts, margin analysis, and detailed table
- **Balance Sheet** — Assets vs Liabilities, asset composition, debt-to-equity ratio, working capital trends
- **Cash Flow Analysis** — Operating/Investing/Financing breakdown, free cash flow trends, cash conversion cycle
- **Revenue Forecasting** — 6-month linear extrapolation with visual forecast line
- **HR Analytics** — Recruitment pipeline, employee turnover, satisfaction surveys, performance distribution, engagement trends, headcount tracking, and predictive hiring forecasts
- **Interactive Filters** — Filter by department (Sales, Marketing, Operations, HR, IT) and date range
- **Dark Theme** — Modern Power BI-inspired dark UI with responsive design

## Tech Stack

- HTML5 / CSS3 / Vanilla JavaScript
- [Chart.js 4.x](https://www.chartjs.org/) for all visualizations
- Google Fonts (Inter)

## Getting Started

Simply open `index.html` in a browser, or serve with any static file server:

```bash
npx serve .
```

## Pages

| Page | Description |
|------|-------------|
| Overview | KPI cards, profitability trends, expense breakdown, revenue vs expenses, forecasting |
| Income Statement | Revenue/COGS/OpEx/Net Income bars, margin trends, detailed monthly table |
| Balance Sheet | Assets vs liabilities, asset composition donut, D/E ratio, working capital |
| Cash Flow | Stacked cash flow breakdown, components donut, FCF trend, cash conversion cycle |
| HR Analytics | Recruitment pipeline, turnover analysis, satisfaction radar, performance distribution, headcount trends, engagement index, hiring forecast, cost & time to hire |

## License

MIT
