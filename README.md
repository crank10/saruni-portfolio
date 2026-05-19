# Financial Health Dashboard — SME Corp

A Power BI-inspired interactive financial dashboard for SME companies, built with vanilla HTML, CSS, and JavaScript using Chart.js.

## Features

- **KPI Cards** — Revenue, Expenses, Net Profit, Cash Flow with animated counters, sparkline mini-charts, YoY change badges, and target progress bars
- **Financial Health Score** — Composite gauge showing Liquidity, Solvency, Profitability, Efficiency, and Growth scores with animated progress bars
- **Income Statement** — Monthly breakdown with waterfall charts, margin analysis (Gross/Operating/Net), summary KPIs, and detailed table
- **Balance Sheet** — Assets vs Liabilities vs Equity, asset composition donut, debt-to-equity ratio trend, working capital analysis, Current/Quick ratio KPIs
- **Cash Flow Analysis** — Operating/Investing/Financing stacked breakdown, free cash flow trends, cash conversion cycle (DSO/DIO/DPO/CCC), and full cash flow statement table
- **Revenue Forecasting** — 6-month linear regression with 95% confidence interval bands
- **YoY Comparison** — FY 2024 vs FY 2025 revenue comparison bar chart
- **Interactive Filters** — Filter by department (Sales, Marketing, Operations, HR, IT) and date range with instant chart updates
- **Dark Theme** — Modern Power BI-inspired dark UI with gradient accents, hover effects, and smooth page transitions
- **Print Support** — Print-optimized styles with light theme and clean layout

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
| Overview | KPI cards with sparklines, financial health gauge, profitability trends, expense breakdown, revenue vs expenses, forecasting with confidence bands, YoY comparison |
| Income Statement | Summary KPIs (margins, EBITDA), revenue/COGS/OpEx/Net Income bars, margin trends, detailed monthly table |
| Balance Sheet | Summary KPIs (Current/Quick/D-E ratios), assets vs liabilities, asset composition donut, D/E ratio trend, working capital |
| Cash Flow | Summary KPIs (Operating/Investing/Financing/FCF), stacked cash flow breakdown, components donut, FCF trend, cash conversion cycle, cash flow statement table |

## License

MIT
