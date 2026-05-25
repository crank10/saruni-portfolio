# CodeAlpha_RealEstateMarketTrends

A Power BI-inspired interactive dashboard analyzing real estate market dynamics for investment and development decisions. Built with vanilla HTML, CSS, and JavaScript using Chart.js.

## Features

- **KPI Cards** — Average Property Price, Rental Yield, Market Demand Index, Total Listings
- **Property Price Trends** — Multi-line chart tracking median prices across 5 regions
- **Rental Yield Analysis** — Bar chart comparing rental yields by region
- **Transaction Volume** — Monthly transaction volume tracking
- **Property Type Distribution** — Doughnut chart (Single Family, Condo, Townhouse, Commercial, Land)
- **Price per Square Foot** — Regional price/sqft trends over time
- **Days on Market** — Average selling time by region
- **Price Forecast** — 6-month linear regression projection
- **Mortgage Rate Trends** — 30-year fixed rate historical data
- **Market Demand vs Supply** — Dual index comparison with gap analysis
- **Economic Indicators** — GDP Growth, Interest Rate, Inflation, Unemployment
- **New Listings vs Sold** — Supply/demand flow analysis
- **Absorption Rate** — Market health indicator
- **Market Hotspots** — YoY price growth ranking by area
- **Geographic Heat Map** — Color-coded property value visualization by area
- **Rental Yield Radar** — Multi-region yield comparison

## Pages

| Page | Description |
|------|-------------|
| Overview | KPI cards, price trends, rental yields, transaction volume, property types, regional summary table |
| Pricing Analysis | Price/sqft trends, days on market, 6-month price forecast, mortgage rates |
| Demand & Supply | Demand vs supply indices, economic indicators, listings vs sold, absorption rate |
| Hotspots & Map | Market hotspots ranking, geographic heat map, rental yield radar |

## Tech Stack

- HTML5 / CSS3 / Vanilla JavaScript
- [Chart.js 4.x](https://www.chartjs.org/) for all visualizations
- Google Fonts (Inter)
- Dark Power BI-inspired theme

## Getting Started

Simply open `index.html` in a browser, or serve with any static file server:

```bash
npx serve .
```

## Interactive Filters

- **Region Filter** — Filter by Downtown, Suburbs, Midtown, Waterfront, Industrial
- **Date Range** — Filter by month range (Jan–Dec 2025)
- All charts and KPIs update dynamically based on filter selection

## License

MIT
